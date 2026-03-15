---
description: Fix Bug
---

# Hata Ayıklama Workflow'u
# Tetikle: /fix-bug

## Adımlar

1. **Hatayı tam anla**
   - Ne zaman oluyor? Her zaman mı, bazen mi?
   - Hangi dosya/component'ta?
   - Hata mesajı varsa: "[hata] [kütüphane] [versiyon]" ara

2. **Tahmin etme, izle**
   - `console.error` veya browser DevTools'u kontrol et
   - Network tab'da API hatası var mı?
   - TypeScript hatası mı, runtime hatası mı?

3. **Köke in**
   - Semptomu değil sebebi düzelt
   - En küçük değişiklikle çözmeye çalış
   - "Şimdilik çalışıyor" patch yasak

4. **Düzelt**
   - Sadece ilgili dosyaya dokun
   - Düzeltirken başka şey değiştirme

5. **Doğrula**
   - Hata gerçekten gitti mi?
   - Başka bir şeyi bozdu mu? (`pnpm test`)
   - Edge case'ler? (boş veri, null, ağ hatası)

6. **Commit**
   ```
   fix([kapsam]): [ne giderildi]
   ```