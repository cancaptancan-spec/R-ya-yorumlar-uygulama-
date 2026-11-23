import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, BookOpenText, Check, Download, HeartHandshake, Share2, Sparkles, Video, Volume2, VolumeX } from 'lucide-react';
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
const storyDuration = 16000;
const neyAudioUrl = 'https://cdn.freesound.org/previews/195/195078_2065570-hq.mp3';
const neyRecordingPage = 'https://freesound.org/people/gopalkoduri/sounds/195078/';
const creativeCommonsLicense = 'https://creativecommons.org/licenses/by-nc/3.0/';

type AudioCapturePipeline = {
  context: AudioContext;
  destination: MediaStreamAudioDestinationNode;
};

type SceneCopy = {
  symbol: string;
  meaning: string;
  wisdom: string;
};

function wrapCanvasText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    if (context.measureText(word).width <= maxWidth) {
      const candidate = line ? `${line} ${word}` : word;
      if (context.measureText(candidate).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
      continue;
    }

    if (line) {
      lines.push(line);
      line = '';
    }
    for (const character of Array.from(word)) {
      const candidate = `${line}${character}`;
      if (context.measureText(candidate).width > maxWidth && line) {
        lines.push(line);
        line = character;
      } else {
        line = candidate;
      }
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawFittedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  top: number,
  maxWidth: number,
  maxHeight: number,
  fontFamily: string,
  fontWeight: number,
  baseFontSize: number,
  minimumFontSize: number,
) {
  let fontSize = baseFontSize;
  let lineHeight = fontSize * 1.18;
  let lines: string[] = [];
  let fitted = false;

  for (; fontSize >= minimumFontSize; fontSize -= 1) {
    context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    lines = wrapCanvasText(context, text, maxWidth);
    lineHeight = fontSize * 1.18;
    if (lines.length * lineHeight <= maxHeight) {
      fitted = true;
      break;
    }
  }

  if (!fitted) fontSize = minimumFontSize;
  context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  lines = wrapCanvasText(context, text, maxWidth);
  lineHeight = fontSize * 1.18;
  if (lines.length * lineHeight > maxHeight && lines.length > 0) {
    lineHeight = maxHeight / lines.length;
  }
  lines.forEach((lineText, index) => context.fillText(lineText, x, top + fontSize + index * lineHeight));
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
  drawFittedText(
    context,
    copyText,
    sideInset,
    966,
    canvasWidth - sideInset * 2,
    148,
    '"Playfair Display", Georgia, serif',
    600,
    42,
    18,
  );
  context.fillStyle = 'rgba(239, 237, 221, .88)';
  drawFittedText(
    context,
    subText,
    sideInset,
    1120,
    canvasWidth - sideInset * 2,
    78,
    '"Plus Jakarta Sans", sans-serif',
    400,
    23,
    15,
  );
  context.textAlign = 'center';
  context.fillStyle = 'rgba(239, 237, 221, .78)';
  context.font = '400 14px "Plus Jakarta Sans", sans-serif';
  context.fillText(
    'Ses: Hüseyni Saz Semaisi — gopalkoduri · CC BY-NC 3.0',
    canvasWidth / 2,
    canvasHeight - 72,
  );
  context.restore();

  context.textAlign = 'right';
  context.fillStyle = '#e5d08c';
  context.font = '600 19px "Plus Jakarta Sans", sans-serif';
  context.fillText(creatorHandle, canvasWidth - sideInset, canvasHeight - 35);
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
  const [audioStatus, setAudioStatus] = useState('');
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationOriginRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const firstSymbol = interpretation.symbols[0];
  const reflections = [
    interpretation.dua,
  ].filter((part) => part?.trim());
  const sceneCopy = {
    symbol: firstSymbol?.symbol ?? 'Rüyanızın ana sembolleri',
    meaning: firstSymbol?.meaning ?? interpretation.wisdom,
    wisdom: interpretation.wisdom,
  };

  const getAudioCapturePipeline = (): AudioCapturePipeline => {
    const audio = audioRef.current;
    if (!audio) throw new Error('Ses kaynağı bulunamadı.');
    if (audioContextRef.current && audioDestinationRef.current) {
      return { context: audioContextRef.current, destination: audioDestinationRef.current };
    }

    const windowWithWebkit = window as Window & { webkitAudioContext?: typeof AudioContext };
    const AudioContextConstructor = window.AudioContext || windowWithWebkit.webkitAudioContext;
    if (!AudioContextConstructor) {
      throw new Error('Tarayıcınız ses kaydını desteklemiyor.');
    }

    const context = new AudioContextConstructor();
    const destination = context.createMediaStreamDestination();
    audioContextRef.current = context;
    audioDestinationRef.current = destination;
    const source = context.createMediaElementSource(audio);
    source.connect(context.destination);
    source.connect(destination);
    return { context, destination };
  };

  const resetAudioElement = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    try {
      audio.currentTime = 0;
    } catch {
      // The source may not have buffered enough media to seek yet.
    }
  };

  const setNeyAudioEnabled = async (enabled: boolean) => {
    setAudioStatus('');
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 1;
    audio.loop = true;

    if (!enabled) {
      resetAudioElement();
      setIsAudioEnabled(false);
      const context = audioContextRef.current;
      if (context?.state === 'running') void context.suspend().catch(() => undefined);
      return;
    }

    try {
      const { context } = getAudioCapturePipeline();
      const resume = context.state === 'running' ? Promise.resolve() : context.resume();
      const playback = audio.play();
      await Promise.all([resume, playback]);
      setIsAudioEnabled(true);
    } catch (error) {
      setAudioStatus(error instanceof Error ? error.message : 'Ney sesi başlatılamadı.');
      setIsAudioEnabled(false);
    }
  };

  const handlePlayerInteraction = () => {
    if (!isAudioEnabled) void setNeyAudioEnabled(true);
  };

  useEffect(() => {
    let active = true;
    const audio = audioRef.current;
    if (!audio) return undefined;
    audio.volume = 1;
    audio.loop = true;
    void audio.play()
      .then(() => {
        if (active && !document.hidden) setIsAudioEnabled(true);
      })
      .catch(() => {
        if (active && !document.hidden) setAudioStatus('Sesi açmak için rüya sahnesine dokunun.');
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const suspendAudio = () => {
      const context = audioContextRef.current;
      if (context?.state === 'running') void context.suspend().catch(() => undefined);
    };
    const stopAndResetAudio = () => {
      resetAudioElement();
      setIsAudioEnabled(false);
      suspendAudio();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) stopAndResetAudio();
    };
    const handlePageExit = () => stopAndResetAudio();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageExit);
    window.addEventListener('beforeunload', handlePageExit);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageExit);
      window.removeEventListener('beforeunload', handlePageExit);
      resetAudioElement();
      audioDestinationRef.current?.stream.getTracks().forEach((track) => track.stop());
      const context = audioContextRef.current;
      audioContextRef.current = null;
      audioDestinationRef.current = null;
      if (context && context.state !== 'closed') void context.close().catch(() => undefined);
    };
  }, []);

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
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
      'video/mp4',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ];
    const mimeType = mimeTypes.find((candidate) => MediaRecorder.isTypeSupported(candidate));
    if (!mimeType) {
      setVideoStatus('MP4 veya WebM video kaydı bu tarayıcıda desteklenmiyor.');
      return;
    }

    let canvasStream: MediaStream | null = null;
    let recorder: MediaRecorder | null = null;
    let stopTimer = 0;
    setIsRecording(true);
    setVideoStatus('Kısa video kaydediliyor…');

    try {
      const audio = audioRef.current;
      if (!audio) throw new Error('Ney kaydı bulunamadı.');
      audio.volume = 1;
      audio.loop = true;
      const audioPipeline = getAudioCapturePipeline();
      const resumeAudio = audioPipeline.context.state === 'running'
        ? Promise.resolve()
        : audioPipeline.context.resume();
      const playAudio = audio.play();
      await Promise.all([resumeAudio, playAudio]);
      setIsAudioEnabled(true);
      setAudioStatus('');
      canvasStream = canvas.captureStream(30);
      const recordingStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...audioPipeline.destination.stream.getAudioTracks(),
      ]);
      recorder = new MediaRecorder(recordingStream, { mimeType });
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
      setVideoStatus(extension === 'mp4' ? 'Sesli MP4 kısa video indirildi.' : 'Sesli WebM kısa video indirildi.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Bilinmeyen kayıt hatası.';
      setAudioStatus(message);
      setVideoStatus(`Sesli video oluşturulamadı: ${message}`);
    } finally {
      window.clearTimeout(stopTimer);
      if (recorder && recorder.state !== 'inactive') recorder.stop();
      canvasStream?.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <section className="dream-result-view" aria-label="Rüya yansıması" data-testid="dream-result-view">
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        loop
        preload="auto"
        src={neyAudioUrl}
        aria-hidden="true"
        hidden
        data-testid="audio-ney-recording"
      />
      <div className="dream-result-view__visual">
        {interpretation.sceneImageDataUrl && !imageLoadFailed ? (
          <div className="dream-result-view__player">
            <canvas
              ref={canvasRef}
              className="dream-result-view__image"
              width={canvasWidth}
              height={canvasHeight}
              role="img"
              aria-label={`${interpretation.sceneTheme.sceneCaption} — hareketli rüya sahnesi`}
              onPointerDown={handlePlayerInteraction}
              data-testid="img-ruya-sahnesi"
            />
            <button
              className="dream-result-view__sound-toggle"
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => void setNeyAudioEnabled(!isAudioEnabled)}
              aria-label={isAudioEnabled ? 'Ney sesini kapat' : 'Ney sesini aç'}
              aria-pressed={isAudioEnabled}
              data-testid="button-ney-sesi"
            >
              {isAudioEnabled ? <Volume2 size={15} aria-hidden="true" /> : <VolumeX size={15} aria-hidden="true" />}
              {isAudioEnabled ? 'Ney Sesi Açık' : 'Sesi Aç'}
            </button>
          </div>
        ) : (
          <div className="dream-result-view__image-error" role="alert" data-testid="alert-gorsel-hatasi">
            <Sparkles size={18} aria-hidden="true" />
            <p>{interpretation.sceneImageError ?? 'Bu rüya için görsel hazırlanamadı.'}</p>
          </div>
        )}
        <span className="dream-result-view__handle" data-testid="text-creator-handle">
          {creatorHandle}
        </span>
        <p className="dream-result-view__audio-attribution">
          Kayıt: <a href={neyRecordingPage} target="_blank" rel="noopener noreferrer">Hüseyni Saz Semaisi (Ney icrası) — gopalkoduri</a>
          {' · '}
          <a href={creativeCommonsLicense} target="_blank" rel="noopener noreferrer">CC BY-NC 3.0</a>
        </p>
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
          {audioStatus && <p className="dream-result-view__audio-status" role="status">{audioStatus}</p>}
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
