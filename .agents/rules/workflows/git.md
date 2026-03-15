---
description: Git
---

---
activation: always
description: Git commit formatı ve branch kuralları
---

# Git Kuralları

## Commit Mesajı Formatı

```
<tip>(<kapsam>): <kısa açıklama>

tip:
  feat     → yeni özellik
  fix      → bug fix
  style    → sadece UI/CSS değişikliği
  refactor → davranış değişmeden kod düzenleme
  chore    → bağımlılık, config, tooling
  test     → test ekleme/düzenleme
  docs     → dokümantasyon

Örnekler:
  feat(auth): kullanıcı giriş ekranı eklendi
  fix(profile): avatar yüklenmiyor hatası giderildi
  style(dashboard): kart spacing 8pt grid'e hizalandı
  refactor(api): fetch logic TanStack Query'e taşındı
```

- Türkçe yaz
- 72 karakteri geçme
- Geçmiş zaman değil — "eklendi", "giderildi", "güncellendi"
- `git add -A && git commit` — büyük görev öncesi checkpoint

## Branch İsimlendirme

```
feat/[özellik-adı]      → feat/kullanici-profili
fix/[hata-adı]          → fix/avatar-yuklenmiyor
style/[kapsam]          → style/dashboard-spacing
refactor/[kapsam]       → refactor/api-client
```

## Kurallar

- `main` branch'e direkt push yasak
- Her özellik kendi branch'inde
- PR açmadan merge etme