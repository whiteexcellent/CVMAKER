---
description: Design Apple
---

---
activation: model_decision
description: UI, animasyon, erişilebilirlik ve UX kuralları — tasarım kararlarında aktif
---

# Tasarım Kuralları · Apple HIG · 2026

## Apple HIG Temelleri

**Spacing:** 8pt grid — `4 8 12 16 20 24 32 40 48 64 80px`
**Font:** `-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif`
**Touch:** min `44×44px` — istisnasız
**Kontrast:** min 4.5:1 (WCAG AA)
**Dark mode:** her component'te light + dark token birlikte

**Gölge:**
```
--shadow-sm: 0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.06)
--shadow-md: 0 4px 6px rgba(0,0,0,.07), 0 2px 4px rgba(0,0,0,.06)
--shadow-lg: 0 10px 15px rgba(0,0,0,.1), 0 4px 6px rgba(0,0,0,.05)
--shadow-xl: 0 20px 25px rgba(0,0,0,.1), 0 10px 10px rgba(0,0,0,.04)
```

**Liquid Glass:**
```css
background: rgba(255,255,255,0.12);
backdrop-filter: blur(20px) saturate(180%);
border: 1px solid rgba(255,255,255,0.18);
```
Sadece nav, modal, sidebar overlay — içerik alanlarına uygulama.

**YASAK:** Neon · glow · aşırı gradyan · Inter/Roboto primary · AI görünümlü layout

---

## Animasyon

**Easing:**
```
spring   → cubic-bezier(0.34, 1.56, 0.64, 1)   /* hover, modal, pop */
smooth   → cubic-bezier(0.4, 0, 0.2, 1)          /* geçiş, slide */
ease-out → cubic-bezier(0, 0, 0.2, 1)             /* içeri girme */
ease-in  → cubic-bezier(0.4, 0, 1, 1)             /* dışarı çıkma */
```

**Süre:** `100ms` hover · `150ms` toggle · `250ms` dropdown/modal · `400ms` sayfa

**Micro-interactions:**
- Buton hover: `scale(1.02)` + shadow artışı → spring 150ms
- Buton press: `scale(0.97)` → ease-in 100ms
- Card hover: `translateY(-2px)` + `--shadow-lg` → smooth 200ms
- Modal: `scale(0.95→1)` + opacity → spring 250ms
- Liste giriş: `translateY(8px→0)` + opacity, stagger 50ms

**Framer Motion:**
```tsx
// Sayfa geçişi
initial={{ opacity: 0, y: 8 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}

// Spring popup
transition={{ type: "spring", stiffness: 300, damping: 25 }}
```

**prefers-reduced-motion:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**YASAK:** Linear easing · 500ms+ geçiş · sadece dekoratif animasyon

---

## UX — Yükleme ve Hata

**Yükleme:** Spinner yasak → Skeleton kullan (`shadcn/ui <Skeleton />`)

**Optimistic Update:**
```tsx
onMutate: async (newData) => {
  await queryClient.cancelQueries({ queryKey: ['items'] })
  const previous = queryClient.getQueryData(['items'])
  queryClient.setQueryData(['items'], (old) => [...old, newData])
  return { previous }
},
onError: (err, newData, context) => {
  queryClient.setQueryData(['items'], context.previous)
}
```

**Error Boundary:** Her sayfa ve kritik modülü sar, beyaz ekran yasak:
```tsx
<ErrorBoundary fallback={<ErrorCard />}>
  <CriticalComponent />
</ErrorBoundary>
```

---

## Form Hata UX

- Hata: input altında, `text-xs text-rose-500/90`, fade-in
```tsx
{errors.email && (
  <motion.p
    initial={{ opacity: 0, y: -4 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-xs text-rose-500/90 mt-1"
  >
    {errors.email.message}
  </motion.p>
)}
```

---

## Erişilebilirlik

- Semantic HTML — `div` onClick değil `button`, `nav`, `main`
- `img` → `alt` zorunlu · form input → `label` zorunlu
- Focus: `focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2`
- Icon buton → `aria-label` zorunlu
- Modal → focus trap + `Escape` ile kapanma

---

## Performans

- Büyük sayfalar: `const X = lazy(() => import('@/features/x/Page'))`
- Görsel: WebP/AVIF, boyut belirt
- Fetch: `useEffect` değil TanStack Query
- `useMemo`: re-render riski olan nesne/dizi prop'ları için
- Yeni paket: bundlephobia.com → boyut kontrol et