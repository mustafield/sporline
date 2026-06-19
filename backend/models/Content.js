const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({ label: { type: String, trim: true }, href: { type: String, trim: true }, order: { type: Number, default: 0 } }, { _id: false });
const cardSchema = new mongoose.Schema({ title: { type: String, trim: true }, description: { type: String, trim: true }, image: { type: String, trim: true }, icon: { type: String, trim: true }, order: { type: Number, default: 0 } }, { _id: false });
const paketSchema = new mongoose.Schema({ isim: { type: String, trim: true }, fiyat: Number, badge: { type: String, trim: true }, features: [{ type: String, trim: true }], order: { type: Number, default: 0 } }, { _id: false });

const ContentSchema = new mongoose.Schema({
    hero: {
        tagline: { type: String, default: "İLDEM'İN EN ELİT SPOR ALANI", trim: true },
        titleLine1: { type: String, default: "SIRADANLIĞI", trim: true },
        titleLine2: { type: String, default: "REDDET", trim: true },
        description: { type: String, default: "Modern teknolojiye sahip ekipmanlar, Türkiye'nin en iyi eğitmenleri bir arada.", trim: true },
        videoUrl: { type: String, default: "assets/videos/hero-bg.mp4", trim: true },
        videoWebm: { type: String, default: "assets/videos/hero-bg.webm", trim: true },
        ctaPrimary: { type: String, default: "VIP Üyelik Başvurusu", trim: true },
        ctaSecondary: { type: String, default: "Alanları Keşfet", trim: true }
    },
    ozellikler: {
        type: [cardSchema],
        default: [
            { title: "Elite Ekipmanlar", description: "Dünyanın en iyi biyomekanik standartlarına sahip premium ithal ekipmanlar.", order: 1 },
            { title: "Uzman Kadro", description: "Postür analizi, beslenme protokolleri ve gelişim takibinde uzman kadro.", order: 2 },
            { title: "Butik Atmosfer", description: "Kalabalıktan uzak, motivasyon odaklı özel lüks minimalist iç mimari.", order: 3 }
        ]
    },
    hakkimizda: {
        sectionLabel: { type: String, default: "HİKAYEMİZ & VİZYONUMUZ", trim: true },
        title: { type: String, default: "BİZ KİMİZ?", trim: true },
        subtitle: { type: String, default: "STANDARTLARI YENİDEN TANIMLIYORUZ", trim: true },
        text1: { type: String, default: "Kayseri İldem bölgesinde fitness kültürüne yeni bir soluk getirmek amacıyla kurulan Sporline Fitness, üyelerine her detayında lüksü ve konforu hissedecekleri üst düzey bir ekosistem sunar.", trim: true },
        text2: { type: String, default: "Dünyaca ünlü ekipman markaları ve hedefinize odaklanan profesyonel yaklaşımımızla, potansiyelinizi en üst seviyeye çıkarmak için buradayız.", trim: true },
        imageUrl: { type: String, default: "assets/images/sporline.webp", trim: true },
        imageAlt: { type: String, default: "Sporline Fitness Premium Salon İçi", trim: true }
    },
    haberler: {
        sectionLabel: { type: String, default: "HABER KÖŞESİ", trim: true },
        title: { type: String, default: "Son Dakika Gelişmeleri", trim: true },
        intro: { type: String, default: "Sporline'da bugün neler oluyor? Yeni içerik ve duyuruları hemen keşfedin.", trim: true },
        randomFacts: {
            type: [String],
            default: [
                "Sporline'da her antrenman sonrasında özel performans özetleri paylaşılır.",
                "Haftanın 7 günü geç saatlere kadar açık, yoğunluk yönetimi için akıllı programlama sunuyoruz.",
                "Her yeni üyeye özel hedef seti ve beslenme rehberi ücretsiz olarak verilir."
            ]
        },
        items: {
            type: [cardSchema],
            default: [
                { title: "Yeni Grup Antrenmanı", description: "Haftanın her günü sabah ve akşam özel fight club seansları açıldı.", order: 1 },
                { title: "Beslenme Takvimleri", description: "Yaz öncesi özel performans menüleri ile formda kalmanın yeni yolu.", order: 2 },
                { title: "Sporline Topluluğu", description: "Yeni üye kampanyası başladı. Arkadaşını getirene ekstra seans hediyeli.", order: 3 }
            ]
        }
    },
    programlar: {
        sectionLabel: { type: String, default: "ODAK ALANLARIMIZ" },
        title: { type: String, default: "ANTRENMAN PROGRAMLARI" },
        items: {
            type: [cardSchema],
            default: [
                { title: "FITNESS & VÜCUT GELİŞTİRME", description: "Geniş serbest ağırlık alanları, izole kas makineleri ve yüksek motivasyonlu atmosfer.", order: 1 },
                { title: "FIGHT CLUB (DÖVÜŞ SPORLARI)", description: "Kick Boks, Muay Thai, Wushu, Boks ve Taekwondo branşlarında profesyonel eğitim.", order: 2 },
                { title: "KADINLARA ÖZEL FİTNESS", description: "Sadece kadın üyelere özel izole, konforlu ve geniş ekipman kapasitesine sahip alan.", order: 3 },
                { title: "KAPSAMLI KOÇLUK SİSTEMİ", description: "Kişiye özel antrenman programı, beslenme protokolü ve düzenli vücut analizleri.", order: 4 }
            ]
        }
    },
    paketler: {
        sectionLabel: { type: String, default: "YATIRIMINI KENDİNE YAP", trim: true },
        title: { type: String, default: "ÜYELİK PAKETLERİ", trim: true },
        items: {
            type: [paketSchema],
            default: [
                { isim: "1 Ay Üyelik", fiyat: 2500, features: ["Vücut Analizi & Ölçüm Takibi", "Kişiye Özel Antrenman Programı", "Gün ve Saat Sınırlaması Yok"], order: 1 },
                { isim: "3 Ay Üyelik", fiyat: 6000, features: ["Kişiye Özel Beslenme Programı", "Kadınlara Özel Fitness Alanı", "Vücut Analizi & Ölçüm Takibi"], order: 2 },
                { isim: "3+1 Ay Üyelik", fiyat: 7000, badge: "EN ÇOK TERCİH EDİLEN", features: ["+1 Ay Hediye Dönemi", "Milli Sporcu & Antrenör Desteği", "Dövüş Sporları / Fight Club Dahil"], order: 3 },
                { isim: "Uzun Dönem 6 Ay", fiyat: 10000, features: ["Maksimum Fiyat Avantajı", "Kişiye Özel Beslenme & Koçluk", "Tüm Kulüp Branşları Dahil"], order: 4 },
                { isim: "Uzun Dönem 1 Yıl", fiyat: 17000, features: ["Maksimum Fiyat Avantajı", "Kişiye Özel Beslenme & Koçluk", "Tüm Kulüp Branşları Dahil"], order: 5 }
            ]
        }
    },
    iletisim: {
        sectionLabel: { type: String, default: "BİZE ULAŞIN", trim: true },
        title: { type: String, default: "İLETİŞİME GEÇ", trim: true },
        telefon: { type: String, default: "+90 553 810 33 20", trim: true },
        telefonRaw: { 
            type: String, 
            default: "905538103320",
            match: [/^\d+$/, 'Telefon sadece rakamlardan oluşmalıdır'],
            trim: true
        },
        email: { 
            type: String, 
            default: "info@sporlinefitness.com",
            match: [/.+\@.+\..+/, 'Lütfen geçerli bir e-posta adresi giriniz'],
            trim: true
        },
        adres: { type: String, default: "Kaysermall Avm, Gesi Fatih, Gün Sazak Cd. No:65, Melikgazi/Kayseri" },
        saatler: { type: String, default: "Her Gün: 08:30 - 23:00" },
        mapEmbedUrl: { type: String, default: "https://maps.google.com/maps?q=Kaysermall%20Avm%20ana%2C%20Gesi%20Fatih%2C%20G%C3%BCn%20Sazak%20Cd.%20No%3A65%20giri%C5%9F%20kat%2C%2038180%20Melikgazi%2FKayseri&z=17&output=embed" },
        whatsapp: { 
            type: String, 
            default: "905538103320",
            match: [/^\d+$/, 'WhatsApp numarası sadece rakamlardan oluşmalıdır (örn: 905...)'],
            trim: true
        },
        isWhatsAppForm: { type: Boolean, default: true },
        whatsappMessageTemplate: { 
            type: String, 
            default: "Merhaba Sporline Fitness,\n\nWeb sitenizdeki form aracılığıyla size ulaşıyorum:\n\n*İsim:* {name}\n*Telefon:* {phone}\n*İlgilenilen Branş:* {branch}\n*Mesaj:* {message}",
            trim: true
        },
        formBranches: { type: [{ type: String, trim: true }], default: ["Fitness / Vücut Geliştirme", "Fight Club (Boks / Kick Boks)", "Kadınlara Özel Fitness"] }
    },
    footer: {
        tagline: { type: String, default: "Kayseri'nin en elit, en teknolojik ve en motivasyon odaklı butik spor ekosistemi. Sıradanlığı arkanda bırak, bizimle zirveye oyna." },
        copyright: { type: String, default: "© 2026 SPORLINE FITNESS. Tüm Hakları Saklıdır." },
        poweredBy: { type: String, default: "NEXORA DIGITAL" },
        quickLinks: {
            type: [linkSchema],
            default: [
                { label: "Anasayfa", href: "#hero", order: 1 },
                { label: "Hakkımızda", href: "#hakkimizda", order: 2 },
                { label: "Programlar", href: "#programlar", order: 3 },
                { label: "Paketler", href: "#paketler", order: 4 },
                { label: "İletişim", href: "#iletisim", order: 5 }
            ]
        },
        legalLinks: {
            type: [linkSchema],
            default: [
                { label: "KVKK Aydınlatma Metni", href: "kvkk.html", order: 1 },
                { label: "Gizlilik Politikası", href: "gizlilik.html", order: 2 },
                { label: "Kullanım Koşulları", href: "kullanim-kosullari.html", order: 3 }
            ]
        }
    },
    menu: {
        type: [linkSchema],
        default: [
            { label: "Anasayfa", href: "#hero", order: 1 },
            { label: "Hakkımızda", href: "#hakkimizda", order: 2 },
            { label: "Programlar", href: "#programlar", order: 3 },
            { label: "Paketler", href: "#paketler", order: 4 },
            { label: "İletişime Geç", href: "#iletisim", order: 5 }
        ]
    },
    sosyalMedya: {
        type: [{ platform: String, url: String, isActive: { type: Boolean, default: true } }],
        default: [
            { platform: "instagram", url: "https://www.instagram.com/ildem_sporlinefitness_/", isActive: true },
            { platform: "whatsapp", url: "https://wa.me/905538103320", isActive: true }
        ]
    },
    referanslar: {
        sectionLabel: { type: String, default: "BAŞARI HİKAYELERİ" },
        title: { type: String, default: "REFERANSLARIMIZ" },
        items: { type: [cardSchema], default: [] }
    },
    hizmetler: {
        sectionLabel: { type: String, default: "HİZMETLERİMİZ" },
        title: { type: String, default: "PREMIUM HİZMETLER" },
        items: { type: [cardSchema], default: [] }
    },
    slider: {
        items: { type: [{ image: { type: String, trim: true }, title: { type: String, trim: true }, subtitle: { type: String, trim: true }, link: { type: String, trim: true }, order: Number }], default: [] }
    },
    seo: {
        title: { type: String, default: "Sporline Fitness | Kayseri'nin En Premium Fitness ve Yaşam Merkezi", trim: true },
        description: { type: String, default: "Sporline Fitness ile hedeflerine ulaş! Modern ekipmanlar, uzman eğitmen kadrosu ve kişiye özel antrenman programlarıyla Kayseri'nin en elit spor deneyimi.", trim: true },
        keywords: { type: String, default: "fitness, spor salonu, kayseri spor salonu, ildem spor salonu, bodybuilding, pilates, crossfit, kişisel antrenör, premium gym, sporline fitness", trim: true },
        canonical: { type: String, default: "https://www.sporlinefitness.com.tr", trim: true },
        ogImage: { type: String, default: "https://www.sporlinefitness.com.tr/assets/images/og-share.jpg", trim: true },
        ogType: { type: String, default: "website", trim: true },
        twitterCard: { type: String, default: "summary_large_image", trim: true },
        robots: { type: String, default: "index, follow", trim: true },
        schemaType: { type: String, default: "ExerciseGym", trim: true }
    },
    siteSettings: {
        siteName: { type: String, default: "SPORLINE FITNESS", trim: true },
        logoText: { type: String, default: "SPORLINE", trim: true },
        logoAccent: { type: String, default: "FITNESS", trim: true },
        maintenanceMode: { type: Boolean, default: false },
        analyticsId: { type: String, default: "", trim: true }
    },
    custom: {
        type: Map,
        of: String,
        default: {}
    }
}, { timestamps: true });

module.exports = mongoose.model('Content', ContentSchema);
