import './_group.css';
import './Cinematic.css';
import { useState } from 'react';
import { ArrowDown, ArrowRight, Check, Clock3, Feather, MoonStar, Sparkles, Sun, Sunrise, Wind } from 'lucide-react';
import { DreamAnimationCanvas, type DreamSceneTheme } from './_DreamAnimationCanvas';

type ReflectionMode = 'personal' | 'tiktok';
type DreamTime = 'seher' | 'gece' | 'gunduz';
type DreamType = 'huzurlu' | 'kabus' | 'tekrarlayan';

const sceneTheme: DreamSceneTheme = {
  atmosphere: 'water_moon',
  primaryColor: '#174b43',
  accentColor: '#e5ca82',
  sceneCaption: 'Ay ışığında sakin bir su, uzakta yumuşak dağ siluetleri.',
};

const interpretations = [
  {
    number: '01',
    title: 'Su · Duyguların akışı',
    text: 'Durgun su, son günlerde içinizde yer açmaya çalıştığınız duyguları çağrıştırabilir. Ay ışığının suya düşmesi, karışık görünen bir konuda kendi iç sesinizi daha net duymaya başladığınız bir döneme işaret ediyor olabilir.',
    prompt: 'Bu suya bakarken içinizde en çok hangi duygu beliriyor?',
  },
  {
    number: '02',
    title: 'Ay · Sükûnet ve fark ediş',
    text: 'Geceyi aydınlatan ay, her şeyin bir anda çözülmesi değil; karanlıkta küçük bir yön duygusu bulmak gibi düşünülebilir. Belki de şu sıralar cevaptan çok, sakinlikle bakmaya ihtiyaç duyduğunuz bir mesele var.',
    prompt: 'Hayatınızda biraz daha aydınlık görmek istediğiniz konu ne?',
  },
  {
    number: '03',
    title: 'Dağlar · Sabırla aşılan yol',
    text: 'Uzakta duran dağlar, önünüzdeki sürecin tamamını değil, yalnızca bir sonraki adımı görmenin yeterli olabileceğini hatırlatıyor. Bu sembol kesin bir haber değil; sabır, emek ve tevekkül üzerine düşünmek için bir davet olabilir.',
    prompt: 'Bugün atabileceğiniz küçük ama anlamlı adım hangisi?',
  },
];

function Mandala() {
  return (
    <div className="mandala" aria-hidden="true">
      <svg viewBox="0 0 400 400">
        <circle cx="200" cy="200" r="188" />
        <circle cx="200" cy="200" r="177" />
        <circle cx="200" cy="200" r="138" />
        <circle cx="200" cy="200" r="126" />
        <circle cx="200" cy="200" r="64" />
        <polygon points="200,22 231,169 378,200 231,231 200,378 169,231 22,200 169,169" />
        <polygon points="200,35 258,142 365,200 258,258 200,365 142,258 35,200 142,142" />
        <polygon points="200,65 245,155 335,200 245,245 200,335 155,245 65,200 155,155" />
        {Array.from({ length: 16 }, (_, index) => (
          <path key={index} d="M200 12 C224 69 224 99 200 126 C176 99 176 69 200 12Z" transform={`rotate(${index * 22.5} 200 200)`} />
        ))}
        {Array.from({ length: 16 }, (_, index) => (
          <path key={`inner-${index}`} d="M200 137 Q219 168 200 184 Q181 168 200 137Z" transform={`rotate(${index * 22.5} 200 200)`} />
        ))}
      </svg>
    </div>
  );
}

export function Cinematic() {
  const [mode, setMode] = useState<ReflectionMode>('personal');
  const [time, setTime] = useState<DreamTime>('seher');
  const [dreamType, setDreamType] = useState<DreamType>('huzurlu');
  const [dream, setDream] = useState('Ay ışığında sakin bir suyun kıyısındaydım. Uzakta dağlar görünüyordu; içimde huzur ve ferahlık vardı.');
  const [username, setUsername] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const selectClass = (active: boolean) => `choice min-h-10 rounded-xl px-3 py-2 text-left text-[11px] leading-4 ${active ? '' : 'hover:border-[#d9bd78]/50 hover:text-[#f3ecd9]'}`;
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    document.getElementById('yorum')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="ruya-cinematic min-h-[100dvh]">
      <div className="gold-motes" aria-hidden="true" />
      <Mandala />
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-10 md:py-7">
        <a href="#baslangic" className="flex items-center gap-3" aria-label="Rüya Rehberi ana sayfa">
          <span className="grid h-11 w-11 place-items-center rounded-full border border-[#d9bd78]/55 bg-[#10332a]/80 text-[#e4cb8d] shadow-[inset_0_0_18px_rgba(213,185,115,.08)]">
            <MoonStar size={20} strokeWidth={1.35} />
          </span>
          <span>
            <span className="cinematic-serif block text-[19px] leading-none tracking-[.01em] text-[#f1ead8]">Rüya Rehberi</span>
            <span className="mt-1.5 block text-[9px] font-semibold uppercase tracking-[.22em] text-[#a9ad9d]">Sükûnetle düşünmek için</span>
          </span>
        </a>
        <div className="hidden items-center gap-2.5 rounded-full border border-[#d8be7c]/20 bg-[#10231f]/60 px-4 py-2 text-[10px] tracking-wide text-[#c8c6b3] sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-[#d6b96e]" />
          Özel ve kişisel bir alan
        </div>
      </header>

      <section id="baslangic" className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-5 pb-11 pt-8 md:grid-cols-[1.08fr_.92fr] md:px-10 md:pb-20 md:pt-14">
        <div className="relative">
          <div className="mb-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[.28em] text-[#d8bf7e]">
            <span className="h-px w-9 bg-[#d8bf7e]/80" /> Hayırlı Vakitler
          </div>
          <h1 className="cinematic-serif max-w-[720px] text-[clamp(2.65rem,6vw,5.4rem)] leading-[1.03] tracking-[-.04em] text-[#f4eedf]">
            İslami Rüya Tabiri
            <span className="mt-1 block text-[#dbc47f]">&amp; Manevi Rehber</span>
          </h1>
          <p className="mt-6 max-w-[560px] text-[13px] leading-7 text-[#c0c4b7] md:text-[15px] md:leading-8">
            Bir rüya gördünüz. Biraz üzerinde duralım. İslami geleneğe saygılı, sembollere açık bir yansıma; geleceği haber vermez, düşünmek için sakin bir alan sunar.
          </p>
          <a href="#ruya-formu" className="mt-7 inline-flex items-center gap-2.5 text-[11px] font-semibold tracking-wide text-[#e4d29f] transition-colors hover:text-white">
            Yansımaya başlayın <ArrowDown size={14} />
          </a>
          <div className="mt-9 flex items-center gap-3 text-[10px] leading-5 text-[#9fa99b]">
            <span className="grid h-8 w-8 place-items-center rounded-full border border-[#d9bd78]/30 text-[#d9bd78]"><Wind size={14} /></span>
            <span>Bir düşünme alanı; kesin bilgi veya dinî hüküm değildir.</span>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[450px] md:ml-auto">
          <div className="absolute -inset-5 rounded-[38%] border border-[#d9bd78]/15" />
          <div className="absolute -inset-2 rounded-[34%] border border-[#d9bd78]/10" />
          <div className="scene-frame aspect-[1.08/1] rounded-[32%_32%_25%_25%] border border-[#d9bd78]/30 shadow-[0_30px_100px_rgba(0,0,0,.45)]">
            <DreamAnimationCanvas theme={sceneTheme} className="absolute inset-0" showCaption={false} showBadge={false} />
            <div className="absolute inset-x-0 bottom-0 z-[2] bg-gradient-to-t from-[#071714]/95 via-[#071714]/55 to-transparent px-7 pb-7 pt-24 text-center">
              <span className="mb-2 inline-block text-[9px] font-semibold uppercase tracking-[.24em] text-[#d9bd78]">Sakin bir tefekkür</span>
              <p className="cinematic-serif text-[20px] leading-snug text-[#f4ecd8]">Bir sembol, bir his,<br />bir düşünme fırsatı.</p>
            </div>
          </div>
          <span className="absolute -right-2 top-[13%] h-1.5 w-1.5 rounded-full bg-[#e3c77e] shadow-[0_0_16px_rgba(227,199,126,.7)]" />
          <span className="absolute -left-5 bottom-[23%] h-1 w-1 rounded-full bg-[#e3c77e]/80" />
        </div>
      </section>

      <section id="ruya-formu" className="relative z-10 mx-auto max-w-7xl scroll-mt-6 px-4 pb-16 pt-4 md:px-10 md:pb-24">
        <div className="mx-auto max-w-[1110px]">
          <div className="mb-6 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-2 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.28em] text-[#d1b66f]"><span className="h-px w-5 bg-[#d1b66f]" /> İlk adım</p>
              <h2 className="cinematic-serif text-[27px] leading-tight text-[#f0ead8] sm:text-[32px]">Rüyanızı kendi kelimelerinizle anlatın</h2>
            </div>
            <div className="inline-flex w-fit rounded-full border border-[#d7c389]/25 bg-[#091b17]/70 p-1" role="tablist" aria-label="Yansıtma biçimi">
              <button type="button" role="tab" aria-selected={mode === 'personal'} onClick={() => setMode('personal')} className={`rounded-full px-4 py-2.5 text-[10px] font-semibold transition-colors ${mode === 'personal' ? 'bg-[#183a30] text-[#f0dfae] shadow-[inset_0_0_0_1px_rgba(217,189,120,.28)]' : 'text-[#aeb4a8] hover:text-[#f0ead8]'}`}>Kişisel yansıma</button>
              <button type="button" role="tab" aria-selected={mode === 'tiktok'} onClick={() => setMode('tiktok')} className={`rounded-full px-4 py-2.5 text-[10px] font-semibold transition-colors ${mode === 'tiktok' ? 'bg-[#183a30] text-[#f0dfae] shadow-[inset_0_0_0_1px_rgba(217,189,120,.28)]' : 'text-[#aeb4a8] hover:text-[#f0ead8]'}`}>TikTok Yorum Modu</button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.02fr_.98fr]">
            <form onSubmit={handleSubmit} className="glass-panel rounded-[25px] p-5 sm:p-7">
              <label htmlFor="cinematic-dream" className="mb-2.5 block text-[11px] font-semibold text-[#e3decf]">Rüyanız</label>
              <textarea id="cinematic-dream" rows={5} required value={dream} onChange={(event) => setDream(event.target.value)} placeholder="Hatırladığınız sahneleri, kişileri ve rüyanızda hissettiklerinizi yazın…" className="form-control w-full resize-y rounded-xl p-4 text-[12px] leading-6" />
              <p className="mt-2 flex items-start gap-2 text-[10px] leading-5 text-[#a2aa9d]"><Check size={13} className="mt-0.5 shrink-0 text-[#d5ba75]" />Rüya metniniz veritabanında saklanmaz; yalnızca yorum için işlenir.</p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <fieldset>
                  <legend className="mb-2.5 flex items-center gap-2 text-[11px] font-semibold text-[#e3decf]"><Clock3 size={14} className="text-[#d8bd78]" /> Vakit</legend>
                  <div className="grid grid-cols-1 gap-1.5 min-[420px]:grid-cols-3">
                    <button type="button" aria-pressed={time === 'seher'} onClick={() => setTime('seher')} className={selectClass(time === 'seher')}><span className="flex items-center justify-center gap-1.5"><Sunrise size={14} />Sabaha Karşı (Seher)</span></button>
                    <button type="button" aria-pressed={time === 'gece'} onClick={() => setTime('gece')} className={selectClass(time === 'gece')}>Gece</button>
                    <button type="button" aria-pressed={time === 'gunduz'} onClick={() => setTime('gunduz')} className={selectClass(time === 'gunduz')}><span className="flex items-center justify-center gap-1.5"><Sun size={14} />Gündüz</span></button>
                  </div>
                </fieldset>
                <fieldset>
                  <legend className="mb-2.5 flex items-center gap-2 text-[11px] font-semibold text-[#e3decf]"><Feather size={14} className="text-[#d8bd78]" /> Tür</legend>
                  <div className="grid grid-cols-1 gap-1.5 min-[420px]:grid-cols-3">
                    <button type="button" aria-pressed={dreamType === 'huzurlu'} onClick={() => setDreamType('huzurlu')} className={selectClass(dreamType === 'huzurlu')}>Huzurlu &amp; Net</button>
                    <button type="button" aria-pressed={dreamType === 'kabus'} onClick={() => setDreamType('kabus')} className={selectClass(dreamType === 'kabus')}>Korkutucu / Kabus</button>
                    <button type="button" aria-pressed={dreamType === 'tekrarlayan'} onClick={() => setDreamType('tekrarlayan')} className={selectClass(dreamType === 'tekrarlayan')}>Tekrarlayan</button>
                  </div>
                </fieldset>
              </div>
              {mode === 'tiktok' && (
                <div className="mt-5">
                  <label htmlFor="creator-name" className="mb-2 block text-[11px] font-semibold text-[#e3decf]">TikTok kullanıcı adınız <span className="font-normal text-[#a2aa9d]">(isteğe bağlı)</span></label>
                  <input id="creator-name" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="@kullaniciadi" className="form-control w-full rounded-xl px-4 py-3 text-[12px]" />
                  <p className="mt-2 text-[10px] leading-5 text-[#a2aa9d]">Yorum paylaşımı için adınızı ekleyebilirsiniz.</p>
                </div>
              )}
              <button type="submit" className="gold-button mt-6 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full px-5 text-[11px] font-bold tracking-wide">
                <Sparkles size={15} /> <span>{submitted ? 'Yansımayı Yenile' : 'Rüyamı Tabir Et & Sahnele'}</span> <ArrowRight size={15} />
              </button>
              <p className="mt-3 text-center text-[10px] leading-5 text-[#9da49a]">Bu içerik düşünmeye yardımcı olur; kesin bilgi veya dinî hüküm değildir.</p>
            </form>

            <div className="glass-panel overflow-hidden rounded-[25px]">
              <div className="flex items-start justify-between gap-4 px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
                <div>
                  <p className="mb-2 text-[9px] font-bold uppercase tracking-[.24em] text-[#d4b96f]">Rüya sahnesi</p>
                  <h3 className="cinematic-serif text-[22px] leading-snug text-[#f2ead6]">Ay ışığında su</h3>
                </div>
                {mode === 'tiktok' && username && (
                  <div className="flex items-center gap-2 rounded-full border border-[#d8bd78]/20 bg-[#071a16]/70 py-1 pl-1 pr-3">
                    <div className="h-8 w-8 overflow-hidden rounded-full border border-[#d8bd78]/40">
                      <DreamAnimationCanvas theme={sceneTheme} className="!min-h-0" showCaption={false} showBadge={false} />
                    </div>
                    <span className="max-w-[110px] truncate text-[10px] text-[#e1d7bb]">{username.startsWith('@') ? username : `@${username}`}</span>
                  </div>
                )}
              </div>
              <div className="scene-frame mx-4 aspect-[1.72/1] rounded-2xl border border-[#d9bd78]/25 sm:mx-5">
                <DreamAnimationCanvas theme={sceneTheme} className="absolute inset-0" showCaption={false} showBadge={false} />
                <span className="absolute bottom-3 left-3 z-[3] rounded-full border border-[#e5ca82]/35 bg-[#102b28]/80 px-3 py-1.5 text-[9px] text-[#efdfb1]">Ay ışığında sakin bir su</span>
              </div>
              <div id="yorum" className="scroll-mt-5 px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="cinematic-serif text-[20px] text-[#f0ead8]">{mode === 'tiktok' ? 'Yorum için yansıma' : 'Sembollere birlikte bakalım'}</h3>
                  {submitted && <span className="text-[9px] font-semibold uppercase tracking-[.16em] text-[#d8bd78]">Yansıma hazır</span>}
                </div>
                <p className="mb-4 border-l border-[#d9bd78]/50 pl-3 text-[11px] leading-5 text-[#bdc2b4]">{dream}</p>
                <div className="divide-y divide-[#d5bb79]/15">
                  {interpretations.map((item) => (
                    <article className="interpretation-card py-4 first:pt-0 last:pb-0" key={item.number}>
                      <div className="flex items-start gap-3">
                        <span className="cinematic-serif pt-0.5 text-[12px] text-[#d7bb73]">{item.number}</span>
                        <div>
                          <h4 className="text-[11px] font-bold text-[#e9dfc7]">{item.title}</h4>
                          <p className="mt-2 text-[10px] leading-[1.8] text-[#b8beb1]">{item.text}</p>
                          <p className="mt-2 text-[10px] italic leading-5 text-[#d2c18f]">{item.prompt}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-3 border-t border-[#d5bb79]/15 pt-4 text-[10px] leading-5 text-[#aeb5a8]">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#d8bd78]/35 text-[#d8bd78]"><MoonStar size={14} /></span>
                  Geleneksel kaynaklardan esinlenen, kesinlik iddiası taşımayan bir yansıma.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <footer className="relative z-10 border-t border-[#d9bd78]/10 px-5 py-6 text-center text-[9px] tracking-[.1em] text-[#818d82]">
        RÜYA REHBERİ <span className="mx-2 text-[#cbb36d]">·</span> Sükûnetle düşünmek için
      </footer>
    </main>
  );
}
