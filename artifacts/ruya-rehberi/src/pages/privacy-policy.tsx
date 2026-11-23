import { useEffect } from 'react';
import { ArrowLeft, MoonStar } from 'lucide-react';
import { Link } from 'wouter';
import './privacy-policy.css';

export default function PrivacyPolicy() {
  useEffect(() => {
    const previousTitle = document.title;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = description?.content;
    document.title = 'Gizlilik Politikası | Manevi Rüya Rehberi';
    if (description) {
      description.content = 'Manevi Rüya Rehberi’nde rüya metinlerinin, yapay zekâ hizmetlerinin ve kişisel verilerin nasıl işlendiğini öğrenin.';
    }
    return () => {
      document.title = previousTitle;
      if (description && previousDescription) description.content = previousDescription;
    };
  }, []);

  return (
    <main className="ruya-app privacy-page relative min-h-[100dvh] overflow-hidden">
      <div className="ambient-motes" aria-hidden="true" />
      <header className="privacy-header relative z-10 mx-auto flex max-w-5xl items-center justify-between px-5 py-5 md:px-10">
        <Link href="/" className="brand-lockup flex items-center gap-3" aria-label="Rüya Rehberi ana sayfaya dön">
          <span className="brand-mark grid h-11 w-11 place-items-center rounded-full">
            <MoonStar size={20} strokeWidth={1.5} />
          </span>
          <span>
            <span className="brand-title serif block text-[19px] leading-none tracking-tight">Rüya Rehberi</span>
            <span className="brand-kicker mt-1 block text-[9px] font-semibold uppercase tracking-[.24em]">Sükûnetle düşünmek için</span>
          </span>
        </Link>
        <Link href="/" className="privacy-back inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold">
          <ArrowLeft size={14} aria-hidden="true" />
          Ana sayfa
        </Link>
      </header>

      <article className="privacy-content relative z-10 mx-auto max-w-4xl px-4 pb-16 pt-8 md:px-10 md:pt-12">
        <div className="privacy-panel rounded-3xl p-6 sm:p-9 md:p-12">
          <p className="privacy-eyebrow text-[10px] font-bold uppercase tracking-[.22em]">Verileriniz ve mahremiyetiniz</p>
          <h1 className="privacy-title serif mt-3 text-3xl leading-tight sm:text-4xl">Gizlilik Politikası</h1>
          <p className="privacy-updated mt-3 text-xs">Son güncelleme: 23 Kasım 2026</p>

          <p className="privacy-intro mt-7 text-sm leading-7">
            Manevi Rüya Rehberi, rüya metinlerini yalnızca talep ettiğiniz manevi yansıma ve rüya sahnesini hazırlamak için işler. Uygulama kişisel verilerinizi satmaz veya kiralamaz.
          </p>

          <section className="privacy-section">
            <h2>Hangi bilgiler işlenir?</h2>
            <p>Gönderdiğiniz rüya metni, seçtiğiniz vakit ve rüya türü; ayrıca TikTok Yorum Modu’nda isteğe bağlı olarak girdiğiniz kullanıcı adı işlenir. Hesap açmanız gerekmez. Rüya metnine kimliğinizi belirleyebilecek hassas bilgiler eklememenizi öneririz.</p>
          </section>

          <section className="privacy-section">
            <h2>Bilgileriniz ne için kullanılır?</h2>
            <p>Bu bilgiler, isteğinize yanıt olarak Türkçe bir manevi yansıma ve rüyanızdaki sembollere dayalı görsel sahne üretmek amacıyla Replit’in yapay zekâ entegrasyonu üzerinden ilgili AI hizmetlerine iletilir. Rüya metni reklam, pazarlama veya profil oluşturma amacıyla kullanılmaz.</p>
          </section>

          <section className="privacy-section">
            <h2>Metinler saklanıyor mu?</h2>
            <p>Uygulamanın kendi veritabanında rüya metni veya kullanıcı adı saklanmaz. İçerik, yanıtı hazırlamak için sunucu ve AI hizmet sağlayıcıları tarafından istek sırasında işlenir. Bu sağlayıcıların teknik kayıtları, saklama süreleri ve veri uygulamaları kendi politikalarına tabidir; uygulama bu saklama süreçlerini yönetmez. Sonuç ve yazdığınız metin sayfa açıkken tarayıcı belleğinde bulunabilir.</p>
          </section>

          <section className="privacy-section">
            <h2>Paylaşım ve indirilen içerikler</h2>
            <p>Manevi kart ve kısa video tarayıcınızda oluşturulur. İndirme veya cihazınızın paylaşım menüsünü kullanma kararını siz verirsiniz; bu işlemler uygulamaya otomatik olarak geri yüklenmez. İndirilen dosyalar cihazınızın kendi depolama alanında tutulur.</p>
          </section>

          <section className="privacy-section">
            <h2>Üçüncü taraf hizmetleri</h2>
            <p>Rüya yansımaları ve görsel sahne için Replit’in AI entegrasyonu ve ilgili AI modelleri kullanılır. Görünüm için Google Fonts, sahnedeki Ney kaydı için Freesound içerik sunucusu yüklenebilir. Bu hizmetlere bağlantı kurulduğunda IP adresi ve tarayıcı/cihaz gibi temel bağlantı bilgileri ilgili hizmet tarafından alınabilir; kendi gizlilik koşulları geçerlidir.</p>
          </section>

          <section className="privacy-section">
            <h2>Gizlilik soruları ve talepler</h2>
            <p>
              Gizlilikle ilgili sorularınız veya talepleriniz için{' '}
              <a className="privacy-contact-link" href="mailto:cancaptancan@gmail.com">cancaptancan@gmail.com</a>
              {' '}adresine e-posta gönderebilirsiniz.
            </p>
          </section>

          <p className="privacy-note mt-8 rounded-2xl px-4 py-4 text-xs leading-6">
            Bu hizmet rüya yorumlarını kesin bilgi veya dinî hüküm olarak sunmaz. Gizlilik politikası, hizmetin işleyişi değişirse güncellenebilir.
          </p>

          <Link href="/" className="privacy-home-link mt-7 inline-flex items-center gap-2 text-sm font-semibold">
            <ArrowLeft size={15} aria-hidden="true" />
            Rüya Rehberi’ne dön
          </Link>
        </div>
      </article>

      <footer className="site-footer relative z-10 border-t px-5 py-6 text-center">
        <p className="footer-text text-[10px] leading-5">Manevi Rüya Rehberi · Gizlilik Politikası</p>
      </footer>
    </main>
  );
}
