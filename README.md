# Etsy SEO İçerik Üretici

Bu proje, Etsy ilanları için hızlı SEO çıktısı üreten istemci taraflı (browser tabanlı) bir araçtır.

## Özellikler

- Bir veya birden fazla PDF dosyası yükleyip içeriğini SEO eğitim metni olarak kullanma.
- Ürün görseli önizleme.
- Anahtar kelime, rakip başlığı ve zorunlu ifade girişleri.
- Kurallara uygun otomatik çıktı üretimi:
  - Başlık: maksimum 140 karakter.
  - Etiketler: her biri maksimum 20 karakter.
  - Materials: 13 adet, her biri maksimum 45 karakter.
- Açıklamada stil notu ve PDF içinden bulunan ilgili SEO ipuçlarını birleştirme.

## Çalıştırma

Bu proje statik dosyalardan oluşur.

1. Depoyu klonlayın.
2. Klasörde basit bir web sunucusu açın (ör. `python3 -m http.server 8080`).
3. Tarayıcıda `http://localhost:8080` adresine gidin.

## Notlar

- PDF okuma işlemi istemci tarafında `pdf.js` ile yapılır.
- API anahtarı gerektirmez; içerik üretimi kural tabanlıdır.
