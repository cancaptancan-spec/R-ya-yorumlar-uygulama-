import { useState } from 'react';
import { ArrowUpRight, BookOpenText, Check, Download, HeartHandshake, Share2, Sparkles } from 'lucide-react';
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
  const firstSymbol = interpretation.symbols[0];
  const reflections = [
    interpretation.dua,
  ].filter((part) => part?.trim());

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

  return (
    <section className="dream-result-view" aria-label="Rüya yansıması" data-testid="dream-result-view">
      <div className="dream-result-view__visual">
        {interpretation.sceneImageDataUrl && !imageLoadFailed ? (
          <img
            className="dream-result-view__image"
            src={interpretation.sceneImageDataUrl}
            alt={interpretation.sceneTheme.sceneCaption}
            onError={() => setImageLoadFailed(true)}
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
        {interpretation.sceneImageDataUrl && !imageLoadFailed && (
          <a
            className="dream-result-view__download"
            href={interpretation.sceneImageDataUrl}
            download="ruya-rehberi-yansimasi.png"
            data-testid="link-gorseli-indir"
          >
            <Download size={15} aria-hidden="true" />
            Görseli İndir
          </a>
        )}
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
