# Captcha İllüzyonu Demo V2 🛡️

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Vanilla JS](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)

<div align="center">
  <img src="https://upload.wikimedia.org/wikipedia/tr/6/6d/%C4%B0stinye_%C3%9Cniversitesi_logo.png" alt="İstinye Üniversitesi Logosu" width="250" />
</div>

<br>

**Öğrenci:** Yağız
**Üniversite:** İstinye Üniversitesi
**Eğitmen / Danışman:** [Eğitmen Adı Soyadı ve Unvanı] 

UI üzerindeki görsel doğrulama adımlarının (Captcha tikinin) tek başına güvenli olmadığını ve Backend tabanlı Token + Rate Limiting defansının zorunluluğunu kanıtlayan akademik güvenlik simülasyonu.

---

## 📑 İçindekiler
1. [Proje Özeti ve Amacı](#-proje-özeti-ve-amacı)
2. [Özellikler](#-özellikler)
3. [Güvenlik Mimarisi ve Teknik Derinlik](#-güvenlik-mimarisi-ve-teknik-derinlik)
4. [Kurulum ve Çalıştırma](#-kurulum-ve-çalıştırma)
5. [Proje Yapısı (Repo Structure)](#-proje-yapısı-repo-structure)
6. [Lisans](#-lisans)

---

## 🎯 Proje Özeti ve Amacı
Bu proje, web güvenliği dersleri kapsamında "Frontend'e asla güvenme" prensibini göstermek amacıyla geliştirilmiştir. Sistem iki farklı login ucu (endpoint) sunar:
- **Zafiyetli Uç (`/api/vulnerable-login`):** Captcha görsel olarak doğrulanmış gibi görünse de backend'de token kontrolü yapmadığı için basit bir script ile bypass edilebilir.
- **Güvenli Uç (`/api/secure-login`):** Sadece geçerli bir token beklemekle kalmaz, aynı zamanda Brute Force (Kaba Kuvvet) ve Flood (Sel) saldırılarına karşı IP tabanlı Rate Limiting uygular.

---

## ✨ Özellikler
- **Gerçek Zamanlı Simülasyon:** Zafiyetli ve güvenli sunucu davranışlarını anında test edebilme.
- **Bot ve Brute Force Simülatörü:** Otomatize scriptlerin sistemi nasıl exploit etmeye çalıştığını gösteren saldırı butonları.
- **Güvenlik Duvarı Dashboard'u:** Toplam istek, engellenen IP'ler, başarılı/başarısız bypass girişimlerini gösteren canlı admin paneli.
- **Canlı Audit Logları:** Sistem üzerinde gerçekleşen tüm eylemlerin kronolojik kaydı.

---

## 🔐 Güvenlik Mimarisi ve Teknik Derinlik
Proje, temel düzeyde şu güvenlik önlemlerini ve mimari kararları uygulamaktadır:

1. **Token Validasyonu:** Frontend'de üretilen Captcha token'ı backend'e POST edilir. Backend, geçerli formatta bir token almadığı sürece veritabanı (mock) sorgusunu başlatmaz (CWE-287 Bypass engelleme).
2. **Rate Limiting (Hız Sınırlandırması):** `express-rate-limit` modülü kullanılarak `/api/secure-login` rotasına saniyede yapılabilecek istek sayısı kısıtlanmıştır (10 saniyede max 3 istek). Brute-force saldırıları IP ban ile durdurulur (CWE-307 mitigasyonu).
3. **Modüler Mimari:** Temiz kod prensipleri gereği API rotaları, controller mantığı ve statik dosyalar birbirinden ayrıştırılmıştır.

---

## 🚀 Kurulum ve Çalıştırma

Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin:

### Gereksinimler
- Node.js (v16.x veya üzeri)
- Git

### Adımlar
1. Repoyu klonlayın:
   ```bash
   git clone [https://github.com/kullaniciadiniz/captcha-illusion.git](https://github.com/kullaniciadiniz/captcha-illusion.git)
   cd captcha-illusion
