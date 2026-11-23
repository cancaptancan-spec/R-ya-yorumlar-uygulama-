import { useEffect, useState } from 'react';
import { BookOpenText, HeartHandshake, MoonStar, Pause, Play, Sparkles } from 'lucide-react';
import { type DreamInterpretation } from '@workspace/api-client-react';
import { DreamAnimationCanvas } from '@/components/dream-animation-canvas';
import './dream-video-scene.css';

type DreamVideoSceneProps = {
  dream: string;
  username: string;
  interpretation: DreamInterpretation;
  nightmareAdvice?: string | null;
};

const shorten = (value: string, maxLength: number) => {
  const text = value.trim();
  if (text.length <= maxLength) return text;
  const excerpt = text.slice(0, maxLength - 1);
  const wordEnd = excerpt.lastIndexOf(' ');
  return `${excerpt.slice(0, wordEnd > maxLength * 0.65 ? wordEnd : excerpt.length).trimEnd()}…`;
};

export function DreamVideoScene({ dream, username, interpretation, nightmareAdvice = null }: DreamVideoSceneProps) {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => {
      setReducedMotion(mediaQuery.matches);
      setIsPlaying(!mediaQuery.matches);
    };
    updatePreference();
    mediaQuery.addEventListener?.('change', updatePreference);
    return () => mediaQuery.removeEventListener?.('change', updatePreference);
  }, []);

  useEffect(() => {
    if (!isPlaying || reducedMotion) return undefined;
    const interval = window.setInterval(() => {
      setProgress((current) => (current >= 100 ? 0 : current + 1));
    }, 150);
    return () => window.clearInterval(interval);
  }, [isPlaying, reducedMotion]);

  const activeIndex = progress < 33 ? 0 : progress < 70 ? 1 : 2;
  const firstSymbol = interpretation.symbols[0]?.symbol;
  const slides = [
    {
      badge: 'RÜYA SAHNESİ',
      title: firstSymbol || 'Rüyanızın ana sembolleri',
      subtitle: interpretation.sceneTheme.sceneCaption,
    },
    {
      badge: 'RÜYANIN HİKMETİ',
      title: shorten(interpretation.wisdom, 125),
      subtitle: 'Semboller üzerine sakin bir yansıma',
    },
    {
      badge: 'MANEVİ YANSIMA',
      title: shorten(interpretation.dua, 125),
      subtitle: 'Dua ve manevi tavsiye',
    },
  ];

  const togglePlayback = () => setIsPlaying((playing) => !playing);
  const progressForStep = (step: number) => {
    if (step < activeIndex) return 100;
    if (step > activeIndex) return 0;
    if (step === 0) return Math.min(100, (progress / 33) * 100);
    if (step === 1) return Math.min(100, Math.max(0, ((progress - 33) / 37) * 100));
    return Math.min(100, Math.max(0, ((progress - 70) / 30) * 100));
  };

  return (
    <div className="dream-video-layout" data-testid="dream-video-layout">
      <article
        className="dream-story-card"
        aria-label="Takipçi rüyası için 9:16 dikey video sahnesi"
        data-testid="card-dikey-paylasim"
      >
        <div className="dream-story-art" aria-hidden="true">
          <DreamAnimationCanvas
            theme={interpretation.sceneTheme}
            className="dream-story-canvas"
            paused={!isPlaying || reducedMotion}
            showCaption={false}
            showBadge={false}
          />
        </div>
        <div className="dream-story-shade" aria-hidden="true" />
        <div
          className="dream-story-progress"
          role="progressbar"
          aria-label="Dikey sahne ilerlemesi"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          {[0, 1, 2].map((step) => (
            <span className="dream-story-track" key={step}>
              <span className="dream-story-fill" style={{ width: `${progressForStep(step)}%` }} />
            </span>
          ))}
        </div>

        <div className="dream-story-content">
          <div className="dream-story-top">
            <span className="dream-story-badge"><MoonStar size={11} /> CANLI RÜYA SAHNESİ</span>
            <button
              className="dream-story-play"
              type="button"
              onClick={togglePlayback}
              aria-label={isPlaying ? 'Sahneyi duraklat' : 'Sahneyi oynat'}
              data-testid="button-video-oynat"
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
              <span>{reducedMotion ? 'Hareket azaltıldı' : isPlaying ? 'Duraklat' : 'Oynat'}</span>
            </button>
          </div>

          <div className="dream-story-comment">
            <span className="dream-story-username">{username.trim() ? `@${username.trim().replace(/^@/, '')}` : 'Bir takipçinin rüyası'}</span>
            <p>“{shorten(dream, 138)}”</p>
          </div>

          <div className="dream-story-caption" key={activeIndex}>
            <span className="dream-story-caption-icon"><Sparkles size={15} /></span>
            <span className="dream-story-caption-badge">{slides[activeIndex].badge}</span>
            <h3>{slides[activeIndex].title}</h3>
            <p>{shorten(slides[activeIndex].subtitle, 100)}</p>
          </div>

          <div className="dream-story-footer">
            <span>Dokunmadan oynatmayı duraklatabilirsiniz</span>
            <MoonStar size={13} />
          </div>
        </div>
      </article>

      <section className="dream-video-details" aria-label="Rüyanın tam manevi yansıması">
        <div className="dream-video-details-heading">
          <div>
            <p className="section-eyebrow">Yorum için tam metin</p>
            <h3 className="serif">Rüyanın manevi yansıması</h3>
          </div>
          <BookOpenText size={18} aria-hidden="true" />
        </div>

        {nightmareAdvice && (
          <div className="kabus-note rounded-2xl p-4" data-testid="card-kabus-adabi">
            <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[.17em]">Önce: Peygamberimizin tavsiyesi</p>
            <p className="text-[11px] leading-5">{nightmareAdvice}</p>
          </div>
        )}

        <article className="glass-card result-card rounded-2xl p-4">
          <div className="result-card-heading flex items-start gap-3">
            <span className="card-icon"><Sparkles size={15} strokeWidth={1.6} /></span>
            <h4 className="result-card-title serif text-[18px]">Rüyanın Hikmeti &amp; Temel Semboller</h4>
          </div>
          <p className="result-card-copy mt-2 text-[12px] leading-[1.8]">{interpretation.wisdom}</p>
          {interpretation.symbols.map((item, index) => (
            <div className="symbol-item mt-3 border-l pl-3" key={`${item.symbol}-${index}`}>
              <p className="text-[11px] font-semibold">{item.symbol}</p>
              <p className="result-card-copy mt-0.5 text-[11px] leading-5">{item.meaning}</p>
            </div>
          ))}
        </article>

        <article className="glass-card result-card rounded-2xl p-4">
          <div className="result-card-heading flex items-start gap-3">
            <span className="card-icon"><BookOpenText size={15} strokeWidth={1.6} /></span>
            <h4 className="result-card-title serif text-[18px]">İbn-i Şirin ve İmam Nablusi Külliyatına Göre Tabiri</h4>
          </div>
          <p className="result-card-copy mt-2 text-[12px] leading-[1.8]">{interpretation.detailedInterpretation}</p>
        </article>

        <article className="glass-card result-card rounded-2xl p-4">
          <div className="result-card-heading flex items-start gap-3">
            <span className="card-icon"><HeartHandshake size={15} strokeWidth={1.6} /></span>
            <h4 className="result-card-title serif text-[18px]">Manevi Tavsiye, Dua ve Esmaül Hüsna Önerisi</h4>
          </div>
          <p className="result-card-copy mt-2 text-[12px] leading-[1.8]">{interpretation.dua}</p>
          <p className="result-card-copy card-note mt-3 border-t pt-3 text-[11px] leading-5">{interpretation.asmaSuggestion}</p>
          <p className="result-card-copy card-note mt-3 border-t pt-3 text-[11px] leading-5">{interpretation.dhikr}</p>
        </article>
      </section>
    </div>
  );
}
