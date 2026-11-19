# Sales CRM Frontend

Küçük satış ekipleri için geliştirilmiş CRM uygulamasının React arayüzü. Müşteri adaylarını, müşteri şirketlerini, satış fırsatlarını ve teklifleri tek yerden takip etmeyi sağlar.

> Backend, Morphosium'daki yaz stajım sırasında 3 kişilik ekiple geliştirildi (deals ve offers modülleri bana aittir). Bu frontend'in tamamını tek başıma yazdım.

## Özellikler

- JWT ile giriş / kayıt (çok kiracılı yapı: her şirketin verisi izole)
- **Müşteri adayları:** listeleme, arama, ekleme, silme, satış fırsatına dönüştürme
- **Müşteri şirketleri:** listeleme, arama, ekleme, silme
- **Satış fırsatları:** aşama aşama ilerletme, detay sayfası, bağlı teklifler
- **Teklifler:** oluşturma, kabul/red (kabul edilince fırsat otomatik "kazanıldı" olur)
- Dashboard: özet istatistik kartları

## Teknolojiler

React, Vite, Material UI (MUI), React Router, Axios

## Kurulum

Önce backend'in çalışıyor olması gerekir (Node.js, Express, PostgreSQL), varsayılan adres `http://localhost:3000`.

```bash
git clone https://github.com/Begum219/sales-crm-frontend.git
cd sales-crm-frontend
npm install
npm run dev
```

Uygulama `http://localhost:5173` adresinde açılır.

## Ekran Görüntüleri

(Buraya 3-4 görsel eklenecek ilerledikçe)

## Yapılacaklar

- Kayıt düzenleme formları
- İlgili kişiler ve iletişim kayıtları
- Sayfalama ve filtreler
