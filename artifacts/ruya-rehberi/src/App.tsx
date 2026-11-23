import { type FormEvent, type ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { useGenerateDreamScene, useInterpretDream } from '@workspace/api-client-react';
import {
  ArrowDown,
  ArrowRight,
  Check,
  CircleHelp,
  Clock3,
  Feather,
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
type DreamInterpretation = {
  wisdom: string;
  symbols: { symbol: string; meaning: string }[];
  detailedInterpretation: string;
  dua: string;
  asmaSuggestion: string;
  dhikr: string;
  nightmareAdvice: string | null;
  scenePrompt: string;
  disclaimer: string;
};
type DreamScene = { imageDataUrl: string };

const proceduralSceneSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1200">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#102a39"/><stop offset=".58" stop-color="#145043"/><stop offset="1" stop-color="#1a5144"/></linearGradient>
    <radialGradient id="glow"><stop stop-color="#f3d98a" stop-opacity=".72"/><stop offset="1" stop-color="#e8c66e" stop-opacity="0"/></radialGradient>
    <pattern id="geometry" width="120" height="120" patternUnits="userSpaceOnUse"><path d="M60 4 116 60 60 116 4 60Z M60 28 92 60 60 92 28 60Z" fill="none" stroke="#e1c77a" stroke-opacity=".16" stroke-width="1.5"/><circle cx="60" cy="60" r="4" fill="#e1c77a" fill-opacity=".22"/></pattern>
    <linearGradient id="water" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#174a49"/><stop offset="1" stop-color="#142f41"/></linearGradient>
  </defs>
  <rect width="900" height="1200" fill="url(#sky)"/>
  <circle cx="650" cy="290" r="250" fill="url(#glow)"/>
  <path d="M685 160a112 112 0 1 0 92 168 94 94 0 0 1-92-168Z" fill="#f0d88e" fill-opacity=".92"/>
  <path d="M0 650 170 470l126 122 170-205 186 225 110-112 138 148v220H0Z" fill="#173b3b" fill-opacity=".8"/>
  <path d="M0 740 184 612l140 112 163-162 184 166 114-94 115 94v200H0Z" fill="#1a493f"/>
  <rect y="820" width="900" height="380" fill="url(#water)"/>
  <path d="M105 872c140-25 265-20 392 4s214 25 322 1M34 938c176-20 297-13 442 11s259 19 389-5M96 1010c125-16 257-6 365 13s246 13 347-6M42 1090c154-13 257 0 393 15s262 7 402-8" fill="none" stroke="#ddc779" stroke-opacity=".42" stroke-width="3"/>
  <path d="M0 0h900v1200H0z" fill="url(#geometry)" opacity=".6"/>
  <path d="M165 820 450 335 735 820M260 820 450 494 640 820" fill="none" stroke="#dfc46f" stroke-opacity=".14" stroke-width="3"/>
</svg>`;
const proceduralSceneDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(proceduralSceneSvg)}`;

function SceneVisual({ scene, className = '', loading = false, showLabel = true }: {
  scene: DreamScene | null;
  className?: string;
  loading?: boolean;
  showLabel?: boolean;
}) {
  return (
    <div className={`scene-frame relative overflow-hidden rounded-2xl bg-[#183e38] ${className}`} data-testid="visual-ruya-sahnesi">
      <img
        src={scene?.imageDataUrl ?? proceduralSceneDataUrl}
        alt="Sükûnetli bir manzara, ay ışığı ve altın geometrik desenlerle sembolik rüya sahnesi"
        className="scene-image h-full w-full object-cover"
        data-testid="img-ruya-sahnesi"
      />
      <div className="light-particles absolute inset-0" aria-hidden="true" />
      {showLabel && <span className="absolute bottom-3 left-3 rounded-full bg-[#122e2a]/75 px-3 py-1 text-[9px] text-[#f4ecd4] backdrop-blur-sm">Sembolik sahne</span>}
      {loading && <span className="absolute bottom-3 right-3 rounded-full bg-[#122e2a]/75 px-3 py-1 text-[9px] text-[#f4ecd4] backdrop-blur-sm">Görsel sahne hazırlanıyor</span>}
    </div>
  );
}

function Home() {
  const [mode, setMode] = useState<'reflection' | 'creator'>('reflection');
  const [dream, setDream] = useState('');
  const [timeOfDream, setTimeOfDream] = useState<TimeOfDream>('seher');
  const [dreamType, setDreamType] = useState<DreamType>('huzurlu');
  const [username, setUsername] = useState('');
  const [interpretation, setInterpretation] = useState<DreamInterpretation | null>(null);
  const [scene, setScene] = useState<DreamScene | null>(null);
  const [requestError, setRequestError] = useState('');
  const [shareFeedback, setShareFeedback] = useState('');
  const interpretDream = useInterpretDream();
  const generateScene = useGenerateDreamScene();

  const submitDream = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanDream = dream.trim();
    if (cleanDream.length < 10) {
      setRequestError('Rüyanızı en az 10 karakterle biraz daha anlatır mısınız?');
      return;
    }
    setRequestError('');
    setInterpretation(null);
    setScene(null);
    setShareFeedback('');
    const input: DreamInput = {
      dream: cleanDream,
      timeOfDream,
      dreamType,
      ...(mode === 'creator' && username.trim() ? { username: username.trim().replace(/^@/, '') } : {}),
    };
    interpretDream.mutate({ data: input }, {
      onSuccess: (result) => {
        setInterpretation(result);
        generateScene.mutate({ data: { scenePrompt: result.scenePrompt } }, {
          onSuccess: (generated) => setScene(generated),
          onError: () => setScene(null),
        });
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

      const image = new Image();
      image.src = scene?.imageDataUrl ?? proceduralSceneDataUrl;
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('Scene image could not be loaded'));
      });

      const imageRatio = image.width / image.height;
      const targetRatio = canvas.width / 710;
      const cropWidth = imageRatio > targetRatio ? image.height * targetRatio : image.width;
      const cropHeight = imageRatio > targetRatio ? image.height : image.width / targetRatio;
      const cropX = (image.width - cropWidth) / 2;
      const cropY = (image.height - cropHeight) / 2;
      context.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, canvas.width, 710);
      const fade = context.createLinearGradient(0, 470, 0, 760);
      fade.addColorStop(0, 'rgba(16, 47, 45, 0)');
      fade.addColorStop(1, '#102f2d');
      context.fillStyle = fade;
      context.fillRect(0, 460, canvas.width, 300);
      context.fillStyle = '#102f2d';
      context.fillRect(0, 710, canvas.width, 1210);

      context.fillStyle = '#dfcf9a';
      context.font = '600 24px "DM Sans", sans-serif';
      context.fillText('RÜYA ÜZERİNE BİR YANSIMA', 72, 790);
      context.fillStyle = '#f4efdf';
      context.font = '600 38px "Playfair Display", Georgia, serif';
      context.fillText('Rüyanın Hikmeti', 72, 860);

      let y = 910;
      context.fillStyle = '#d8c57f';
      context.font = '600 22px "DM Sans", sans-serif';
      context.fillText(username.trim() ? `@${username.trim().replace(/^@/, '')}` : 'Manevi yansıma', 72, y);
      y += 38;
      context.fillStyle = '#f4efdf';
      context.font = '400 23px "DM Sans", sans-serif';
      y = drawCanvasParagraph(context, `“${dream}”`, 72, y, 936, 31, 4) + 30;
      context.fillStyle = '#dfcf9a';
      context.font = '600 23px "DM Sans", sans-serif';
      context.fillText('Temel düşünce', 72, y);
      y += 34;
      context.fillStyle = '#f4efdf';
      context.font = '400 22px "DM Sans", sans-serif';
      y = drawCanvasParagraph(context, interpretation.wisdom, 72, y, 936, 30, 4) + 26;
      context.fillStyle = '#dfcf9a';
      context.font = '600 23px "DM Sans", sans-serif';
      context.fillText('Tabir üzerine', 72, y);
      y += 34;
      context.fillStyle = '#f4efdf';
      context.font = '400 21px "DM Sans", sans-serif';
      y = drawCanvasParagraph(context, interpretation.detailedInterpretation, 72, y, 936, 29, 8) + 24;
      context.fillStyle = '#dfcf9a';
      context.font = '600 23px "DM Sans", sans-serif';
      context.fillText('Dua', 72, y);
      y += 34;
      context.fillStyle = '#f4efdf';
      context.font = '400 21px "DM Sans", sans-serif';
      y = drawCanvasParagraph(context, interpretation.dua, 72, y, 936, 29, 3) + 22;
      context.fillStyle = '#d8c57f';
      context.font = '500 18px "DM Sans", sans-serif';
      drawCanvasParagraph(context, `${interpretation.asmaSuggestion} ${interpretation.dhikr}`, 72, y, 936, 25, 3);
      context.fillStyle = '#c4cbbb';
      context.font = '400 16px "DM Sans", sans-serif';
      context.fillText('Bu yansıma kesin bilgi veya dinî hüküm değildir.', 72, 1870);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => result ? resolve(result) : reject(new Error('Card export failed')), 'image/png');
      });
      const file = new File([blob], 'manevi-ruya-karti.png', { type: 'image/png' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Manevi Rüya Kartı' });
        setShareFeedback('Manevi kart paylaşım menüsünde hazır.');
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'manevi-ruya-karti.png';
        link.click();
        URL.revokeObjectURL(url);
        setShareFeedback('Manevi kart cihazınıza indirildi.');
      }
    } catch (error) {
      if ((error as { name?: string })?.name !== 'AbortError') {
        setShareFeedback('Kart oluşturulamadı. Lütfen sahne yüklendikten sonra yeniden deneyin.');
      }
    }
  };

  const busy = interpretDream.isPending;
  const nightmareAdvice = interpretation?.nightmareAdvice ||
    'Peygamberimizin tavsiyesine uygun olarak Allah’a sığınabilir, sol tarafınıza hafifçe üç kez üfleyebilir ve bu rüyayı paylaşmamayı tercih edebilirsiniz.';

  return (
    <main className="min-h-[100dvh] bg-[#f3f0e7] text-[#183b35]">
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-10">
        <a href="/" className="flex items-center gap-3" aria-label="Rüya Rehberi ana sayfa">
          <span className="grid h-11 w-11 place-items-center rounded-full border border-[#c8b477] bg-[#173d35] text-[#e7d39a]">
            <MoonStar size={20} strokeWidth={1.5} />
          </span>
          <span>
            <span className="serif block text-[19px] leading-none tracking-tight">Rüya Rehberi</span>
            <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[.24em] text-[#71817a]">Sükûnetle düşünmek için</span>
          </span>
        </a>
        <div className="hidden items-center gap-2 text-xs text-[#66756e] sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-[#a48c4c]" />
          Özel ve kişisel bir alan
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#123b34] text-[#f6f1e3]">
        <div className="geometry absolute inset-0 opacity-40" />
        <div className="absolute -right-24 -top-44 h-[440px] w-[440px] rounded-full border border-[#d2b96f]/20" />
        <div className="absolute -right-8 -top-28 h-[330px] w-[330px] rounded-full border border-[#d2b96f]/15" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-5 pb-12 pt-12 md:grid-cols-[1.1fr_.9fr] md:items-end md:px-10 md:pb-16 md:pt-[68px]">
          <div className="max-w-2xl">
            <div className="mb-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[.24em] text-[#d9c57f]">
              <span className="h-px w-8 bg-[#d9c57f]" /> Hayırlı Vakitler
            </div>
            <h1 className="serif max-w-[670px] text-[38px] leading-[1.12] tracking-[-.035em] sm:text-[50px] md:text-[58px]">
              İslami Rüya Tabiri<br />
              <span className="text-[#d9c57f]">&amp; Manevi Rehber</span>
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-[#e1e5d9]/80 md:text-[15px]">
              Bir rüya gördünüz. Biraz üzerinde duralım. İslami geleneğe saygılı, sembollere açık bir yansıma; geleceği haber vermez, düşünmek için sakin bir alan sunar.
            </p>
            <a href="#ruya-formu" className="mt-7 inline-flex items-center gap-2 text-xs font-semibold text-[#eadba9] transition-colors hover:text-white">
              Yansımaya başlayın <ArrowDown size={14} />
            </a>
          </div>
          <div className="hidden justify-end md:flex">
            <div className="relative mr-6 h-[236px] w-[236px] rounded-full border border-[#d2b96f]/30 p-4">
              <div className="absolute inset-7 rounded-full border border-[#d2b96f]/20" />
              <div className="geometry grid h-full w-full place-items-center rounded-full bg-[#1a4a40]">
                <div className="grid h-[112px] w-[112px] place-items-center rounded-full border border-[#d9c57f]/50 bg-[#173f37] text-[#e5d49c]">
                  <MoonStar size={49} strokeWidth={1} />
                </div>
              </div>
              <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#123b34] px-3 text-[10px] uppercase tracking-[.2em] text-[#d9c57f]">Sakin bir tefekkür</span>
            </div>
          </div>
        </div>
      </section>

      <section id="ruya-formu" className="mx-auto max-w-7xl px-4 pb-20 pt-7 md:px-10 md:pt-9">
        <div className="mx-auto max-w-[960px]">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#987f3d]">İlk adım</p>
              <h2 className="serif mt-1 text-[27px] text-[#183b35]">Rüyanızı kendi kelimelerinizle anlatın</h2>
            </div>
            <div className="inline-flex w-fit rounded-full border border-[#d7d0bf] bg-[#ebe7dc] p-1" role="tablist" aria-label="Yansıtma biçimi">
              <button type="button" role="tab" aria-selected={mode === 'reflection'} data-testid="tab-kisisel-yansima" onClick={() => setMode('reflection')} className={`rounded-full px-4 py-2 text-[11px] font-semibold transition-colors ${mode === 'reflection' ? 'bg-[#173d35] text-[#f5f0e4] shadow-sm' : 'text-[#66756e] hover:text-[#183b35]'}`}>
                Kişisel yansıma
              </button>
              <button type="button" role="tab" aria-selected={mode === 'creator'} data-testid="tab-tiktok-yorum-modu" onClick={() => setMode('creator')} className={`rounded-full px-4 py-2 text-[11px] font-semibold transition-colors ${mode === 'creator' ? 'bg-[#173d35] text-[#f5f0e4] shadow-sm' : 'text-[#66756e] hover:text-[#183b35]'}`}>
                TikTok Yorum Modu
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.08fr_.92fr]">
            <form onSubmit={submitDream} className="rounded-[24px] border border-[#ded8c9] bg-[#faf8f1] p-5 shadow-[0_18px_50px_-38px_rgba(18,59,52,.42)] sm:p-7">
              {mode === 'creator' && (
                <label className="mb-5 block">
                  <span className="mb-2 block text-[11px] font-semibold text-[#324c44]">Takipçi kullanıcı adı</span>
                  <div className="flex items-center rounded-xl border border-[#d8d2c3] bg-[#fffdf7] px-3 focus-within:border-[#a88c49] focus-within:ring-2 focus-within:ring-[#a88c49]/15">
                    <span className="text-sm text-[#9a927f]">@</span>
                    <input value={username} onChange={(event) => setUsername(event.target.value)} maxLength={40} placeholder="kullaniciadi" className="w-full border-0 bg-transparent px-2 py-3 text-sm text-[#203d35] outline-none placeholder:text-[#aaa493]" data-testid="input-kullanici-adi" />
                  </div>
                </label>
              )}
              <label htmlFor="dream-text" className="mb-2 block text-[11px] font-semibold text-[#324c44]">{mode === 'creator' ? 'Takipçinin yorumu' : 'Rüyanız'}</label>
              <textarea id="dream-text" value={dream} onChange={(event) => setDream(event.target.value)} minLength={10} maxLength={mode === 'creator' ? 420 : 12000} required rows={5} placeholder="Hatırladığınız sahneleri, kişileri ve rüyanızda hissettiklerinizi yazın…" className="w-full resize-y rounded-xl border border-[#d8d2c3] bg-[#fffdf7] p-4 text-[13px] leading-6 text-[#203d35] outline-none transition focus:border-[#a88c49] focus:ring-2 focus:ring-[#a88c49]/15 placeholder:text-[#aaa493]" data-testid="textarea-ruya" />
              <div className="mt-2 flex items-center justify-between text-[10px] text-[#89938a]">
                <span>Rüya metniniz veritabanında saklanmaz; yalnızca yorum için işlenir.</span>
                <span>{dream.length.toLocaleString('tr-TR')} / {mode === 'creator' ? '420' : '12.000'}</span>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <fieldset>
                    <legend className="mb-2.5 flex items-center gap-2 text-[11px] font-semibold text-[#324c44]"><Clock3 size={14} className="text-[#987f3d]" /> Vakit</legend>
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                    {([
                      { key: 'seher', label: 'Sabaha Karşı (Seher)', Icon: Sunrise },
                      { key: 'gece', label: 'Gece', Icon: MoonStar },
                      { key: 'gunduz', label: 'Gündüz', Icon: Sun },
                    ] as const).map(({ key, label, Icon }) => (
                      <button key={key} type="button" onClick={() => setTimeOfDream(key)} aria-pressed={timeOfDream === key} data-testid={`button-vakit-${key}`} className={`flex items-center justify-center gap-2 rounded-xl border px-2 py-2.5 text-[10px] transition-colors ${timeOfDream === key ? 'border-[#7e927f] bg-[#e6ece2] text-[#194239]' : 'border-[#e3ded2] bg-[#fcfaf4] text-[#758078] hover:border-[#c3b98e]'}`}>
                        <Icon size={15} strokeWidth={1.7} />{label}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend className="mb-2.5 flex items-center gap-2 text-[11px] font-semibold text-[#324c44]"><Feather size={14} className="text-[#987f3d]" /> Tür</legend>
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                    {([
                      { key: 'huzurlu', label: 'Huzurlu & Net' },
                      { key: 'kabus', label: 'Korkutucu / Kabus' },
                      { key: 'tekrarlayan', label: 'Tekrarlayan' },
                    ] as const).map(({ key, label }) => (
                      <button key={key} type="button" onClick={() => setDreamType(key)} aria-pressed={dreamType === key} data-testid={`button-tur-${key}`} className={`rounded-xl border px-2 py-2.5 text-[10px] transition-colors ${dreamType === key ? 'border-[#7e927f] bg-[#e6ece2] text-[#194239]' : 'border-[#e3ded2] bg-[#fcfaf4] text-[#758078] hover:border-[#c3b98e]'}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>

              {requestError && !interpretation && (
                <div role="alert" className="mt-5 flex items-start gap-2 rounded-xl border border-[#e3c7b9] bg-[#fbf0ea] px-4 py-3 text-xs leading-5 text-[#814f3e]" data-testid="status-hata">
                  <CircleHelp size={15} className="mt-0.5 shrink-0" />{requestError}
                </div>
              )}
              {interpretDream.isError && !requestError && (
                <div role="alert" className="mt-5 rounded-xl border border-[#e3c7b9] bg-[#fbf0ea] px-4 py-3 text-xs leading-5 text-[#814f3e]">
                  Bir sorun oluştu. Bilgileriniz formda duruyor; yeniden gönderebilirsiniz.
                </div>
              )}
              <button type="submit" disabled={busy || dream.trim().length < 10} data-testid="button-ruyami-tabir-et" className="mt-6 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#173d35] px-5 text-[12px] font-semibold tracking-[.01em] text-[#f6f1e3] transition-all hover:bg-[#215349] disabled:cursor-not-allowed disabled:opacity-55">
                {busy ? <><span className="h-4 w-4 animate-pulse rounded-full border-2 border-[#e7d39a] border-r-transparent" /> Rüyanız üzerinde düşünülüyor…</> : <><Sparkles size={15} className="text-[#e2cc87]" /> Rüyamı Tabir Et &amp; Sahnele <ArrowRight size={15} /></>}
              </button>
              <p className="mt-3 text-center text-[10px] leading-5 text-[#8b9288]">Bu içerik düşünmeye yardımcı olur; kesin bilgi veya dinî hüküm değildir.</p>
            </form>

            <div className="min-h-[350px] rounded-[24px] border border-[#d9d2bf] bg-[#eae6da] p-5 sm:p-7">
              {!interpretation && !busy && (
                <div className="flex h-full min-h-[300px] flex-col justify-between">
                  <div>
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#dce4d8] text-[#335d4e]"><Feather size={17} /></span>
                    <h3 className="serif mt-5 text-[23px] leading-snug text-[#1c4138]">Bir sembol, bir his,<br />bir düşünme fırsatı.</h3>
                    <p className="mt-3 max-w-sm text-[12px] leading-6 text-[#68776d]">Rüyanızın çağrıştırdıklarına birlikte bakalım. Her yorum bir ihtimaldir; kendi hayatınızın bilgisi sizde.</p>
                  </div>
                  <div className="mt-8 flex items-center gap-3 border-t border-[#d2cbbb] pt-4 text-[10px] leading-5 text-[#768278]">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#c8bb92] text-[#907b43]"><CircleHelp size={15} /></span>
                    <span>Geleneksel kaynaklardan esinlenen, kesinlik iddiası taşımayan bir yansıma.</span>
                  </div>
                </div>
              )}
              {busy && (
                <div className="flex h-full min-h-[300px] flex-col justify-center gap-5" role="status" aria-live="polite" data-testid="status-yorum-yukleniyor">
                  <SceneVisual scene={null} className="h-[188px] shrink-0" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-[#d8d8c9]" />
                  <div className="h-3 w-full animate-pulse rounded bg-[#d8d8c9]" />
                  <div className="h-3 w-4/5 animate-pulse rounded bg-[#d8d8c9]" />
                  <p className="text-center text-xs text-[#708076]">Rüyanız özenle ele alınıyor; sahneniz hazırlanıyor…</p>
                </div>
              )}
              {interpretation && mode === 'reflection' && (
                <div className="fade-up space-y-4" data-testid="panel-ruya-yorumu">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#927c42]">Yansımanız</p>
                    <span className="rounded-full border border-[#c9c2af] px-2.5 py-1 text-[9px] text-[#738077]">Size özel</span>
                  </div>
                  {dreamType === 'kabus' && (
                    <div className="rounded-2xl border border-[#d7c596] bg-[#f3ecd9] p-4" data-testid="card-kabus-adabi">
                      <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[.17em] text-[#927c42]">Önce: Peygamberimizin tavsiyesi</p>
                      <p className="text-[11px] leading-5 text-[#4b584c]">{nightmareAdvice}</p>
                    </div>
                  )}
                  <SceneVisual scene={scene} className="h-[210px]" loading={generateScene.isPending} />
                  <article className="rounded-2xl border border-[#d8d0bc] bg-[#f7f4e9] p-4">
                    <h3 className="serif text-[19px] text-[#1c4138]">Rüyanın Hikmeti &amp; Temel Semboller</h3>
                    <p className="mt-2 text-[12px] leading-[1.8] text-[#52645a]">{interpretation.wisdom}</p>
                    {!!interpretation.symbols.length && (
                      <div className="mt-4 space-y-3 border-t border-[#ded8c8] pt-3">
                        {interpretation.symbols.map((item, index) => (
                          <div key={`${item.symbol}-${index}`} className="border-l border-[#bda45d] pl-3">
                            <p className="text-[11px] font-semibold text-[#324c44]">{item.symbol}</p>
                            <p className="mt-0.5 text-[11px] leading-5 text-[#6b786f]">{item.meaning}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                  <article className="rounded-2xl border border-[#d8d0bc] bg-[#f7f4e9] p-4">
                    <h3 className="serif text-[18px] text-[#1c4138]">İbn-i Şirin ve İmam Nablusi Külliyatına Göre Tabiri</h3>
                    <p className="mt-2 text-[12px] leading-[1.8] text-[#52645a]">{interpretation.detailedInterpretation}</p>
                  </article>
                  <article className="rounded-2xl border border-[#d8d0bc] bg-[#f7f4e9] p-4">
                    <h3 className="serif text-[18px] text-[#1c4138]">Manevi Tavsiye, Dua ve Esmaül Hüsna Önerisi</h3>
                    <p className="mt-2 text-[12px] leading-[1.8] text-[#52645a]">{interpretation.dua}</p>
                    <p className="mt-3 border-t border-[#ded8c8] pt-3 text-[11px] leading-5 text-[#68766c]">{interpretation.asmaSuggestion}</p>
                    <p className="mt-3 border-t border-[#ded8c8] pt-3 text-[11px] leading-5 text-[#68766c]">{interpretation.dhikr}</p>
                  </article>
                  <p className="flex gap-2 px-1 text-[10px] leading-5 text-[#7d877d]"><CircleHelp size={13} className="mt-0.5 shrink-0" />{interpretation.disclaimer}</p>
                </div>
              )}
              {interpretation && mode === 'creator' && (
                <div className="fade-up flex justify-center" data-testid="panel-tiktok-yorumu">
                  <CreatorPortrait dream={dream} username={username} interpretation={interpretation} scene={scene} sceneLoading={generateScene.isPending} nightmare={dreamType === 'kabus' ? nightmareAdvice : null} />
                </div>
              )}
              {interpretation && (
                <div className="mt-5 border-t border-[#d9d2bf] pt-5">
                  <button type="button" onClick={createAndShareCard} data-testid="button-manevi-kart-paylas" className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-[#173d35] px-5 text-[12px] font-semibold text-[#f6f1e3] transition-colors hover:bg-[#215349]">
                    <MoonStar size={15} className="text-[#e2cc87]" /> Manevi Kart Oluştur &amp; Paylaş
                  </button>
                  {shareFeedback && <p className="mt-2 text-center text-[10px] text-[#617267]" role="status" data-testid="status-paylasim">{shareFeedback}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#ddd7c9] bg-[#eeeadf] px-5 py-6 text-center">
        <p className="text-[10px] leading-5 text-[#748078]">Rüya yorumları kesin bilgi, gayb haberi veya fetva değildir. Dinî sorularınız için yetkin bir uzmana danışın.</p>
      </footer>
    </main>
  );
}

function CreatorPortrait({ dream, username, interpretation, scene, sceneLoading, nightmare }: {
  dream: string;
  username: string;
  interpretation: DreamInterpretation;
  scene: DreamScene | null;
  sceneLoading: boolean;
  nightmare: string | null;
}) {
  return (
    <article className="portrait-frame relative flex w-full max-w-[310px] flex-col overflow-hidden rounded-[25px] border border-[#c8b477]/45 bg-[#102f2d] text-[#f4efdf] shadow-[0_16px_48px_-18px_rgba(16,43,39,.55)]" data-testid="card-dikey-paylasim">
      <div className="geometry absolute inset-0 opacity-25" />
      <div className="relative h-[37%] min-h-0 shrink-0 overflow-hidden">
        <SceneVisual scene={scene} className="h-full rounded-none" loading={sceneLoading} showLabel={false} />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#102f2d] to-transparent" />
        <div className="absolute bottom-3 left-5 right-5 flex items-center justify-between">
          <span className="text-[8px] font-semibold uppercase tracking-[.2em] text-[#dfcf9a]">Rüya üzerine bir yansıma</span>
          <MoonStar size={14} className="text-[#dfcf9a]" strokeWidth={1.4} />
        </div>
      </div>
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden px-5 pb-4 pt-1">
      <p className="text-[9px] leading-[1.45] text-[#f4efdf]">
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
