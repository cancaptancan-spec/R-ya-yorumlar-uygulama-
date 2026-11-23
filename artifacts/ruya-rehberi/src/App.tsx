import { type FormEvent, type ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { useInterpretDream, type DreamInterpretation } from '@workspace/api-client-react';
import {
  DreamAnimationCanvas,
  drawDreamSceneFrame,
  type DreamSceneTheme,
} from '@/components/dream-animation-canvas';
import {
  ArrowDown,
  ArrowRight,
  BookOpenText,
  CircleHelp,
  Compass,
  Clock3,
  Feather,
  HeartHandshake,
  MoonStar,
  Sparkles,
  Sun,
  Sunrise,
} from 'lucide-react';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

type TimeOfDream = 'seher' | 'gece' | 'gunduz';
type DreamType = 'huzurlu' | 'kabus' | 'tekrarlayan';
type DreamInput = { dream: string; timeOfDream: TimeOfDream; dreamType: DreamType; username?: string };
const LOADING_SCENE_THEME: DreamSceneTheme = {
  atmosphere: 'night_stars',
  primaryColor: '#142c3b',
  accentColor: '#e5c879',
  sceneCaption: 'Rüyanızın sembolleriyle şekillenen sahne hazırlanıyor.',
};

function Home() {
  const [mode, setMode] = useState<'reflection' | 'creator'>('reflection');
  const [dream, setDream] = useState('');
  const [timeOfDream, setTimeOfDream] = useState<TimeOfDream>('seher');
  const [dreamType, setDreamType] = useState<DreamType>('huzurlu');
  const [username, setUsername] = useState('');
  const [interpretation, setInterpretation] = useState<DreamInterpretation | null>(null);
  const [requestError, setRequestError] = useState('');
  const [shareFeedback, setShareFeedback] = useState('');
  const [shareCardUrl, setShareCardUrl] = useState('');
  const [shareText, setShareText] = useState('');
  const interpretDream = useInterpretDream();

  const submitDream = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanDream = dream.trim();
    if (cleanDream.length < 10) {
      setRequestError('Rüyanızı en az 10 karakterle biraz daha anlatır mısınız?');
      return;
    }
    setRequestError('');
    setInterpretation(null);
    setShareFeedback('');
    setShareCardUrl('');
    const input: DreamInput = {
      dream: cleanDream,
      timeOfDream,
      dreamType,
      ...(mode === 'creator' && username.trim() ? { username: username.trim().replace(/^@/, '') } : {}),
    };
    interpretDream.mutate({ data: input }, {
      onSuccess: (result) => {
        setInterpretation(result);
      },
      onError: () => setRequestError('Yorumunuz şu an hazırlanamadı. Lütfen bağlantınızı kontrol edip yeniden deneyin.'),
    });
  };

  const createAndShareCard = async () => {
    if (!interpretation) return;
    setShareFeedback('');
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas context is unavailable');

      const background = context.createLinearGradient(0, 0, canvas.width, canvas.height);
      background.addColorStop(0, '#174b3f');
      background.addColorStop(.55, '#12382f');
      background.addColorStop(1, '#101e30');
      context.fillStyle = background;
      context.fillRect(0, 0, canvas.width, canvas.height);

      const sceneHeight = 570;
      drawDreamSceneFrame(context, interpretation.sceneTheme, canvas.width, sceneHeight, 2.4);
      const sceneFade = context.createLinearGradient(0, sceneHeight * 0.57, 0, sceneHeight + 100);
      sceneFade.addColorStop(0, 'rgba(18, 56, 47, 0)');
      sceneFade.addColorStop(1, '#12382f');
      context.fillStyle = sceneFade;
      context.fillRect(0, sceneHeight * 0.57, canvas.width, sceneHeight + 100);

      const titleShade = context.createLinearGradient(0, 0, 0, 220);
      titleShade.addColorStop(0, 'rgba(8, 24, 32, .55)');
      titleShade.addColorStop(1, 'rgba(8, 24, 32, 0)');
      context.fillStyle = titleShade;
      context.fillRect(0, 0, canvas.width, 220);

      context.strokeStyle = 'rgba(221, 196, 119, .22)';
      context.lineWidth = 2;
      for (let x = 100; x < canvas.width; x += 150) {
        for (let y = sceneHeight + 80; y < canvas.height - 100; y += 150) {
          context.beginPath();
          context.moveTo(x, y - 24);
          context.lineTo(x + 24, y);
          context.lineTo(x, y + 24);
          context.lineTo(x - 24, y);
          context.closePath();
          context.stroke();
        }
      }
      context.strokeStyle = '#d8c57f';
      context.lineWidth = 3;
      context.strokeRect(44, 44, canvas.width - 88, canvas.height - 88);
      context.strokeStyle = 'rgba(216, 197, 127, .55)';
      context.lineWidth = 1;
      context.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

      context.textAlign = 'center';
      context.fillStyle = '#e5d08c';
      context.font = '600 42px "Playfair Display", Georgia, serif';
      drawCanvasParagraph(context, 'İslami Rüya Tabiri & Manevi Rehber', 540, 112, 856, 54, 2, 'center');
      context.fillStyle = '#e1d7bd';
      context.font = '400 20px "Plus Jakarta Sans", sans-serif';
      drawCanvasParagraph(context, username.trim() ? `@${username.trim().replace(/^@/, '')}` : 'Rüya üzerine bir yansıma', 540, 165, 856, 30, 1, 'center');
      context.textAlign = 'left';
      context.fillStyle = '#e5d08c';
      context.font = '600 17px "Plus Jakarta Sans", sans-serif';
      context.fillText('CANLI SAHNE', 80, 485);
      context.fillStyle = '#f4ecd7';
      context.font = '400 20px "Plus Jakarta Sans", sans-serif';
      drawCanvasParagraph(context, interpretation.sceneTheme.sceneCaption, 80, 520, 920, 28, 2);
      let y = sceneHeight + 68;

      context.fillStyle = '#e3d292';
      context.font = '600 24px "Plus Jakarta Sans", sans-serif';
      context.fillText('RÜYANIZ', 112, y);
      y += 42;
      context.fillStyle = '#f4efdf';
      context.font = '400 25px "Plus Jakarta Sans", sans-serif';
      y = drawCanvasParagraph(context, `“${dream}”`, 112, y, 856, 36, 4) + 32;

      context.fillStyle = '#e3d292';
      context.font = '600 24px "Plus Jakarta Sans", sans-serif';
      context.fillText('RÜYANIN HİKMETİ', 112, y);
      y += 40;
      context.fillStyle = '#f4efdf';
      context.font = '400 24px "Plus Jakarta Sans", sans-serif';
      y = drawCanvasParagraph(context, interpretation.wisdom, 112, y, 856, 35, 4) + 30;

      context.fillStyle = '#e3d292';
      context.font = '600 24px "Plus Jakarta Sans", sans-serif';
      context.fillText('TABİR ÜZERİNE', 112, y);
      y += 40;
      context.fillStyle = '#f4efdf';
      context.font = '400 23px "Plus Jakarta Sans", sans-serif';
      y = drawCanvasParagraph(context, interpretation.detailedInterpretation, 112, y, 856, 34, 8) + 30;

      context.fillStyle = '#e3d292';
      context.font = '600 24px "Plus Jakarta Sans", sans-serif';
      context.fillText('DUA VE MANEVİ TAVSİYE', 112, y);
      y += 40;
      context.fillStyle = '#f4efdf';
      context.font = '400 22px "Plus Jakarta Sans", sans-serif';
      y = drawCanvasParagraph(context, `${interpretation.dua} ${interpretation.asmaSuggestion} ${interpretation.dhikr}`, 112, y, 856, 32, 6);

      context.textAlign = 'center';
      context.fillStyle = '#e5d08c';
      context.font = '500 25px "Playfair Display", Georgia, serif';
      context.fillText('Hayra yorunuz ki hayır olsun', canvas.width / 2, 1820);
      context.fillStyle = '#d6d4c8';
      context.font = '400 17px "Plus Jakarta Sans", sans-serif';
      context.fillText('Bu yansıma kesin bilgi veya dinî hüküm değildir.', canvas.width / 2, 1860);

      const imageUrl = canvas.toDataURL('image/png');
      if (!imageUrl.startsWith('data:image/png;base64,')) throw new Error('Canvas did not produce a PNG');
      setShareText([
        'İslami Rüya Tabiri & Manevi Rehber',
        `Rüyam: ${dream}`,
        `Rüyanın hikmeti: ${interpretation.wisdom}`,
        `Tabir: ${interpretation.detailedInterpretation}`,
        `Dua ve manevi tavsiye: ${interpretation.dua} ${interpretation.asmaSuggestion} ${interpretation.dhikr}`,
        'Hayra yorunuz ki hayır olsun',
      ].join('\n\n'));
      setShareCardUrl(imageUrl);
    } catch {
      setShareFeedback('Kart oluşturulamadı. Lütfen yeniden deneyin.');
    }
  };

  const copyShareText = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand('copy');
        textarea.remove();
        if (!copied) throw new Error('Clipboard copy unavailable');
      }
      setShareFeedback('Metin kopyalandı.');
    } catch {
      setShareFeedback('Metin kopyalanamadı. Kart metnini seçip kopyalayabilirsiniz.');
    }
  };

  const busy = interpretDream.isPending;
  const nightmareAdvice = interpretation?.nightmareAdvice ||
    'Peygamberimizin tavsiyesine uygun olarak Allah’a sığınabilir, sol tarafınıza hafifçe üç kez üfleyebilir ve bu rüyayı paylaşmamayı tercih edebilirsiniz.';

  return (
    <main className="ruya-app relative min-h-[100dvh] overflow-hidden">
      <div className="ambient-motes" aria-hidden="true" />
      <header className="site-header relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-10">
        <a href="/" className="brand-lockup flex items-center gap-3" aria-label="Rüya Rehberi ana sayfa">
          <span className="brand-mark grid h-11 w-11 place-items-center rounded-full">
            <MoonStar size={20} strokeWidth={1.5} />
          </span>
          <span>
            <span className="brand-title serif block text-[19px] leading-none tracking-tight">Rüya Rehberi</span>
            <span className="brand-kicker mt-1 block text-[9px] font-semibold uppercase tracking-[.24em]">Sükûnetle düşünmek için</span>
          </span>
        </a>
        <div className="header-note hidden items-center gap-2 text-xs sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-[#d5b76b]" />
          Özel ve kişisel bir alan
        </div>
      </header>

      <section className="hero-cover relative isolate overflow-hidden">
        <div className="hero-glow hero-glow--emerald" aria-hidden="true" />
        <div className="hero-glow hero-glow--indigo" aria-hidden="true" />
        <div className="hero-mandala-shell" aria-hidden="true">
          <svg className="hero-mandala" viewBox="0 0 600 600" fill="none">
            <g stroke="currentColor" strokeWidth="0.8">
              <circle cx="300" cy="300" r="275" />
              <circle cx="300" cy="300" r="238" />
              <circle cx="300" cy="300" r="164" />
              <circle cx="300" cy="300" r="126" />
              <path d="M300 20 348 252 580 300 348 348 300 580 252 348 20 300 252 252Z" />
              <path d="m300 62 74 164 164 74-164 74-74 164-74-164-164-74 164-74Z" />
              <path d="M300 112 344 256 488 300 344 344 300 488 256 344 112 300 256 256Z" />
              <path d="M300 25v550M25 300h550M105 105l390 390M495 105 105 495" />
              <path d="M300 136c38 57 57 126 0 164-57-38-57-107 0-164Zm164 164c-57 38-126 57-164 0 38-57 107-57 164 0ZM300 464c-38-57-57-126 0-164 57 38 57 107 0 164ZM136 300c57-38 126-57 164 0-38 57-107 57-164 0Z" />
              <path d="m300 205 95 95-95 95-95-95 95-95Z" />
            </g>
            <g fill="currentColor" opacity=".74">
              <circle cx="300" cy="25" r="3" /><circle cx="575" cy="300" r="3" />
              <circle cx="300" cy="575" r="3" /><circle cx="25" cy="300" r="3" />
              <circle cx="105" cy="105" r="2.5" /><circle cx="495" cy="105" r="2.5" />
              <circle cx="495" cy="495" r="2.5" /><circle cx="105" cy="495" r="2.5" />
            </g>
          </svg>
        </div>
        <div className="hero-inner relative mx-auto grid max-w-7xl gap-10 px-5 pb-14 pt-12 md:grid-cols-[1.12fr_.88fr] md:items-center md:px-10 md:pb-20 md:pt-[76px]">
          <div className="hero-copy max-w-3xl">
            <div className="hero-eyebrow mb-6 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[.26em]">
              <span className="hero-eyebrow-line h-px w-8" /> Hayırlı Vakitler
              <Sparkles size={12} className="hero-eyebrow-star" />
            </div>
            <h1 className="hero-title serif max-w-[760px] text-[42px] leading-[1.08] tracking-[-.04em] sm:text-[58px] md:text-[72px]">
              İslami Rüya Tabiri
              <span className="hero-title-accent mt-1 block">&amp; Manevi Rehber</span>
            </h1>
            <p className="hero-description mt-6 max-w-xl text-sm leading-7 md:text-[15px]">
              Bir rüya gördünüz. Biraz üzerinde duralım. İslami geleneğe saygılı, sembollere açık bir yansıma; geleceği haber vermez, düşünmek için sakin bir alan sunar.
            </p>
            <a href="#ruya-formu" className="hero-link mt-8 inline-flex items-center gap-3 text-xs font-semibold">
              Yansımaya başlayın <span className="hero-link-icon"><ArrowDown size={14} /></span>
            </a>
          </div>
          <div className="hero-emblem-wrap relative flex justify-center md:justify-end">
            <div className="hero-emblem">
              <div className="hero-emblem-ring hero-emblem-ring--outer" />
              <div className="hero-emblem-ring hero-emblem-ring--inner" />
              <div className="hero-emblem-core">
                <MoonStar size={48} strokeWidth={1} />
                <span className="hero-emblem-caption">Sakin bir<br />tefekkür</span>
              </div>
              <span className="hero-emblem-orbit hero-emblem-orbit--one" />
              <span className="hero-emblem-orbit hero-emblem-orbit--two" />
            </div>
          </div>
        </div>
        <div className="hero-baseline" aria-hidden="true" />
      </section>

      <section id="ruya-formu" className="dream-workspace mx-auto max-w-7xl px-4 pb-20 pt-8 md:px-10 md:pt-12">
        <div className="mx-auto max-w-[960px]">
          <div className="workspace-head mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="section-eyebrow text-[10px] font-bold uppercase tracking-[.22em]">İlk adım · bir düşünme alanı</p>
              <h2 className="section-title serif mt-2 text-[27px] sm:text-[31px]">Rüyanızı kendi kelimelerinizle anlatın</h2>
            </div>
            <div className="mode-tabs inline-flex w-fit rounded-full p-1" role="tablist" aria-label="Yansıtma biçimi">
              <button type="button" role="tab" aria-selected={mode === 'reflection'} data-testid="tab-kisisel-yansima" onClick={() => setMode('reflection')} className={`mode-tab rounded-full px-4 py-2 text-[11px] font-semibold transition-colors ${mode === 'reflection' ? 'is-active' : ''}`}>
                Kişisel yansıma
              </button>
              <button type="button" role="tab" aria-selected={mode === 'creator'} data-testid="tab-tiktok-yorum-modu" onClick={() => setMode('creator')} className={`mode-tab rounded-full px-4 py-2 text-[11px] font-semibold transition-colors ${mode === 'creator' ? 'is-active' : ''}`}>
                TikTok Yorum Modu
              </button>
            </div>
          </div>

          <div className="workspace-grid grid gap-5 lg:grid-cols-[1.08fr_.92fr]">
            <form onSubmit={submitDream} className="glass-panel dream-form rounded-[24px] p-5 sm:p-7">
              {mode === 'creator' && (
                <label className="field-group mb-5 block">
                  <span className="field-label mb-2 block text-[11px] font-semibold">Takipçi kullanıcı adı</span>
                  <div className="glass-input-wrap flex items-center rounded-xl px-3">
                    <span className="text-sm text-[#d4b968]">@</span>
                    <input value={username} onChange={(event) => setUsername(event.target.value)} maxLength={40} placeholder="kullaniciadi" className="glass-input w-full border-0 bg-transparent px-2 py-3 text-sm outline-none" data-testid="input-kullanici-adi" />
                  </div>
                </label>
              )}
              <label htmlFor="dream-text" className="field-label mb-2 block text-[11px] font-semibold">{mode === 'creator' ? 'Takipçinin yorumu' : 'Rüyanız'}</label>
              <textarea id="dream-text" value={dream} onChange={(event) => setDream(event.target.value)} minLength={10} maxLength={mode === 'creator' ? 420 : 12000} required rows={5} placeholder="Hatırladığınız sahneleri, kişileri ve rüyanızda hissettiklerinizi yazın…" className="glass-input dream-textarea w-full resize-y rounded-xl p-4 text-[13px] leading-6 outline-none transition" data-testid="textarea-ruya" />
              <div className="form-footnote mt-2 flex items-center justify-between gap-3 text-[10px]">
                <span>Rüya metniniz veritabanında saklanmaz; yalnızca yorum için işlenir.</span>
                <span>{dream.length.toLocaleString('tr-TR')} / {mode === 'creator' ? '420' : '12.000'}</span>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <fieldset>
                    <legend className="field-label mb-2.5 flex items-center gap-2 text-[11px] font-semibold"><Clock3 size={14} className="text-[#d4b968]" /> Vakit</legend>
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                    {([
                      { key: 'seher', label: 'Sabaha Karşı (Seher)', Icon: Sunrise },
                      { key: 'gece', label: 'Gece', Icon: MoonStar },
                      { key: 'gunduz', label: 'Gündüz', Icon: Sun },
                    ] as const).map(({ key, label, Icon }) => (
                      <button key={key} type="button" onClick={() => setTimeOfDream(key)} aria-pressed={timeOfDream === key} data-testid={`button-vakit-${key}`} className={`context-chip flex items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-[10px] transition-colors ${timeOfDream === key ? 'is-selected' : ''}`}>
                        <Icon size={15} strokeWidth={1.7} />{label}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend className="field-label mb-2.5 flex items-center gap-2 text-[11px] font-semibold"><Feather size={14} className="text-[#d4b968]" /> Tür</legend>
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                    {([
                      { key: 'huzurlu', label: 'Huzurlu & Net' },
                      { key: 'kabus', label: 'Korkutucu / Kabus' },
                      { key: 'tekrarlayan', label: 'Tekrarlayan' },
                    ] as const).map(({ key, label }) => (
                      <button key={key} type="button" onClick={() => setDreamType(key)} aria-pressed={dreamType === key} data-testid={`button-tur-${key}`} className={`context-chip rounded-xl px-2 py-2.5 text-[10px] transition-colors ${dreamType === key ? 'is-selected' : ''}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>

              {requestError && !interpretation && (
                <div role="alert" className="error-message mt-5 flex items-start gap-2 rounded-xl px-4 py-3 text-xs leading-5" data-testid="status-hata">
                  <CircleHelp size={15} className="mt-0.5 shrink-0" />{requestError}
                </div>
              )}
              {interpretDream.isError && !requestError && (
                <div role="alert" className="error-message mt-5 rounded-xl px-4 py-3 text-xs leading-5">
                  Bir sorun oluştu. Bilgileriniz formda duruyor; yeniden gönderebilirsiniz.
                </div>
              )}
              <button type="submit" disabled={busy || dream.trim().length < 10} data-testid="button-ruyami-tabir-et" className="gold-cta mt-6 flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full px-5 text-[12px] font-semibold tracking-[.01em] transition-all disabled:cursor-not-allowed disabled:opacity-55">
                {busy ? <><span className="h-4 w-4 animate-pulse rounded-full border-2 border-[#38533d] border-r-transparent" /><span>Rüyanız üzerinde düşünülüyor…</span></> : <><Sparkles size={15} /><span>Rüyamı Tabir Et &amp; Sahnele</span><ArrowRight size={15} /></>}
              </button>
              <p className="form-disclaimer mt-3 text-center text-[10px] leading-5">Bu içerik düşünmeye yardımcı olur; kesin bilgi veya dinî hüküm değildir.</p>
            </form>

            <div className="glass-panel result-panel min-h-[350px] rounded-[24px] p-5 sm:p-7">
              {!interpretation && !busy && (
                <div className="flex h-full min-h-[300px] flex-col justify-between">
                  <div>
                    <span className="empty-state-icon inline-flex h-9 w-9 items-center justify-center rounded-full"><Feather size={17} /></span>
                    <h3 className="empty-state-title serif mt-5 text-[23px] leading-snug">Bir sembol, bir his,<br />bir düşünme fırsatı.</h3>
                    <p className="empty-state-copy mt-3 max-w-sm text-[12px] leading-6">Rüyanızın çağrıştırdıklarına birlikte bakalım. Her yorum bir ihtimaldir; kendi hayatınızın bilgisi sizde.</p>
                  </div>
                  <div className="ethics-note mt-8 flex items-center gap-3 border-t pt-4 text-[10px] leading-5">
                    <span className="ethics-icon grid h-8 w-8 shrink-0 place-items-center rounded-full"><CircleHelp size={15} /></span>
                    <span>Geleneksel kaynaklardan esinlenen, kesinlik iddiası taşımayan bir yansıma.</span>
                  </div>
                </div>
              )}
              {busy && (
                <div className="flex h-full min-h-[300px] flex-col justify-center gap-5" role="status" aria-live="polite" data-testid="status-yorum-yukleniyor">
                  <DreamAnimationCanvas theme={LOADING_SCENE_THEME} className="cinematic-scene h-[188px] shrink-0 rounded-2xl" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-full animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-4/5 animate-pulse rounded bg-white/10" />
                  <p className="status-copy text-center text-xs">Rüyanız özenle ele alınıyor; sahneniz hazırlanıyor…</p>
                </div>
              )}
              {interpretation && mode === 'reflection' && (
                <div className="fade-up space-y-4" data-testid="panel-ruya-yorumu">
                  <div className="flex items-center justify-between">
                    <p className="section-eyebrow text-[10px] font-bold uppercase tracking-[.18em]">Yansımanız</p>
                    <span className="result-badge rounded-full px-2.5 py-1 text-[9px]">Size özel</span>
                  </div>
                  <DreamAnimationCanvas theme={interpretation.sceneTheme} className="cinematic-scene h-[210px] shrink-0 rounded-2xl" />
                  {dreamType === 'kabus' && (
                    <div className="kabus-note rounded-2xl p-4" data-testid="card-kabus-adabi">
                      <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[.17em]">Önce: Peygamberimizin tavsiyesi</p>
                      <p className="text-[11px] leading-5">{nightmareAdvice}</p>
                    </div>
                  )}
                  <article className="glass-card result-card rounded-2xl p-4">
                    <div className="result-card-heading flex items-start gap-3">
                      <span className="card-icon"><Compass size={15} strokeWidth={1.6} /></span>
                      <h3 className="result-card-title serif text-[19px]">Rüyanın Hikmeti &amp; Temel Semboller</h3>
                    </div>
                    <p className="result-card-copy mt-2 text-[12px] leading-[1.8]">{interpretation.wisdom}</p>
                    {!!interpretation.symbols.length && (
                      <div className="symbol-list mt-4 space-y-3 border-t pt-3">
                        {interpretation.symbols.map((item, index) => (
                          <div key={`${item.symbol}-${index}`} className="symbol-item border-l pl-3">
                            <p className="text-[11px] font-semibold">{item.symbol}</p>
                            <p className="result-card-copy mt-0.5 text-[11px] leading-5">{item.meaning}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                  <article className="glass-card result-card rounded-2xl p-4">
                    <div className="result-card-heading flex items-start gap-3">
                      <span className="card-icon"><BookOpenText size={15} strokeWidth={1.6} /></span>
                      <h3 className="result-card-title serif text-[18px]">İbn-i Şirin ve İmam Nablusi Külliyatına Göre Tabiri</h3>
                    </div>
                    <p className="result-card-copy mt-2 text-[12px] leading-[1.8]">{interpretation.detailedInterpretation}</p>
                  </article>
                  <article className="glass-card result-card rounded-2xl p-4">
                    <div className="result-card-heading flex items-start gap-3">
                      <span className="card-icon"><HeartHandshake size={15} strokeWidth={1.6} /></span>
                      <h3 className="result-card-title serif text-[18px]">Manevi Tavsiye, Dua ve Esmaül Hüsna Önerisi</h3>
                    </div>
                    <p className="result-card-copy mt-2 text-[12px] leading-[1.8]">{interpretation.dua}</p>
                    <p className="result-card-copy card-note mt-3 border-t pt-3 text-[11px] leading-5">{interpretation.asmaSuggestion}</p>
                    <p className="result-card-copy card-note mt-3 border-t pt-3 text-[11px] leading-5">{interpretation.dhikr}</p>
                  </article>
                  <p className="disclaimer-copy flex gap-2 px-1 text-[10px] leading-5"><CircleHelp size={13} className="mt-0.5 shrink-0" />{interpretation.disclaimer}</p>
                </div>
              )}
              {interpretation && mode === 'creator' && (
                <div className="fade-up flex justify-center" data-testid="panel-tiktok-yorumu">
                  <CreatorPortrait dream={dream} username={username} interpretation={interpretation} theme={interpretation.sceneTheme} nightmare={dreamType === 'kabus' ? nightmareAdvice : null} />
                </div>
              )}
              {interpretation && (
                <div className="share-actions mt-5 border-t pt-5">
                  <button type="button" onClick={createAndShareCard} data-testid="button-manevi-kart-paylas" className="share-cta flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full px-5 text-[12px] font-semibold transition-colors">
                    <MoonStar size={15} /> Manevi Kart Oluştur &amp; Paylaş
                  </button>
                  {shareFeedback && <p className="status-copy mt-2 text-center text-[10px]" role="status" data-testid="status-paylasim">{shareFeedback}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {shareCardUrl && (
        <div className="share-modal-backdrop fixed inset-0 z-50 grid place-items-center p-4" data-testid="modal-manevi-kart">
          <section role="dialog" aria-modal="true" aria-labelledby="share-card-title" className="share-modal max-h-[94dvh] w-full max-w-md overflow-y-auto rounded-3xl p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 id="share-card-title" className="modal-title serif text-xl">Manevi kartınız hazır</h2>
              <button type="button" onClick={() => setShareCardUrl('')} className="modal-close rounded-full px-3 py-1.5 text-xs font-semibold" data-testid="button-kart-kapat">Kapat</button>
            </div>
            <img src={shareCardUrl} alt="Paylaşmaya hazır manevi rüya kartı" className="share-card-image mx-auto max-h-[62dvh] rounded-xl" data-testid="img-manevi-kart" />
            <p className="modal-caption my-3 text-center text-[11px]">Görseli telefonunuza kaydetmek için basılı tutabilirsiniz.</p>
            <div className="grid grid-cols-2 gap-2">
              <a href={shareCardUrl} download="manevi-ruya-karti.png" className="modal-action rounded-full px-3 py-3 text-center text-[11px] font-semibold" data-testid="link-gorseli-indir">Görseli İndir</a>
              <button type="button" onClick={copyShareText} className="modal-action modal-action--secondary rounded-full px-3 py-3 text-[11px] font-semibold" data-testid="button-metni-kopyala">Metni Kopyala</button>
            </div>
            {shareFeedback && <p role="status" className="status-copy mt-3 text-center text-[11px]" data-testid="status-kart-kopyalama">{shareFeedback}</p>}
          </section>
        </div>
      )}

      <footer className="site-footer border-t px-5 py-7 text-center">
        <p className="footer-text text-[10px] leading-5">Rüya yorumları kesin bilgi, gayb haberi veya fetva değildir. Dinî sorularınız için yetkin bir uzmana danışın.</p>
      </footer>
    </main>
  );
}

function drawCanvasParagraph(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
  align: CanvasTextAlign = 'left',
) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  let truncated = false;

  for (const word of words) {
    const nextLine = line ? `${line} ${word}` : word;
    if (context.measureText(nextLine).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length >= maxLines) {
        truncated = true;
        break;
      }
    } else {
      line = nextLine;
    }
  }

  if (!truncated && line) lines.push(line);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    truncated = true;
  }
  if (truncated && lines.length) {
    let lastLine = lines[lines.length - 1];
    while (lastLine && context.measureText(`${lastLine}…`).width > maxWidth) {
      lastLine = lastLine.slice(0, -1);
    }
    lines[lines.length - 1] = `${lastLine.trimEnd()}…`;
  }

  const previousAlign = context.textAlign;
  context.textAlign = align;
  lines.forEach((lineText, index) => context.fillText(lineText, x, y + index * lineHeight));
  context.textAlign = previousAlign;
  return y + lines.length * lineHeight;
}

function CreatorPortrait({ dream, username, interpretation, theme, nightmare }: {
  dream: string;
  username: string;
  interpretation: DreamInterpretation;
  theme: DreamSceneTheme;
  nightmare: string | null;
}) {
  return (
    <article className="creator-card portrait-frame relative flex w-full max-w-[310px] flex-col overflow-hidden rounded-[25px]" data-testid="card-dikey-paylasim">
      <div className="creator-pattern absolute inset-0" />
      <div className="creator-scene-wrap relative h-[37%] min-h-0 shrink-0 overflow-hidden">
        <DreamAnimationCanvas theme={theme} className="cinematic-scene h-full rounded-none" showCaption={false} />
        <div className="creator-scene-fade absolute inset-x-0 bottom-0 h-20" />
        <div className="creator-scene-caption absolute bottom-3 left-5 right-5 flex items-center justify-between">
          <span className="text-[8px] font-semibold uppercase tracking-[.2em] text-[#dfcf9a]">Rüya üzerine bir yansıma</span>
          <MoonStar size={14} className="text-[#dfcf9a]" strokeWidth={1.4} />
        </div>
      </div>
      <div className="creator-copy relative flex min-h-0 flex-1 flex-col overflow-hidden px-5 pb-4 pt-1">
        <p className="creator-quote text-[9px] leading-[1.45]">
          <span className="text-[#d7c47e]">“</span>{dream}<span className="text-[#d7c47e]">”</span>
        </p>
        <p className="mt-2 text-[9px] font-semibold text-[#d8c57f]">{username.trim() ? `@${username.trim().replace(/^@/, '')}` : 'Bir takipçinin rüyası'}</p>
        <div className="my-3 h-px w-full bg-[#d0b966]/35" />
        {nightmare && (
          <div className="mb-2 rounded-lg border border-[#d0bc7d]/30 bg-[#e3d5a3]/10 px-2.5 py-2">
            <p className="mb-1 text-[7px] font-bold uppercase tracking-[.13em] text-[#e6d494]">Kâbus sonrası sünnet adabı</p>
            <p className="line-clamp-3 text-[8px] leading-[1.45] text-[#e8e0c5]">{nightmare}</p>
          </div>
        )}
        <h3 className="serif text-[15px] leading-tight text-[#e3d292]">Bir düşünme ihtimali</h3>
        <p className="mt-1.5 text-[8px] leading-[1.4] text-[#e1e5d9]/85">{interpretation.detailedInterpretation}</p>
        <div className="mt-auto pt-2">
          <p className="text-[7px] font-bold uppercase tracking-[.16em] text-[#d8c57f]">Dua</p>
          <p className="mt-1 text-[8px] leading-[1.4] text-[#e1e5d9]/85">{interpretation.dua}</p>
          <p className="mt-2 text-[7px] font-bold uppercase tracking-[.16em] text-[#d8c57f]">Esma ve zikir</p>
          <p className="mt-1 text-[7px] leading-[1.35] text-[#e1e5d9]/85">{interpretation.asmaSuggestion} {interpretation.dhikr}</p>
          <p className="mt-2 border-t border-[#d0b966]/25 pt-2 text-[7px] leading-[1.45] text-[#c4cbbb]">Bu yansıma kesin bilgi veya dinî hüküm değildir.</p>
        </div>
      </div>
    </article>
  );
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
