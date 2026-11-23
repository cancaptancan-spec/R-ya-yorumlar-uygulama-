import { Router, type IRouter } from "express";
import {
  GenerateDreamSceneBody,
  GenerateDreamSceneResponse,
  InterpretDreamBody,
  InterpretDreamResponse,
} from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";
import { generateImageBuffer } from "@workspace/integrations-openai-ai-server/image";

const router: IRouter = Router();

const interpretationInstructions = `You are a careful Turkish-language assistant offering reflective guidance informed by classical Islamic dream literature and Prophetic etiquette. You are not a real scholar, do not issue fatwas, and do not claim certainty or knowledge of the unseen. Never present dreams as predictions or guaranteed outcomes. When relevant, mention the broad interpretive tradition associated with İbn-i Şirin and İmam Nablusi without inventing quotations, sources, or claiming an exact derivation. Acknowledge that dreams may be rahmani/salih, nefsani, or distressing; do not classify with certainty.

Return ONLY valid JSON with exactly these fields: wisdom (string), symbols (array of objects with symbol and meaning strings), detailedInterpretation (string), dua (string), asmaSuggestion (string), dhikr (string), nightmareAdvice (string or null), scenePrompt (string), disclaimer (string). All fields except scenePrompt must be fluent, natural Turkish. Keep wisdom to 30-45 words, detailedInterpretation to 70-90 words, symbols to at most 3 concise entries, dua to at most 25 words, and each asmaSuggestion and dhikr to at most 20 words so the creator's 9:16 card can display the full guidance. scenePrompt must be a vivid, concise English visual brief grounded in the dream's exact setting and central objects; retain distinctive details such as a vehicle, road, water, garden, or mountain when present instead of replacing them with a generic landscape. Describe only safe, serene scenery, natural light, architecture, plants, and abstract geometric ornament. Do not write exclusions or negative instructions in scenePrompt.

For a nightmare/kabus, nightmareAdvice must come FIRST in spirit and give established Prophetic etiquette gently: seek refuge in Allah from its evil and from Shaytan, lightly blow/spit dryly to the left three times, turn to the other side, and if desired pray; avoid sharing a disturbing dream. Do not shame or frighten. Make the reflection modest, compassionate, and useful. For dua, provide a short general supplication in Turkish or a clearly identified authentic, familiar supplication; do not invent Arabic religious text or attach unsupported rewards. For asmaSuggestion, offer an optional remembrance of a well-known Name of Allah only when appropriate, without claiming a guaranteed effect or special reward. For dhikr, give a gentle optional practice, not a guarantee. The interpretation is reflection, not a decision-making authority.`;

router.post("/dreams/interpret", async (req, res): Promise<void> => {
  const input = InterpretDreamBody.safeParse(req.body);
  if (!input.success) {
    req.log.warn({ issueCount: input.error.issues.length }, "Invalid dream interpretation request");
    res.status(400).json({ error: "Lütfen rüya metnini ve bağlam seçeneklerini kontrol edin." });
    return;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.6-terra",
      max_completion_tokens: 8192,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: interpretationInstructions },
        {
          role: "user",
          content: JSON.stringify({
            dream: input.data.dream,
            timeOfDream: input.data.timeOfDream,
            dreamType: input.data.dreamType,
            username: input.data.username,
          }),
        },
      ],
    });

    const content = completion.choices[0]?.message.content;
    if (!content) {
      req.log.error("AI returned an empty interpretation");
      res.status(502).json({ error: "Tabir şu anda hazırlanamadı. Lütfen biraz sonra yeniden deneyin." });
      return;
    }

    let result: unknown;
    try {
      result = JSON.parse(content);
    } catch {
      req.log.error("AI returned an invalid interpretation format");
      res.status(502).json({ error: "Tabir şu anda hazırlanamadı. Lütfen biraz sonra yeniden deneyin." });
      return;
    }

    const parsedResult = InterpretDreamResponse.safeParse(result);
    if (!parsedResult.success) {
      req.log.error({ issueCount: parsedResult.error.issues.length }, "AI interpretation did not match the response contract");
      res.status(502).json({ error: "Tabir şu anda hazırlanamadı. Lütfen biraz sonra yeniden deneyin." });
      return;
    }

    res.json(parsedResult.data);
  } catch (error) {
    req.log.error(
      { status: (error as { status?: number } | null)?.status },
      "Dream interpretation provider request failed",
    );
    res.status(502).json({ error: "Yapay zekâ hizmetine şu anda ulaşılamıyor. Lütfen yeniden deneyin." });
  }
});

router.post("/dreams/scene", async (req, res): Promise<void> => {
  const input = GenerateDreamSceneBody.safeParse(req.body);
  if (!input.success) {
    req.log.warn({ issueCount: input.error.issues.length }, "Invalid dream scene request");
    res.status(400).json({ error: "Sahne açıklaması geçersiz." });
    return;
  }

  try {
    const sceneDescription = input.data.scenePrompt
      .split(/[.!?;\n]+/)
      .filter((sentence) => !/\b(person|people|human|face|prophet|religious|sacred|quran|scripture|calligraphy|blood|weapon|violence|injury|nude)\b/i.test(sentence))
      .join(", ")
      .replace(/[^\p{L}\p{N}\s,'-]/gu, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 700);
    const visualDetails = sceneDescription || "a quiet mountain path beside flowing water and a moonlit garden";
    const prompt = `A vivid, cinematic digital painting of ${visualDetails}. Serene landscape, deep emerald and midnight-blue atmosphere, warm golden twilight rays passing through subtle eight-point Islamic geometric light patterns, rich natural detail, gentle mist, peaceful and contemplative mood, portrait composition.`;
    let image: Buffer;
    let imageType = "image/png";
    try {
      image = await generateImageBuffer(prompt, "1024x1536");
    } catch (primaryError) {
      const providerError = primaryError as { status?: number; code?: string; message?: string } | null;
      const modelUnavailable =
        providerError?.status === 400 &&
        providerError.code === "invalid_value" &&
        providerError.message?.includes("model");
      if (!modelUnavailable) throw primaryError;

      const fallback = await openai.images.generate({
        model: "dall-e-3",
        prompt,
        size: "1024x1792",
        response_format: "b64_json",
      });
      const output = fallback.data?.[0];
      if (output?.b64_json) {
        image = Buffer.from(output.b64_json, "base64");
      } else if (output?.url) {
        const imageUrl = new URL(output.url);
        if (imageUrl.protocol !== "https:") throw new Error("Image provider returned an unsafe URL");
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) throw new Error(`Image download failed with status ${imageResponse.status}`);
        imageType = imageResponse.headers.get("content-type")?.startsWith("image/")
          ? imageResponse.headers.get("content-type")!.split(";")[0]
          : "image/png";
        image = Buffer.from(await imageResponse.arrayBuffer());
      } else {
        image = Buffer.alloc(0);
      }
    }
    if (!image.length) {
      req.log.error("AI returned an empty dream scene");
      res.status(502).json({ error: "Sahne şu anda oluşturulamadı. Lütfen yeniden deneyin." });
      return;
    }
    res.json(GenerateDreamSceneResponse.parse({
      imageDataUrl: `data:${imageType};base64,${image.toString("base64")}`,
    }));
  } catch (error) {
    const providerError = error as { status?: number; code?: string; name?: string; message?: string } | null;
    req.log.error(
      {
        status: providerError?.status,
        code: providerError?.code,
        name: providerError?.name,
        message: providerError?.message?.replace(input.data.scenePrompt, "[scene prompt]").slice(0, 240),
      },
      "Dream scene provider request failed",
    );
    res.status(502).json({ error: "Sahne şu anda oluşturulamadı. Lütfen yeniden deneyin." });
  }
});

export default router;
