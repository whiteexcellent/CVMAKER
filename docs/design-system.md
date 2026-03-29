# CVMAKER Tasarým Sistemi ve Temel Prensipleri (Design System)

## 1. Konsept ve Genel Vibe
- **Tema:** Dark Mode First (Tamamen Karanlýk Mod odaklý).
- **Vibe:** Apple-vari minimalizm ile Modern AI dünyasýnýn harmanlanmasý.
- **Karakteristik Dokunuþ:** Derin siyah arka planlar üzerinde organik, uçuþan aurora (kuzey ýþýklarý) parlalamalarý ve kenarlardan dönen incecik neon çizgiler (conic-gradients).

## 2. Renk Paleti (Color Palette)
Kaba ve göz yoran renkler yerine "Soft / Pastel" tonlar kullanýlýr.

- **Arka Plan:** Tam Siyah (`#000000`, `bg-black`) ve Yarý Saydam Koyu Çinko (`bg-zinc-950/20`).
- **Ana Vurgu (Primary Accent):** Soft Zümrüt Yeþili (Emerald-400, `#34d399`).
- **Ýkincil Vurgu (Secondary Accent):** Soft Turuncu (Orange-400, `#fb923c`).
- **Destekleyici / Geçiþ Rengi:** Açýk Pastel Zümrüt (`#6ee7b7`) ve yer yer nötr yumuþak renkler.
- **Metin (Text):** Baþlýklar için Saf Beyaz (`text-white`), gövde metinleri için puslu Gri/Çinko (`text-zinc-400`).

## 3. Tipografi
- **Ana Font:** `Geist` (Kodlarda `font-geist` olarak sýnýflanmýþtýr).
- **Baþlýklar (Headings):** `tracking-tight` (harfler birbirine yakýn), kalýn (`font-bold`), büyük ve okunaklý.
- **Küçük Etiketler (Badges/Labels):** `tracking-widest` (harfler arasý belirgin boþluk), `text-xs` veya `text-sm`, tamamen büyük harf (uppercase) veya özel vurgulu.

## 4. UI Elementleri ve Bileþen (Component) Mimarisi

### A. Dönen Iþýklý Kenarlýklar (Conic Gradient Borders)
- Sayfadaki "Öne Çýkarýlmak Ýstenen" öðelerde (Header, Sign Up butonu, özellik kartlarý) kullanýlýr.
- **Mantýk:** Dýþarýda `absolute inset-0 bg-[conic-gradient(...)] animate-[spin_4s_linear_infinite]` gibi yavaþça dönen bir arka plan. Ýçinde ise zemin rengini koruyan 1px ince (`inset-[1px]`) koyu bir katman. Sonuç: Etrafýnda incecik dönen bir RGB ýþýk çemberi.

### B. Glassmorphism (Buzlu Cam Efekti)
- Menü çubuðu, bölüm(section) aralýklarý veya kart zeminlerinde `bg-white/5` (çok hafif beyazlýk) ve `backdrop-blur-sm` veya `backdrop-blur-xl` gibi bulanýklaþtýrma efektleri kullanýlýr. Sert sýnýr izleri sevmiyoruz, her þey birbiriyle bütünleþmeli.

### C. Aurora / Arka Plan Parlamalarý (Ambient Glows)
- Ekranýn merkezinde veya köþelerinde, sayfanýn geneline renk katmasý için arkada duran devasa þekiller bulunur: `blur-[120px]` þeffaflýk ise ortalama %10-20 (`/10` vs.) civarlarýnda tutulur, kullanýcýnýn gözünü almaz.

### D. Bento Grid Kartlarý
- Özellik sunumlarýnda "Grid (Izgara)" sistemi kullanýlýr. Kartlar olabildiðince oval (`rounded-3xl`), içi koyu renk (`bg-[#0a0a0a]`) ve sýnýr çizgileri hafif beyaz þeffaf (`border-white/10`).
- Hover (üzerine gelince) durumunda alttan gizli bir parlamanýn yansýmasý tetiklenir (Bkz: BorderGlow component).

## 5. Animasyonlar & Geçiþler (Framer Motion)
- **Sayfa Yükleniþi:** Bölümler aþaðýdan yukarýya yumuþak bir þekilde belirir (`initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}`).
- **Süreklilik:** Logolar, yorumlar, referanslar donuk durmaz. Yatay eksende hiç durmadan akan (Seamless Marquee) sistem (`animate={{ x: ["0%", "calc(-50%..."] }}` ) ile hareket katýlýr.

## 6. Alt Sayfalarý (Dashboard vb.) Tasarlarken Dikkat Edilecekler
1. Uygulama içine girildiðinde yine karanlýk arka plan tercih edilmeli (`bg-black` veya `bg-zinc-950`).
2. Týklanabilir önemli butonlarýn içerisi düz renk, kenarý dönen veya parlayan (gradient) olmalý.
3. Her sayfada devasa parlamaya gerek yok, Dashboard da Glow efektleri sadece "Premium Feature" (Pro plan) kýsýmlarýnda veya onay tuþlarýnda kullanýlmalý, arayüz sade ve okunabilir kalmalý.
4. Çizgiler sert siyah/beyaz olmamalý, `border-white/10` gibi ince opak çizgiler ile alanlar ayrýþtýrýlmalý.
