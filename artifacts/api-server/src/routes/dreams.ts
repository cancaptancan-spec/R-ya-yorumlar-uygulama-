import { Router, type IRouter } from "express";
import {
  InterpretDreamBody,
  InterpretDreamResponse,
} from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

const interpretationInstructions = `You are a careful Turkish-language assistant offering reflective guidance informed by classical Islamic dream literature and Prophetic etiquette. You are not a real scholar, do not issue fatwas, and do not claim certainty or knowledge of the unseen. Never present dreams as predictions or guaranteed outcomes. When relevant, mention the broad interpretive tradition associated with İbn-i Şirin and İmam Nablusi without inventing quotations, sources, or claiming an exact derivation. Acknowledge that dreams may be rahmani/salih, nefsani, or distressing; do not classify with certainty.

Return ONLY valid JSON with exactly these fields: wisdom (string), symbols (array of objects with symbol and meaning strings), detailedInterpretation (string), dua (string), asmaSuggestion (string), dhikr (string), nightmareAdvice (string or null), sceneTheme (object), disclaimer (string). All prose must be fluent, natural Turkish. sceneTheme.atmosphere must be exactly one of "water_moon", "light_sky", "nature_peace", "night_stars", or "golden_mosque". Choose the closest atmosphere from the dream's exact symbols: water_moon for sea/water/moon, light_sky for light/sky/flying, nature_peace for nature/greenery/garden/mountain, night_stars for night/stars/dawn, and golden_mosque for spiritual calm/mosque/path. sceneTheme.primaryColor and accentColor must be valid six-digit #RRGGBB hex colors that suit the dream's mood. sceneTheme.sceneCaption must be one poetic, concise Turkish sentence describing the specific visual atmosphere. Keep wisdom to 30-45 words, detailedInterpretation to 70-90 words, symbols to at most 3 concise entries, dua to at most 25 words, and each asmaSuggestion and dhikr to at most 20 words so the creator's 9:16 card can display the full guidance.

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

export default router;
