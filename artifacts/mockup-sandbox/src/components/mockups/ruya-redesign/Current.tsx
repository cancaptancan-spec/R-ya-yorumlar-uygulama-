import './_group.css';
import { ArrowDown, ArrowRight, CircleHelp, Clock3, Feather, MoonStar, Sparkles, Sun, Sunrise } from 'lucide-react';

export function Current() {
  return (
    <main className="ruya-current-preview">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-10">
        <a href="#" className="flex items-center gap-3" aria-label="Rüya Rehberi ana sayfa">
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
            <a href="#ruya-formu" className="mt-7 inline-flex items-center gap-2 text-xs font-semibold text-[#eadba9]">
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
              <button type="button" role="tab" aria-selected="true" className="rounded-full bg-[#173d35] px-4 py-2 text-[11px] font-semibold text-[#f5f0e4] shadow-sm">Kişisel yansıma</button>
              <button type="button" role="tab" aria-selected="false" className="rounded-full px-4 py-2 text-[11px] font-semibold text-[#66756e]">TikTok Yorum Modu</button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.08fr_.92fr]">
            <form className="rounded-[24px] border border-[#ded8c9] bg-[#faf8f1] p-5 shadow-[0_18px_50px_-38px_rgba(18,59,52,.42)] sm:p-7">
              <label htmlFor="current-dream" className="mb-2 block text-[11px] font-semibold text-[#324c44]">Rüyanız</label>
              <textarea id="current-dream" rows={5} placeholder="Hatırladığınız sahneleri, kişileri ve rüyanızda hissettiklerinizi yazın…" className="w-full resize-y rounded-xl border border-[#d8d2c3] bg-[#fffdf7] p-4 text-[13px] leading-6 text-[#203d35] outline-none placeholder:text-[#aaa493]" />
              <p className="mt-2 text-[10px] text-[#89938a]">Rüya metniniz veritabanında saklanmaz; yalnızca yorum için işlenir.</p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <fieldset>
                  <legend className="mb-2.5 flex items-center gap-2 text-[11px] font-semibold text-[#324c44]"><Clock3 size={14} className="text-[#987f3d]" /> Vakit</legend>
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                    <button type="button" className="flex items-center justify-center gap-2 rounded-xl border border-[#7e927f] bg-[#e6ece2] px-2 py-2.5 text-[10px] text-[#194239]"><Sunrise size={15} />Sabaha Karşı (Seher)</button>
                    <button type="button" className="rounded-xl border border-[#e3ded2] bg-[#fcfaf4] px-2 py-2.5 text-[10px] text-[#758078]">Gece</button>
                    <button type="button" className="flex items-center justify-center gap-2 rounded-xl border border-[#e3ded2] bg-[#fcfaf4] px-2 py-2.5 text-[10px] text-[#758078]"><Sun size={15} />Gündüz</button>
                  </div>
                </fieldset>
                <fieldset>
                  <legend className="mb-2.5 flex items-center gap-2 text-[11px] font-semibold text-[#324c44]"><Feather size={14} className="text-[#987f3d]" /> Tür</legend>
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                    <button type="button" className="rounded-xl border border-[#7e927f] bg-[#e6ece2] px-2 py-2.5 text-[10px] text-[#194239]">Huzurlu &amp; Net</button>
                    <button type="button" className="rounded-xl border border-[#e3ded2] bg-[#fcfaf4] px-2 py-2.5 text-[10px] text-[#758078]">Korkutucu / Kabus</button>
                    <button type="button" className="rounded-xl border border-[#e3ded2] bg-[#fcfaf4] px-2 py-2.5 text-[10px] text-[#758078]">Tekrarlayan</button>
                  </div>
                </fieldset>
              </div>
              <button type="button" className="mt-6 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#173d35] px-5 text-[12px] font-semibold text-[#f6f1e3]">
                <Sparkles size={15} className="text-[#e2cc87]" /> Rüyamı Tabir Et &amp; Sahnele <ArrowRight size={15} />
              </button>
              <p className="mt-3 text-center text-[10px] leading-5 text-[#8b9288]">Bu içerik düşünmeye yardımcı olur; kesin bilgi veya dinî hüküm değildir.</p>
            </form>

            <div className="min-h-[350px] rounded-[24px] border border-[#d9d2bf] bg-[#eae6da] p-5 sm:p-7">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#dce4d8] text-[#335d4e]"><Feather size={17} /></span>
              <h3 className="serif mt-5 text-[23px] leading-snug text-[#1c4138]">Bir sembol, bir his,<br />bir düşünme fırsatı.</h3>
              <p className="mt-3 max-w-sm text-[12px] leading-6 text-[#68776d]">Rüyanızın çağrıştırdıklarına birlikte bakalım. Her yorum bir ihtimaldir; kendi hayatınızın bilgisi sizde.</p>
              <div className="mt-8 flex items-center gap-3 border-t border-[#d2cbbb] pt-4 text-[10px] leading-5 text-[#768278]">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#c8bb92] text-[#907b43]"><CircleHelp size={15} /></span>
                <span>Geleneksel kaynaklardan esinlenen, kesinlik iddiası taşımayan bir yansıma.</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
