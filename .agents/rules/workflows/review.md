---
description: Review
---

# Kod İnceleme Workflow'u
# Tetikle: /review

## Adımlar

1. **Değişiklikleri gör**
   - `git diff main` analiz et

2. **Güvenlik**
   - Hardcoded secret var mı?
   - `VITE_` prefix ile gizli bilgi var mı?
   - Zod doğrulama eksik mi?
   - XSS/injection riski var mı?

3. **Kod kalitesi**
   - `any` kullanımı var mı?
   - `console.log` kaldı mı?
   - 200 satır üstü component var mı? → bölünmeli
   - Magic number var mı? → named constant olmalı
   - Feature klasörü dışına taşan dosya var mı?

4. **Tasarım**
   - 8pt grid ihlali var mı?
   - 44px altı touch target var mı?
   - Dark mode token eksik mi?
   - Skeleton/loading state var mı?
   - Error boundary eksik mi?

5. **Test**
   - Yeni logic için test yazılmış mı?
   - Yoksa: "Test ekleyeyim mi?" diye sor

6. **Özet**
   Şu formatta çıktı ver:
   ```
   ✅ İyi görünenler: [liste]
   ⚠️  Düzeltilmeli: [liste]
   🚨 Kritik: [varsa]
   ```