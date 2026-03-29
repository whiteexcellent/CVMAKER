# OmniCV Dashboard Redesign — Master Planning Document

## 1. Belgenin Amacı
Bu belge, **OmniCV Dashboard** ekranını mevcut landing/auth/design system diliyle tamamen uyumlu hale getirmek için hazırlanmış **tek parça, uygulanabilir, ayrıntılı ürün + UI + layout + component + motion + implementation planıdır**.

Bu belge iki amaçla kullanılabilir:
1. Doğrudan geliştirici referansı olarak.
2. **Gemini 3.1 Pro’ya tek seferde verilecek ana görev dökümanı** olarak.

Bu dokümanın hedefi sadece "güzel görünen dashboard" üretmek değildir. Hedef:
- mevcut ürün kimliğini korumak,
- landing sayfasındaki premium aurora hissini dashboard’a taşımak,
- ama bunu **admin template** görünümüne düşmeden,
- **workspace / creator dashboard** hissiyle çözmektir.

---

## 2. Mevcut Durum Özeti
Şu an dashboard tarafında doğru yönde olan parçalar var:
- dark theme doğru,
- sidebar mantığı doğru,
- quick action mantığı doğru,
- kartlı bilgi mimarisi doğru.

Ama genel problem şu:
- dashboard diğer bitmiş sayfalar kadar premium hissettirmiyor,
- fazla "template dashboard" görünümü veriyor,
- kartlar arasındaki ayrım zayıf,
- bilgi hiyerarşisi yeterince güçlü değil,
- landing’deki aurora / glow / cinematic hissi dashboard’a kontrollü şekilde taşınmamış,
- ana odak alanı kullanıcıyı yönlendirmiyor.

Bu yüzden dashboard’ın yeni hedefi şu olacak:

> **Cinematic + minimal + actionable AI workspace**

Bu ekran klasik admin panel değil.
Bu ekran, kullanıcının CV, cover letter ve presentation üretmeye başladığı ana çalışma alanı.

---

## 3. Korunacak Tasarım DNA’sı
Bu plan, senin mevcut tasarım sistemindeki şu prensipleri korur:
- **dark mode first**
- **Apple-vari minimalizm + modern AI hissi**
- arkada kontrollü **aurora glow**
- yer yer **conic gradient border**
- **soft emerald** ana vurgu
- **soft orange** ikincil vurgu
- **Geist** tipografi
- **border-white/10** gibi ince, sert olmayan ayraçlar
- glassmorphism sadece gerektiği yerde
- dashboard içinde glow kullanımı kontrollü ve ölçülü

Bu kararlar, yüklediğin design system dokümanındaki dark-first yaklaşım, soft emerald/orange renkleri, Geist tipografisi, conic border, glassmorphism, ambient glow ve dashboard’da glow’u kontrollü kullanma prensibiyle uyumlu olacak şekilde alınmıştır. fileciteturn2file0

---

## 4. Ürün Perspektifi: Dashboard’ın Rolü
Dashboard’ın işi veri yığmak değil, kullanıcıyı ilk 30 saniyede şu akışa sokmak:

1. Profil / CV import et
2. Yeni belge üret
3. Belgeyi geliştir
4. Export / present / apply et
5. Geri dönüp ilerlemeyi takip et

Bu nedenle dashboard’ta ilk bakışta şu sorular cevaplanmalı:
- Ben burada ne yapabilirim?
- İlk tıklamam gereken şey ne?
- Son bıraktığım yer neresi?
- Premium plan bana ne açıyor?
- Hangi belgeyle devam etmeliyim?

---

## 5. Ana Konsept İsmi
Bu ekranın iç tasarım adı:

**Omni AI Workspace**

Kullanıcı hissi:
- tool-driven
- calm
- premium
- futuristic but readable
- cinematic but not noisy

---

## 6. Genel Layout Kararı

### 6.1 Uygulama İskeleti
- Sol tarafta sabit sidebar
- Sağ tarafta ana içerik yüzeyi
- Ana içerik alanı tam ekran genişliğini kullanabilir ama içerik maksimum okunabilirlik için sınırlandırılmalı
- Dashboard, landing’den daha kontrollü, daha sessiz, daha fonksiyonel olmalı

### 6.2 Desktop Layout
- **Page padding X:** 24px
- **Page padding top:** 24px
- **Section spacing:** 24px
- **Ana içerik max width:** 1440px civarı hissedebilir, ama tam sert sınır şart değil
- **Grid sistemi:** 12 kolon
- **Grid gap:** 24px

### 6.3 Sidebar
- Genişlik: **272px**
- İç padding: 20px
- Sağ sınır: `1px solid rgba(255,255,255,0.08)`
- Arka plan: siyaha çok yakın koyu yüzey
- Sidebar main panelden hafif ayrışmalı ama ayrı uygulama gibi görünmemeli

### 6.4 Main Content Width Behavior
- İçerik alanı rahat nefes alan genişlikte kalmalı
- Çok dar merkezlenmiş içerik yapılmamalı
- Çok boş dev alanlar bırakılmamalı

---

## 7. Dashboard Bilgi Mimarisi
Yeni dashboard şu sırayla kurulmalı:

### Row 1 — Workspace Header Strip
Solda:
- Breadcrumb-like küçük label: `Omni AI Workspace`
- Ana başlık: `Welcome back, Kerim` veya `Welcome back`
- Alt açıklama: `Build tailored resumes, cover letters, and pitch decks from one place.`

Sağda:
- Credits pill
- Plan pill
- Upgrade CTA

### Row 2 — Quick Actions
4 ana kart:
1. New Resume
2. Cover Letter
3. Presentation
4. Import Profile

### Row 3 — Main Dashboard Split
- Sol 8 kolon: **Recent Documents**
- Sağ 4 kolon: **Profile Strength** + **AI Suggestions**

### Row 4 — Secondary Split
- Sol 8 kolon: **Continue Editing / Recent Activity**
- Sağ 4 kolon: **Plan & Usage / Premium Unlocks**

### Row 5 — Optional Future Layer
- Analytics
- Applications
- Opportunities

Not: Opportunities alanı şu an gerçek veri olmadan zorlama duruyorsa ilk sürümde çıkarılmalı.

---

## 8. Çok Kritik Tasarım Kararı
Şu anki büyük "Welcome back" kartı kaldırılmalı veya ciddi biçimde küçültülmeli.

**Doğru çözüm:** büyük hero card yerine **header strip**.

Neden?
- Landing’de büyük tipografi zaten sayfa kimliğini veriyor.
- Dashboard’ta kullanıcı aksiyon almak istiyor.
- Büyük welcome card çok yer kaplayıp quick action kartlarıyla yarışıyor.
- Premium his, daha sessiz ama daha kontrollü bir üst bar ile daha iyi sağlanır.

---

## 9. Görsel Stil Kuralları

### 9.1 Arka Plan
Ana zemin tamamen düz siyah olabilir ama tek renk boşluk gibi görünmemesi için kontrollü ambient ışıklar kullanılmalı:
- Sol alt veya sol orta: yumuşak emerald glow
- Sağ alt veya sağ orta: hafif orange glow
- Üst kısımda çok hafif radial fade

**Önemli:**
- Landing sayfasındaki kadar güçlü aurora dashboard’ta kullanılmamalı
- Dashboard’ta glow, sahnenin tamamını değil ritmini desteklemeli
- Glow blur değerleri yüksek, opacity düşük olmalı

### 9.2 Glow Kullanım Kuralları
Glow yalnızca:
- header arkasında çok hafif
- upgrade kartında daha belirgin
- hover state’lerinde çok az
- premium locked alanlarda hafif

Glow kullanılmamalı:
- her kartın etrafında
- sidebar’ın her item’ında
- metin arkasında sürekli yoğun şekilde

### 9.3 Border Kullanımı
Genel border sistemi:
- `rgba(255,255,255,0.08)` ana border
- `rgba(255,255,255,0.12)` hover border
- `rgba(52,211,153,0.25)` accent glow-border only on focus/active

### 9.4 Radius Sistemi
Tek radius sistemi kullanılmalı:
- küçük UI: 12px
- standart kartlar: 20px
- büyük feature / section kartları: 24px
- çok büyük hero-style yüzey: 28px

### 9.5 Surface Sistemi
Yüzey seviyeleri:
- `surface-0`: page background
- `surface-1`: sidebar / header strip / low cards
- `surface-2`: standard cards
- `surface-3`: elevated / premium / modal

Öneri tonlar:
- `surface-0`: `#050505`
- `surface-1`: `#0A0A0A`
- `surface-2`: `#101010`
- `surface-3`: `#141414`

---

## 10. Renk Sistemi

### 10.1 Core Colors
- **Background Base:** `#050505`
- **Background Deep:** `#000000`
- **Panel Surface:** `#0A0A0A`
- **Raised Surface:** `#111111`
- **Elevated Surface:** `#151515`

### 10.2 Brand Accent
- **Primary Emerald:** `#34D399`
- **Primary Emerald Soft:** `#6EE7B7`
- **Primary Emerald Deep Glow:** `rgba(52, 211, 153, 0.22)`

### 10.3 Secondary Accent
- **Soft Orange:** `#FB923C`
- **Soft Orange Light:** `#FDBA74`
- **Soft Orange Glow:** `rgba(251, 146, 60, 0.18)`

### 10.4 Text
- **Heading:** `#FFFFFF`
- **Body Strong:** `rgba(255,255,255,0.88)`
- **Body Muted:** `rgba(255,255,255,0.62)`
- **Label Muted:** `rgba(255,255,255,0.48)`
- **Disabled:** `rgba(255,255,255,0.32)`

### 10.5 Borders
- **Default Border:** `rgba(255,255,255,0.08)`
- **Strong Border:** `rgba(255,255,255,0.12)`
- **Focus Border:** `rgba(255,255,255,0.16)`
- **Emerald Accent Border:** `rgba(52,211,153,0.28)`

### 10.6 Status
- **Success:** `#34D399`
- **Warning/Premium:** `#FB923C`
- **Info:** `#60A5FA`
- **Danger:** `#F87171`

### 10.7 Renk Rolleri
- Yeşil = success / AI / active / productive
- Turuncu = premium / upgrade / locked / monetization hint
- Mavi = info / tutorial / onboarding
- Kırmızı = delete / destructive

**Kesin kural:** aynı anda çok fazla accent rengi açılmayacak.

---

## 11. Tipografi Sistemi
Design system ile uyumlu biçimde **Geist** kullanılmalı. Başlıklar güçlü, label’lar ayık, body ise sakin olmalı. fileciteturn2file0

### 11.1 Font Family
- `Geist, ui-sans-serif, system-ui, sans-serif`

### 11.2 Typography Tokens
- **Display Title:** 40 / 44 / 700 / tracking-tight
- **Page Title:** 32 / 38 / 700 / tracking-tight
- **Section Title:** 24 / 30 / 650
- **Card Title:** 20 / 26 / 650
- **Body:** 15 / 24 / 400
- **Small Body:** 14 / 22 / 400
- **Label:** 12 / 16 / 500 / tracking-[0.18em] / uppercase
- **Metric:** 30 / 34 / 700

### 11.3 Dashboard Hiyerarşisi
- Page title büyük ve baskın ama tek başına sahne çalmayan seviyede
- Section title net
- Kart title kısa
- Body text daima muted
- Label’lar küçük ama düzenli spacing ile kullanılmalı

---

## 12. Spacing Sistemi
8px tabanlı sistem:
- 4
- 8
- 12
- 16
- 20
- 24
- 32
- 40
- 48
- 64

### 12.1 Component Padding
- Small pill/button: 10px 14px
- Standard card: 20px
- Large section card: 24px
- Sidebar item: 12px 14px
- Header strip: 24px

### 12.2 Vertical Rhythm
- Başlık ile alt metin arası: 8px
- Card title ile body arası: 8px
- Section header ile içerik arası: 16px
- Büyük section’lar arası: 24px

---

## 13. Gölge ve Blur Sistemi
Dark UI’de gerçek shadow yerine glow + subtle inner contrast daha etkili.

### 13.1 Card Shadow
- Default: çok hafif
- Hover: biraz artan yumuşak gölge
- Premium: hafif renkli aura

Öneri:
- `0 10px 30px rgba(0,0,0,0.22)`
- hover: `0 16px 40px rgba(0,0,0,0.28)`

### 13.2 Glow
- Emerald glow: `0 0 0 1px rgba(52,211,153,0.12), 0 0 40px rgba(52,211,153,0.10)`
- Orange glow: `0 0 0 1px rgba(251,146,60,0.12), 0 0 40px rgba(251,146,60,0.09)`

### 13.3 Blur Backgrounds
- Aurora blobs: `blur(100px)` to `blur(140px)`
- Glass surfaces: `backdrop-blur-md` or `backdrop-blur-xl` only where truly needed

---

## 14. Motion Sistemi
Landing’deki motion ruhu korunmalı ama dashboard içinde daha kontrollü kullanılmalı. Bu, uploaded design system’daki yumuşak reveal ve akış mantığıyla da uyumludur. fileciteturn2file0

### 14.1 Motion Character
- hızlı değil
- zarif
- mikro
- kullanıcıyı yormayan

### 14.2 Motion Rules
- Hover lift: `translateY(-2px)`
- Hover scale: max `1.01`
- Section reveal: `opacity 0 -> 1`, `y 8 -> 0`
- Duration: `0.22s - 0.38s`
- Easing: `easeOut`

### 14.3 Nerede Motion Var
- quick action card hover
- sidebar active indicator
- page reveal
- button focus glow
- locked premium card shimmer/glow

### 14.4 Nerede Motion Yok
- metinlerin her harfinde
- tablo satırlarında gereksiz zıplama
- background’da agresif hareket

---

## 15. Dashboard Yerleşimi — Tam Plan

## 15.1 Sol Sidebar

### Yapı
1. Logo / product mark
2. Main navigation
3. Spacer
4. Account block
5. Upgrade CTA
6. User row

### Sidebar Menu Items
- Dashboard
- Resumes
- Cover Letters
- Presentations
- Library
- Settings

### Sidebar Tasarım Kuralları
- aktif item dolu koyu yüzey + hafif inner glow + sol ya da iç accent çizgi
- hover item sadece hafif aydınlanmalı
- ikonlar `lucide-react`
- ikon boyutu 18–20
- item yüksekliği 44–48

### Sidebar Alt Bölüm
- `Billing & Plan`
- `Settings`
- Upgrade card/button
- user avatar + sign out

### Sidebar Upgrade CTA
- tam turuncu dolu değil
- koyu yüzey üstünde turuncu border/glow veya subtle fill
- “Upgrade to Pro” daha premium görünmeli
- mümkünse küçük lock veya spark icon

---

## 15.2 Main Header Strip

### Sol Taraf
- Label: `Omni AI Workspace`
- Page title: `Welcome back`
- Subtitle: `Ready to build your next career asset?`

### Sağ Taraf
- Credits pill
- Plan pill
- Upgrade button

### Tasarım
- Tek büyük kart değil
- yatay geniş yüzey
- yükseklik yaklaşık 104–128px
- radius 24
- border-white/10
- çok hafif emerald glow in background

### Credits Pill
İçerik:
- küçük lightning icon
- sayı
- `Available Credits`

### Plan Pill
İçerik:
- Starter / Pro
- küçük secondary info

### Upgrade Button
- primary değil premium secondary görünüm
- orange border + subtle orange glow

---

## 15.3 Quick Action Row
Bu bölüm dashboard’ın en kritik aksiyon yüzeyi.

### Kartlar
1. New Resume
2. Cover Letter
3. Presentation
4. Import Profile

### Grid
- Desktop: 4 kolon eşit
- Gap: 20
- Kart yüksekliği: 152–172

### Kart Anatomisi
- üstte icon capsule
- ortada title
- altta one-line description
- alt köşede mikro hint veya arrow

### Kart Stili
- rounded 24
- surface-2
- border-white/10
- hover’da border-white/14 + hafif yükselme
- aktif hover’da arkada çok hafif soft glow

### Kart İçerikleri

#### New Resume
- icon: file-plus
- title: `New Resume`
- desc: `Create an AI-tailored resume from scratch.`
- accent: emerald

#### Cover Letter
- icon: folder-pen or file-text
- title: `Cover Letter`
- desc: `Generate a job-specific letter in minutes.`
- accent: orange-neutral mix but mostly neutral

#### Presentation
- icon: presentation or monitor-up
- title: `Presentation`
- desc: `Build a concise pitch deck for interviews.`
- accent: emerald

#### Import Profile
- icon: import / upload
- title: `Import Profile`
- desc: `Bring in LinkedIn or PDF content fast.`
- accent: orange

### Hover Davranışı
- icon capsule biraz parlar
- kart 2px yükselir
- küçük arrow opacity kazanır

---

## 15.4 Main Content Area — Row 3

### Sol 8 kolon — Recent Documents
Bu dashboard’ın ana içeriği olmalı.

#### Section Header
- title: `Recent Documents`
- right action: `View all`

#### Kart Boyutu
- minimum height: 320–380
- radius 24
- padding 24

#### Boş State
Boş state düz "No documents yet" olmamalı.

##### Empty State İçeriği
- icon or illustration-lite
- heading: `Start your first document`
- copy: `Create a resume, import an existing CV, or generate a job-specific cover letter.`
- 3 inline actions:
  - Create Resume
  - Import CV
  - Generate Letter

#### Dolu State
Table yerine ilk sürümde modern list row tavsiye edilir.

##### Document Row Yapısı
- solda type icon
- name
- meta row: `Edited 2h ago · Resume · ATS Ready`
- sağda status badge
- kebab menu

##### Örnek Status Badge’ler
- Draft
- Ready
- Needs Review
- Premium Template

##### Row Height
- 72–84px

##### Row Hover
- hafif yüzey değişimi
- border iç glow
- open chevron görünür olur

---

## 15.5 Sağ 4 kolon — Profile Strength
Bu alan kullanıcıya yön verir.

### Kart İçeriği
- title: `Profile Strength`
- score: örn `78%`
- progress bar
- checklist summary

### Alt maddeler
- Contact info complete
- Experience impact missing
- Skills section can improve
- Export-ready after 2 fixes

### CTA
`Improve profile`

### Stil
- normal card ama hafif emerald signal taşımalı
- progress bar çok parlak değil

---

## 15.6 Sağ 4 kolon — AI Suggestions
Bu alan dashboard’ın en akıllı hissedilen kısmı olmalı.

### Kart İçeriği
- title: `AI Suggestions`
- 3–4 suggestion item

### Suggestion Item Format
- küçük spark icon
- title
- kısa açıklama
- `Apply` veya `Open` link-style action

### Örnek Suggestion’lar
- Add measurable impact to your latest role
- Tailor your resume for software internships
- Turn your current resume into a cover letter
- Improve clarity in your summary section

### Stil
- çok kalabalık değil
- item aralarında ince ayraç
- kart sade ama akıllı görünmeli

---

## 15.7 Secondary Row — Continue Editing / Activity
Bu alan canlılık katmalı.

### Sol 8 kolon seçenek
İlk sürüm için en mantıklı başlık:
`Continue Editing`

#### İçerik
- 2 veya 3 belge kartı
- en son açılan resume/letter/presentation
- progress veya stage info
- quick continue button

Alternatif başlık:
`Recent Activity`

Ama ben `Continue Editing`i daha güçlü buluyorum; çünkü daha action-first.

### Continue Editing Card İçeriği
- belge adı
- son düzenleme zamanı
- yüzde tamamlanma ya da stage
- `Continue` butonu

---

## 15.8 Sağ 4 kolon — Plan & Usage
Bu alan fırsat kartı gibi çalışmalı.

### Kart İçeriği
- title: `Plan & Usage`
- current plan: Starter
- credits remaining
- pro unlock list

### Unlock List
- Deep search
- Mock interviews
- Premium templates
- Advanced optimization

### CTA
`Upgrade to Pro`

### Stil
- orange accent daha görünür olabilir
- ama tam reklam kutusu gibi kaba olmamalı

---

## 16. Component Sistemi
Aşağıdaki component seti oluşturulmalı.

### 16.1 Layout Components
- `DashboardShell`
- `DashboardSidebar`
- `DashboardHeaderStrip`
- `DashboardSection`
- `DashboardGrid`

### 16.2 UI Components
- `NavItem`
- `StatPill`
- `QuickActionCard`
- `SectionCard`
- `DocumentRow`
- `StatusBadge`
- `SuggestionItem`
- `ProgressCard`
- `UpgradeCard`
- `EmptyState`

### 16.3 Helpers
- `AuroraBackdrop`
- `GradientRing`
- `SurfaceGlow`
- `PageReveal`

---

## 17. Component Davranış Detayları

## 17.1 QuickActionCard
Props:
- icon
- title
- description
- accent
- href / onClick
- locked?

States:
- default
- hover
- focus-visible
- active
- disabled
- locked

Locked state:
- icon yanında küçük lock
- subtle orange wash
- click ettiğinde upsell modal açabilir

---

## 17.2 SectionCard
Props:
- title
- description?
- action?
- children
- elevated?
- accentGlow?

States:
- default
- hover optional
- loading
- empty

---

## 17.3 DocumentRow
Props:
- type
- title
- updatedAt
- status
- tags?
- href

States:
- default
- hover
- selected
- loading skeleton

---

## 17.4 StatusBadge
Types:
- draft
- ready
- review
- locked
- premium

Colors:
- draft = neutral
- ready = emerald
- review = amber/orange
- locked = muted orange
- premium = orange with glow-lite

---

## 18. Component Görsel Kuralları

### 18.1 Icon Capsules
- 44x44 veya 48x48
- radius 14
- arka plan düz siyah değil; hafif tinted surface
- border çok hafif

### 18.2 Buttons
Button tipleri:
- Primary
- Secondary
- Ghost
- Premium
- Inline action

#### Primary
- emerald fill
- koyu text veya çok koyu green-black text
- sadece ana eylemlerde

#### Secondary
- dark surface + border
- hover’da border güçlenir

#### Ghost
- minimal
- metin bazlı

#### Premium
- orange-tinted border / glow
- dolu turuncu değil

### 18.3 Inputs
Dashboard’ta az input olabilir ama genel sistem:
- height 44–48
- dark surface
- border-white/10
- focus emerald ring çok ince

---

## 19. Responsive Davranış

## 19.1 Breakpoints
- `xl`: 1280+
- `lg`: 1024+
- `md`: 768+
- `sm`: <768

## 19.2 Desktop
- sidebar sabit
- 12 kolon layout tam aktif

## 19.3 Tablet
- sidebar daralabilir veya icon-collapse olabilir
- quick action row 2x2 olabilir
- main split 1 kolon + 1 kolon sıralı olabilir

## 19.4 Mobile
- sidebar drawer olur
- header strip dikey stack olur
- quick actions 1 kolon veya 2 kolon
- right rail content aşağı iner

### Mobile Order
1. header strip
2. quick actions
3. recent documents
4. profile strength
5. ai suggestions
6. continue editing
7. plan & usage

---

## 20. Accessibility Kuralları
- tüm butonlar ve clickable kartlar `focus-visible` state almalı
- contrast muted text için bile okunabilir kalmalı
- sadece renkle durum anlatılmamalı; badge text kullanılmalı
- sidebar aktif item hem renk hem background hem indicator ile belli olmalı
- keyboard navigation desteklenmeli

---

## 21. Kullanılacak React / UI Stack
Bu ekran için önerilen stack:
- **React**
- **Tailwind CSS**
- **shadcn/ui**
- **lucide-react**
- **Framer Motion / Motion**
- gerekirse **Radix primitives**

### shadcn’den kullanılabilecek parçalar
- Button
- Card
- Badge
- Dropdown Menu
- Sheet
- Progress
- Tooltip
- Separator
- Command

### Kullanılmaması gereken hata
- 3 farklı UI kit karıştırma
- ağır enterprise tablo komponentiyle ilk sürümü şişirme
- gereksiz chart’ları ilk ekrana doldurma

---

## 22. Tailwind Token Önerisi

```ts
// örnek semantic token mantığı
colors: {
  background: "#050505",
  surface: {
    1: "#0A0A0A",
    2: "#101010",
    3: "#151515",
  },
  brand: {
    emerald: "#34D399",
    emeraldSoft: "#6EE7B7",
    orange: "#FB923C",
    orangeSoft: "#FDBA74",
  },
  text: {
    strong: "rgba(255,255,255,0.88)",
    body: "rgba(255,255,255,0.72)",
    muted: "rgba(255,255,255,0.62)",
    faint: "rgba(255,255,255,0.48)",
  },
  border: {
    soft: "rgba(255,255,255,0.08)",
    strong: "rgba(255,255,255,0.12)",
  }
}
```

---

## 23. Dashboard İçin Copy Sistemi

### Header
- `Omni AI Workspace`
- `Welcome back`
- `Ready to build your next career asset?`

### Quick Actions
- `New Resume` — `Create an AI-tailored resume from scratch.`
- `Cover Letter` — `Generate a job-specific letter in minutes.`
- `Presentation` — `Build a concise pitch deck for interviews.`
- `Import Profile` — `Bring in LinkedIn or PDF content fast.`

### Sections
- `Recent Documents`
- `Profile Strength`
- `AI Suggestions`
- `Continue Editing`
- `Plan & Usage`

### Empty State
- `Start your first document`
- `Create a resume, import an existing CV, or generate a job-specific cover letter.`

---

## 24. Loading State Planı
Dashboard yüklenirken her şey bir anda pat diye görünmemeli.

### Loading Skeleton
- header strip skeleton
- 4 quick action skeleton
- recent docs skeleton rows
- right rail card skeletons

### Reveal Sırası
1. page backdrop
2. sidebar
3. header strip
4. quick actions
5. content cards

---

## 25. Empty State, Locked State, Partial State

### Empty State
Yeni kullanıcı için güçlü onboarding hissi vermeli.

### Locked State
Pro feature’lar için:
- subtle blur
- lock icon
- orange tint
- kısa explanation
- CTA

### Partial State
Örneğin kullanıcıda 1 resume varsa:
- recent docs dolu
- continue editing aktif
- suggestions bağlamsal çalışır

---

## 26. Dashboard’da Kaçınılacak Hatalar
- çok fazla neon
- her kartta glow
- çok fazla veri sıkıştırma
- kartları aynı tipte tasarlama
- tablo ağırlıklı enterprise görünüm
- landing ile tamamen kopuk sade gri panel görünümü
- turuncu ve yeşili rastgele karıştırma
- büyük boş alan bırakıp sonra placeholder doldurma
- dashboard’ı marketing page gibi davranmaya zorlama

---

## 27. Kabul Kriterleri
Bu redesign tamamlanmış sayılması için aşağıdakiler doğru olmalı:

1. Dashboard ilk bakışta landing ile aynı ürün ailesinden görünmeli.
2. İlk bakışta kullanıcı ne yapacağını anlamalı.
3. Quick actions daha güçlü görünmeli.
4. Büyük welcome card hissi ortadan kalkmalı.
5. Recent Documents ana odak haline gelmeli.
6. Sağ kolon sadece dekoratif değil, gerçekten yönlendirici olmalı.
7. Glow kullanımı kontrollü olmalı.
8. Renk rolleri tutarlı olmalı.
9. Typography hiyerarşisi net olmalı.
10. Sayfa hem boş hem dolu veri durumunda iyi görünmeli.

---

## 28. Geliştirici İçin Uygulama Sırası

### Phase 1 — Structure
- yeni page layout kur
- header strip ekle
- quick actions row kur
- main grid kur
- sidebar refine et

### Phase 2 — Components
- section card
- quick action card
- document row
- suggestion item
- progress card
- plan usage card

### Phase 3 — Styling
- tokenları uygula
- radius, border, spacing standardize et
- aurora backdrop ekle
- hover/focus states ekle

### Phase 4 — States
- loading
- empty
- partial
- locked

### Phase 5 — Polish
- motion
- glow tuning
- icon sizing
- text hierarchy
- responsive cleanup

---

## 29. Gemini 3.1 Pro İçin Master Prompt
Aşağıdaki prompt doğrudan verilebilir.

```md
You are redesigning the Dashboard page of an AI-powered resume product called OmniCV.

Your job is to implement a premium dark-mode dashboard that matches the already-finished landing/auth pages of the product.

This is NOT a generic admin panel.
This must feel like a cinematic, minimal, actionable AI workspace.

## Core visual direction
- dark-mode first
- Apple-like minimalism mixed with modern AI product aesthetics
- soft emerald primary accent
- soft orange secondary/premium accent
- very subtle aurora background glow
- restrained glassmorphism only where needed
- soft borders, no harsh white lines
- premium, calm, elegant, readable

## Important rule
Do NOT design this as a crowded analytics dashboard.
Do NOT turn it into a generic SaaS admin template.
The page should guide the user into creating resumes, cover letters, and presentations.

## Layout requirements
### Sidebar
Left fixed sidebar with:
- Dashboard
- Resumes
- Cover Letters
- Presentations
- Library
- Settings
Bottom area:
- Billing & Plan
- Settings
- Upgrade to Pro CTA
- User profile row

### Main content
Use a 12-column desktop grid.

#### Row 1: Header strip
Left:
- small label: Omni AI Workspace
- title: Welcome back
- subtitle: Ready to build your next career asset?
Right:
- credits pill
- plan pill
- upgrade button

This should NOT be a giant hero card.
It should be a refined, wide workspace header strip.

#### Row 2: Quick actions
4 equal action cards:
- New Resume
- Cover Letter
- Presentation
- Import Profile

Each card should have:
- icon capsule
- title
- short description
- subtle hover lift
- premium dark surface

#### Row 3:
Left 8 columns:
- Recent Documents
- with empty state and filled list-row state

Right 4 columns:
- Profile Strength card
- AI Suggestions card

#### Row 4:
Left 8 columns:
- Continue Editing section

Right 4 columns:
- Plan & Usage / Premium Unlocks

## Styling tokens
Background base: #050505
Panel surface: #0A0A0A
Raised surface: #101010
Elevated surface: #151515
Primary emerald: #34D399
Primary emerald soft: #6EE7B7
Secondary orange: #FB923C
Secondary orange soft: #FDBA74
Heading text: #FFFFFF
Muted text: rgba(255,255,255,0.62)
Default border: rgba(255,255,255,0.08)
Strong border: rgba(255,255,255,0.12)

## Typography
Use Geist.
- page title: bold, large, tight tracking
- section titles: clear and strong
- labels: uppercase, wide tracking, small size
- body text: muted and readable

## Spacing and radii
- use 8px spacing system
- standard card padding: 20px
- large section padding: 24px
- card radius: 20px to 24px

## Motion
- subtle only
- hover lift by 2px
- fade/slide-in on page load
- very soft glow on premium/active elements

## Component expectations
Create or refine components such as:
- DashboardShell
- DashboardSidebar
- DashboardHeaderStrip
- QuickActionCard
- SectionCard
- DocumentRow
- StatusBadge
- ProgressCard
- SuggestionItem
- UpgradeCard
- EmptyState

## Empty state requirements
The Recent Documents area must not look dead.
Use:
- heading: Start your first document
- helper text about creating a resume or importing a CV
- 2 to 3 quick inline actions

## What to avoid
- too much neon
- too many glows
- generic analytics dashboard feel
- flat admin template look
- harsh borders
- every card looking identical

## Deliverable
Produce a complete production-ready React dashboard implementation plan and UI structure that can be directly built.
If writing code, keep it modular and component-driven.
```

---

## 30. Son Net Yön
Bu dashboard’ın başarılı versiyonu şu cümleyle özetlenmeli:

> Landing page’in premium aurora ruhunu koruyan ama içeride çok daha kontrollü, iş odaklı ve ürün merkezli çalışan bir AI workspace dashboard.

Bu plan doğrultusunda ilerlersen sonuç:
- daha premium,
- daha tutarlı,
- daha yönlendirici,
- daha ürünleşmiş,
- daha az template gibi görünen bir dashboard olur.
