import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, BookOpenText, Check, Download, HeartHandshake, Share2, Sparkles, Video } from 'lucide-react';
import type { DreamInterpretation } from '@workspace/api-client-react';
import './dream-result-view.css';

type DreamResultViewProps = {
  dream: string;
  username: string;
  interpretation: DreamInterpretation;
  showCreatorActions: boolean;
  nightmareAdvice?: string | null;
};

const creatorHandle = '@huzuryolculugu';
const creatorProfileUrl = 'https://www.tiktok.com/@huzuryolculugu';
const canvasWidth = 720;
const canvasHeight = 1280;
const storyDuration = 8000;

type SceneCopy = {
  symbol: string;
  meaning: string;
  wisdom: string;
};

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  let truncated = false;

  for (let index = 0; index < words.length; index += 1) {
    const word = words[index];
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width > maxWidth && line) {
      if (lines.length === maxLines - 1) {
        lines.push(line);
        truncated = index < words.length - 1;
        line = '';
        break;
      }
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (truncated && lines.length) {
    let lastLine = lines[lines.length - 1];
    while (lastLine && context.measureText(`${lastLine}…`).width > maxWidth) {
      lastLine = lastLine.slice(0, -1);
    }
    lines[lines.length - 1] = `${lastLine.trimEnd()}…`;
  }
  lines.forEach((lineText, index) => context.fillText(lineText, x, y + index * lineHeight));
}

function paintScene(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  elapsed: number,
  copy: SceneCopy,
) {
  const progress = (elapsed % storyDuration) / storyDuration;
  const phase = Math.min(2, Math.floor(progress * 3));
  const phaseProgress = progress * 3 - phase;
  const zoom = 1.045 + (1 - Math.cos(progress * Math.PI * 2)) * 0.052;
  const horizontalDrift = Math.sin(progress * Math.PI * 2) * canvasWidth * 0.018;
  const verticalDrift = Math.cos(progress * Math.PI * 2) * canvasHeight * 0.012;
  const coverScale = Math.max(canvasWidth / image.width, canvasHeight / image.height) * zoom;
  const drawWidth = image.width * coverScale;
  const drawHeight = image.height * coverScale;

  context.clearRect(0, 0, canvasWidth, canvasHeight);
  context.drawImage(
    image,
    (canvasWidth - drawWidth) / 2 + horizontalDrift,
    (canvasHeight - drawHeight) / 2 + verticalDrift,
    drawWidth,
    drawHeight,
  );

  const shade = context.createLinearGradient(0, 0, 0, canvasHeight);
  shade.addColorStop(0, 'rgba(3, 13, 12, .45)');
  shade.addColorStop(.32, 'rgba(4, 17, 15, .02)');
  shade.addColorStop(.57, 'rgba(4, 15, 14, .1)');
  shade.addColorStop(1, 'rgba(4, 17, 15, .94)');
  context.fillStyle = shade;
  context.fillRect(0, 0, canvasWidth, canvasHeight);

  for (let index = 0; index < 22; index += 1) {
    const seed = index * 2.399;
    const drift = (progress * 0.8 + (index % 7) / 7) % 1;
    const x = ((Math.sin(seed) * .5 + .5) * canvasWidth + Math.sin(seed + progress * 3) * 11) % canvasWidth;
    const y = (canvasHeight * (1 - drift) + (Math.cos(seed) * 10)) % canvasHeight;
    const radius = 1.3 + ((index * 7) % 5) * .45;
    const alpha = .2 + ((Math.sin(seed + progress * Math.PI * 2) + 1) / 2) * .42;
    context.beginPath();
    context.fillStyle = `rgba(226, 201, 132, ${alpha})`;
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }

  const sideInset = 42;
  const segmentGap = 9;
  const segmentWidth = (canvasWidth - sideInset * 2 - segmentGap * 2) / 3;
  for (let index = 0; index < 3; index += 1) {
    const x = sideInset + index * (segmentWidth + segmentGap);
    context.beginPath();
    context.roundRect(x, 39, segmentWidth, 5, 3);
    context.fillStyle = 'rgba(255, 248, 221, .38)';
    context.fill();
    if (index < phase || (index === phase && phaseProgress > 0)) {
      context.beginPath();
      context.roundRect(x, 39, segmentWidth * (index < phase ? 1 : phaseProgress), 5, 3);
      context.fillStyle = '#e7cf91';
      context.fill();
    }
  }

  const phaseLabels = ['Ana Sembol', 'Manevi İşaret', 'Rüya Rehberi'];
  const copyText = phase === 0 ? copy.symbol : phase === 1 ? copy.wisdom : creatorHandle;
  const subText = phase === 0 ? copy.meaning : phase === 1 ? 'Semboller üzerine sakin bir yansıma' : 'Rüya Rehberi';
  const overlayAlpha = Math.min(1, phaseProgress * 6, (1 - phaseProgress) * 6 + .15);

  context.save();
  context.globalAlpha = Math.max(.72, overlayAlpha);
  context.textAlign = 'left';
  context.fillStyle = '#e3cc8d';
  context.font = '700 19px "Plus Jakarta Sans", sans-serif';
  context.fillText(phaseLabels[phase], sideInset, 920);
  context.fillStyle = '#f4efdf';
  context.font = '600 42px "Playfair Display", Georgia, serif';
  drawWrappedText(context, copyText, sideInset, 978, canvasWidth - sideInset * 2, 54, 3);
  context.fillStyle = 'rgba(239, 237, 221, .88)';
  context.font = '400 23px "Plus Jakarta Sans", sans-serif';
  drawWrappedText(context, subText, sideInset, 1125, canvasWidth - sideInset * 2, 34, 3);
  context.restore();

  context.textAlign = 'right';
  context.fillStyle = '#e5d08c';
  context.font = '600 19px "Plus Jakarta Sans", sans-serif';
  context.fillText(creatorHandle, canvasWidth - sideInset, canvasHeight - 43);
  context.textAlign = 'left';
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();
  if (!copied) throw new Error('Kopyalama kullanılamıyor');
}

export function DreamResultView({
  dream,
  username,
  interpretation,
  showCreatorActions,
  nightmareAdvice,
}: DreamResultViewProps) {
  const [shareFeedback, setShareFeedback] = useState('');
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [videoStatus, setVideoStatus] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationOriginRef = useRef<number | null>(null);
  const firstSymbol = interpretation.symbols[0];
  const reflections = [
    interpretation.dua,
  ].filter((part) => part?.trim());
  const sceneCopy = {
    symbol: firstSymbol?.symbol ?? 'Rüyanızın ana sembolleri',
    meaning: firstSymbol?.meaning ?? interpretation.wisdom,
    wisdom: interpretation.wisdom,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const imageDataUrl = interpretation.sceneImageDataUrl;
    if (!canvas || !imageDataUrl || imageLoadFailed) return undefined;

    const context = canvas.getContext('2d');
    if (!context) {
      setImageLoadFailed(true);
      return undefined;
    }

    const image = new Image();
    let frameId = 0;
    let lastPaint = 0;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    image.onload = () => {
      animationOriginRef.current = performance.now();
      if (reducedMotion) {
        paintScene(context, image, 0, sceneCopy);
        setSceneReady(true);
        return;
      }
      const render = (now: number) => {
        frameId = window.requestAnimationFrame(render);
        if (now - lastPaint < 1000 / 30) return;
        lastPaint = now;
        const elapsed = animationOriginRef.current === null
          ? 0
          : now - animationOriginRef.current;
        paintScene(context, image, elapsed, sceneCopy);
        setSceneReady(true);
      };
      frameId = window.requestAnimationFrame(render);
    };
    image.onerror = () => setImageLoadFailed(true);
    image.src = imageDataUrl;

    return () => {
      window.cancelAnimationFrame(frameId);
      image.onload = null;
      image.onerror = null;
    };
  }, [
    imageLoadFailed,
    interpretation.sceneImageDataUrl,
    interpretation.symbols,
    interpretation.wisdom,
  ]);

  const shareReflection = async () => {
    const shareText = [
      'Rüya üzerine sakin bir yansıma',
      firstSymbol ? `${firstSymbol.symbol}: ${firstSymbol.meaning}` : interpretation.wisdom,
      interpretation.disclaimer,
    ].join('\n\n');
    setShareFeedback('');

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rüya Rehberi · Manevi yansıma',
          text: shareText,
          url: `${window.location.origin}${window.location.pathname}`,
        });
        setShareFeedback('Paylaşım menüsü açıldı.');
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }

    try {
      await copyText(`${shareText}\n\n${window.location.origin}${window.location.pathname}`);
      setShareFeedback('Paylaşım metni kopyalandı.');
    } catch {
      setShareFeedback('Paylaşım şu an açılamadı. Lütfen yeniden deneyin.');
    }
  };

  const downloadShortVideo = async () => {
    setVideoStatus('');
    if (isRecording) return;

    const canvas = canvasRef.current;
    if (!canvas || imageLoadFailed || !sceneReady) {
      setVideoStatus('Görsel hazır olmadığı için video oluşturulamıyor.');
      return;
    }
    if (typeof canvas.captureStream !== 'function') {
      setVideoStatus('Tarayıcınız bu tuvalden video kaydını desteklemiyor.');
      return;
    }
    if (typeof MediaRecorder === 'undefined') {
      setVideoStatus('Tarayıcınız video kaydını desteklemiyor.');
      return;
    }

    const mimeTypes = [
      'video/mp4;codecs=avc1.42E01E',
      'video/mp4',
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
    ];
    const mimeType = mimeTypes.find((candidate) => MediaRecorder.isTypeSupported(candidate));
    if (!mimeType) {
      setVideoStatus('MP4 veya WebM video kaydı bu tarayıcıda desteklenmiyor.');
      return;
    }

    let stream: MediaStream | null = null;
    let recorder: MediaRecorder | null = null;
    let stopTimer = 0;
    setIsRecording(true);
    setVideoStatus('Kısa video kaydediliyor…');

    try {
      stream = canvas.captureStream(30);
      recorder = new MediaRecorder(stream, { mimeType });
      const chunks: BlobPart[] = [];
      const recording = new Promise<Blob>((resolve, reject) => {
        if (!recorder) {
          reject(new Error('Kayıt başlatılamadı.'));
          return;
        }
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunks.push(event.data);
        };
        recorder.onerror = () => reject(new Error('Video kaydı tamamlanamadı.'));
        recorder.onstop = () => resolve(new Blob(chunks, { type: recorder?.mimeType || mimeType }));
      });

      animationOriginRef.current = performance.now();
      recorder.start(100);
      stopTimer = window.setTimeout(() => recorder?.stop(), storyDuration);
      const videoBlob = await recording;
      setVideoStatus('Video indiriliyor…');
      const extension = (recorder.mimeType || mimeType).startsWith('video/mp4') ? 'mp4' : 'webm';
      const objectUrl = URL.createObjectURL(videoBlob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `ruya-rehberi-kisa-video.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
       setVideoStatus(extension === 'mp4' ? 'MP4 kısa video indirildi.' : 'WebM kısa video indirildi.');
    } catch {
      setVideoStatus('Video oluşturulamadı. Lütfen yeniden deneyin.');
    } finally {
      window.clearTimeout(stopTimer);
      if (recorder && recorder.state !== 'inactive') recorder.stop();
      stream?.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <section className="dream-result-view" aria-label="Rüya yansıması" data-testid="dream-result-view">
      <div className="dream-result-view__visual">
        {interpretation.sceneImageDataUrl && !imageLoadFailed ? (
          <canvas
            ref={canvasRef}
            className="dream-result-view__image"
            width={canvasWidth}
            height={canvasHeight}
            role="img"
            aria-label={`${interpretation.sceneTheme.sceneCaption} — hareketli rüya sahnesi`}
            data-testid="img-ruya-sahnesi"
          />
        ) : (
          <div className="dream-result-view__image-error" role="alert" data-testid="alert-gorsel-hatasi">
            <Sparkles size={18} aria-hidden="true" />
            <p>{interpretation.sceneImageError ?? 'Bu rüya için görsel hazırlanamadı.'}</p>
          </div>
        )}
        <span className="dream-result-view__handle" data-testid="text-creator-handle">
          {creatorHandle}
        </span>
        <div className="dream-result-view__downloads">
          <button
            className="dream-result-view__download dream-result-view__download--video"
            type="button"
            onClick={downloadShortVideo}
            disabled={!interpretation.sceneImageDataUrl || imageLoadFailed || !sceneReady || isRecording}
            data-testid="button-video-indir"
          >
            <Video size={16} aria-hidden="true" />
            {isRecording ? 'Video hazırlanıyor…' : 'Kısa Video Olarak İndir (TikTok)'}
          </button>
          {interpretation.sceneImageDataUrl && !imageLoadFailed && (
            <a
              className="dream-result-view__download dream-result-view__download--image"
              href={interpretation.sceneImageDataUrl}
              download="ruya-rehberi-yansimasi.png"
              data-testid="link-gorseli-indir"
            >
              <Download size={15} aria-hidden="true" />
              Görseli İndir
            </a>
          )}
          {videoStatus && <p className="dream-result-view__video-status" role="status">{videoStatus}</p>}
        </div>
      </div>

      {nightmareAdvice && (
        <aside className="dream-result-view__nightmare" role="note" data-testid="note-kabus-adabi">
          <p className="dream-result-view__section-label">Önce: Peygamberimizin tavsiyesi</p>
          <p className="dream-result-view__copy">{nightmareAdvice}</p>
        </aside>
      )}

      {showCreatorActions && (
        <div className="dream-result-view__creator" data-testid="creator-actions">
          <blockquote className="dream-result-view__quote">
            <span className="dream-result-view__quote-byline">
              {username.trim() ? `@${username.trim().replace(/^@/, '')} adlı takipçiden` : 'Bir takipçiden'}
            </span>
            <p>“{dream.trim()}”</p>
          </blockquote>
          <a
            className="dream-result-view__profile"
            href={creatorProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="link-creator-profile"
          >
            TikTok’ta {creatorHandle} hesabını ziyaret et
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
          <button
            className="dream-result-view__share"
            type="button"
            onClick={shareReflection}
            data-testid="button-yansimayi-paylas"
          >
            {shareFeedback === 'Paylaşım metni kopyalandı.' ? <Check size={15} /> : <Share2 size={15} />}
            Yansımayı paylaş
          </button>
          {shareFeedback && <p className="dream-result-view__feedback" role="status">{shareFeedback}</p>}
        </div>
      )}

      <div className="dream-result-view__reflections">
        <article className="dream-result-view__section">
          <div className="dream-result-view__section-heading">
            <span className="dream-result-view__icon"><Sparkles size={15} aria-hidden="true" /></span>
            <h3>Ana Sembol</h3>
          </div>
          {firstSymbol ? (
            <>
              <p className="dream-result-view__symbol">{firstSymbol.symbol}</p>
              <p className="dream-result-view__copy">{firstSymbol.meaning}</p>
            </>
          ) : (
            <p className="dream-result-view__copy">{interpretation.wisdom}</p>
          )}
        </article>

        <article className="dream-result-view__section">
          <div className="dream-result-view__section-heading">
            <span className="dream-result-view__icon"><BookOpenText size={15} aria-hidden="true" /></span>
            <h3>Manevi İşaret</h3>
          </div>
          <p className="dream-result-view__copy">{interpretation.wisdom}</p>
        </article>

        <article className="dream-result-view__section">
          <div className="dream-result-view__section-heading">
            <span className="dream-result-view__icon"><HeartHandshake size={15} aria-hidden="true" /></span>
            <h3>Tefekkür &amp; Dua Önerisi</h3>
          </div>
          {reflections.map((reflection, index) => (
            <p className="dream-result-view__copy" key={`${index}-${reflection}`}>{reflection}</p>
          ))}
        </article>
      </div>

      <p className="dream-result-view__disclaimer">{interpretation.disclaimer}</p>
    </section>
  );
}
