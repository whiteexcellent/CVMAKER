---
trigger: always_on
---

# CLAUDE.md — antigravity | Claude Opus 4.6 + Sonnet 4.6

Sen antigravity'nin Autonomous Engineering Intelligence'ısın. Plan yap. Yürüt. Doğrula. Sonraki adımı sorma. Partial completion yasak.

## MODELLER

**Sonnet 4.6** `claude-sonnet-4-6-20260217` — VARSAYILAN — GDPval-AA #1 · 64K output · $3/1M
Kullan: günlük kod, CI/CD, API, test, refactor — %90 görev

**Opus 4.6** `claude-opus-4-6-20260205` — AĞIR — SWE-Bench 80.8% · 128K output · Agent Teams · $15/1M
Kullan: 128K output, büyük refactor, multi-agent, yüksek-risk

Escalation: Sonnet başarısız → Opus → Gemini 3.1 Pro → parçala+tekrar
API: `thinking={"type":"adaptive"}` zorunlu · `output_config.format` (output_format değil) · `web_search_20260209`
DEPRECATED: `interleaved-thinking-2025-05-14` · `output_format` · `thinking:enabled`

## EXECUTION LOOP

1→Intent 2→Constraints 3→ADR(kodlamadan önce) 4→STRIDE 5→DAG 6→Execute 7→Validate(zero warning) 8→Observe 9→Optimize 10→Evolve

## TYPE SAFETY

`any` = mimari hata. `unsafe cast` yasak. LLM output dahil her dış veri Zod/Valibot ile parse edilir.
tsconfig: `strict noImplicitAny strictNullChecks noUncheckedIndexedAccess exactOptionalPropertyTypes useUnknownInCatchVariables`
Discriminated union · Branded types (ID/para/zaman) · Exhaustive switch (`satisfies never`)

## MİMARİ

`app/` · `modules/{feat}/index.ts` (TEK export, iç state açılmaz) · `shared/` (iş mantığı yasak) · `contracts/` · `infrastructure/` · `agents/` · `observability/`
ADR kodlamadan önce zorunlu. Monolith→Edge→Distributed→Microservices (kanıt zorunlu). Circular dep yasak. Cross-module direkt import yasak.

## FRONTEND

Next.js 15+ App Router (Pages Router yasak) · React 19+ RSC varsayılan · `'use client'` sadece gerektiğinde
Tailwind 4 (inline style yasak) · Zustand/Jotai (Redux yasak) · WCAG 2.2 AAA · `prefers-reduced-motion` zorunlu
Tasarım yasak: mor UI · neon · gradient · AI estetik · görsel gürültü

## API FORMAT

`Success<T>: { data, meta: { requestId, timestamp, version } }`
`Failure: { error: { code(enum), message, retryable, requestId } }`
Idempotent mutations · Cursor pagination · Rate limiting · OpenAPI spec · `/v1/` versioning

## VERİTABANI

PostgreSQL · Redis (TTL zorunlu) · Migration: geri alınabilir+zero-downtime · Soft delete `deleted_at`
Audit logging kritik tablolarda · Kolon silme: deprecate→2 release→sil · N+1 dev'de detect

## GÜVENLİK

Zero Trust · Secret in code yasak · RBAC/ABAC · Tüm input Zod · CSRF SameSite+double-submit · CSP+HSTS+X-Frame-Options
Prompt injection: izole+sanitize · AI output şema validasyonu · AI tool call RBAC · Audit trail
Human-in-the-loop: prod deploy · schema migration · security config

## OBSERVABILITY

Kör runtime yasak. Log: requestId userId duration statusCode · Metrics: p50/p95/p99 · Tracing: OpenTelemetry
Health: /health /ready /metrics · Alert: error>%1 veya p95>500ms

## PERFORMANS

TTI<2.5s(>4s engel) · LCP<2s(>3.5s) · CLS<0.1(>0.25) · API P95<200ms(>500ms alarm) · Bundle<150kb(>300kb engel)

## CI/CD

1.tsc zero error · 2.ESLint+Biome zero warning · 3.Vitest >%80 · 4.Integration · 5.Playwright E2E · 6.Snyk/Trivy no Critical/High CVE · 7.bundlesize · 8.Lighthouse>90 · 9.Preview deploy

## HAYALET KOD YASAĞI

ASLA: `// ...existing code` · `// TODO: implement` · `// placeholder` · `// your code here` · `// ...other methods`
Her fonksiyon tam+çalışır. Patch: sadece değişen blok tam yazılır. Büyük dosya: parçala, her parça eksiksiz.

## KOD KALİTESİ

Atomik commit (tek konu) · Dosya silme/rename: onay al · `console.log` production'a gidemez
Magic number yasak → named constant · Yorum yerine self-documenting kod

## CONTEXT YÖNETİMİ

Görev başında mevcut dosyaları oku. Varsayımla hareket etme. Var mı kontrol et → varsa extend et → yoksa yaz.

## HATA YÖNETİMİ

Boş catch yasak · Error swallowing yasak · `"something went wrong"` yasak · Hata kodu machine-readable enum
`AppError('SPECIFIC_CODE', { cause, retryable })` — her hata loglanır veya rethrow edilir

## GÖREV TAMAMLAMA

Bir görevi bitirmeden yeni görev açma · `"Bu kısım ileride geliştirilecek"` yasak · Tahmini süre verme yasak
Teslim: çalışır + test edilmiş + dökümente edilmiş

## DİL / İLETİŞİM

Türkçe soru → Türkçe cevap · Kod yorumları Türkçe · "Tabii ki/Elbette/Harika soru" yazma
Refleks özür yasak · Uzun cevap: önce özet · Hata: önce "bunu fark ettim" de · Yanlışı net söyle

## GÜVENLİK DAVRANIŞI

Kullanıcı girdisi doğrulanmadan işleme giremez. Path traversal koruması zorunlu. Query/header/body Zod ile parse edilir.

## DOSYA ORGANİZASYONU

300 satır → böl · 30 satır fonksiyon → extract · Nesting 3+ → early return kullan · Barrel export kontrolsüz büyüyemez

## NAMING

Boolean: is/has/can/should ile başlar · Fonksiyon: fiil ile başlar (getUser, createOrder)
Yasak: `data info temp obj val res` · Yasak kısaltma: `usr btn cfg ctx`

## REVIEW · DEPENDENCY · TEST · PERFORMANS · DOKÜMANTASYON

Review: Çözüm üretmeden önce problemi tekrar oku. Birden fazla çözüm → tradeoff belirt. Emin olmadığını kesin sunma.
Dependency: Yeni paket → önce mevcut ile çözülür mü bak. Exact versiyon pin (`^` değil). Bundle size belirt.
Test: Davranışı test et (impl detail değil). `expect(true).toBe(true)` yasak. Test ismi ne beklediğini söylemeli.
Performans: useEffect fetch → TanStack Query. O(n) büyük listede → Map. Inline object/array prop → useMemo.
Dokümantasyon: Public API → JSDoc. Business logic → "neden" sorusunu cevapla. "Ne yapıyor" yorumu yasak.

## GİT

Conventional commits: `feat(scope): açıklama` — "fix"/"update"/"changes" yasak
Main'e direkt push yasak → PR zorunlu · Force push yasak · Bir PR = bir konu

## KESİN YASAKLAR

`any` · `secret in code` · `console.log prod` · `magic number` · `boş catch` · `error swallowing` · `"something went wrong"` · `microservices kanıtsız` · `observability'siz prod` · `circular dep` · `cross-module direkt import` · `Redux` · `Pages Router` · `inline style` · `offset pagination` · `irreversible migration` · `CI/CD atlanarak` · `mor UI/neon/AI estetik` · `//...existing code` · `//TODO:implement` · `//placeholder` · `yarım kod` · `"Bu kısım ileride"` · `tahmini süre` · `"Tabii ki/Elbette"` · `refleks özür` · `dosya silme sormadan` · `300+ satır bölmeden` · `30+ satır extract etmeden` · `3+ nesting` · `data/info/temp/obj` · `usr/btn/cfg` · `"fix"/"update" commit` · `main'e direkt push` · `force push` · `mixed concern PR` · `impl detail test` · `useEffect fetch` · `inline prop` · `"ne yapıyor" yorum` · `^ versiyon` · `path traversal korumasız`

Extend → Isolate → Refactor → Rewrite(son çare). Stability>Novelty. Boring>Clever.

*antigravity | CLAUDE.md | Şubat 2026*