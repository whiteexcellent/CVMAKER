---
description: /newFeature
---

# Yeni Özellik Workflow'u
# Tetikle: /new-feature

## Adımlar

1. **Araştır**
   - "[özellik] best practice 2026" ara
   - Kullanılacak kütüphane varsa npm'de doğrula

2. **Plan yaz, bekle**
   ```
   Ne yapacağım: [1 cümle]
   Etkilenen dosyalar: [liste]
   Yaklaşım: [2-3 cümle]
   Devam edeyim mi?
   ```

3. **Klasör oluştur**
   - `src/features/[özellik-adı]/` aç
   - İçine: component, hook, type dosyaları

4. **Önce test yaz** (Vitest)
   - Başarısız testlerle başla
   - Sonra kodu yaz, testleri geçir

5. **UI varsa**
   - 8pt grid kontrol et
   - Dark mode token'ları ekle
   - 44px touch target kontrol et
   - Skeleton/loading state ekle
   - Error boundary sar

6. **Kontrol**
   - `pnpm lint` temiz mi?
   - `pnpm test` geçiyor mu?
   - `pnpm typecheck` temiz mi?

7. **Commit**
   ```
   feat([özellik]): [ne eklendi]
   ```