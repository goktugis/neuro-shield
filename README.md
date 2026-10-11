<div align="center">

# 🛡️ NeuroShield
### Kurumsal Düzeyde Zero-Trust LLM Güvenlik Duvarı, Tehdit Simülatörü ve AI Guardrail Mimarisi

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript 5.x](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Passing_21%2F21-729B1B?logo=vitest&logoColor=white)](https://vitest.dev/)
[![OWASP LLM01](https://img.shields.io/badge/OWASP-LLM_Top_10_Compliant-FF5722)](#-owasp-llm-top-10-uyumluluğu)
[![KVKK / GDPR](https://img.shields.io/badge/KVKK%20%2F%20GDPR-Algorithmic_Redaction-10B981)](#3-katman-kvkk--gdpr-hassas-veri-pii-redaksiyonu)
[![Security: Zero-Leakage](https://img.shields.io/badge/Security-Zero--Leakage_Client--Side-cyan.svg)](#-güvenlik-ve-gizlilik-mimarisi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

<br />

<img src="preview.jpg" alt="NeuroShield Dashboard Preview" width="100%" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" />

<br />

**NeuroShield**, üretken yapay zeka (LLM) ve otonom ajan sistemlerini **Prompt Injection**, **Jailbreak (DAN)**, **Sistem İstemi Hırsızlığı**, **KVKK/GDPR Veri İfşası** ve **Görünmez Unicode Saldırıları**na karşı korumak için tasarlanmış yüksek performanslı, çok katmanlı bir **Zero-Trust AI Guardrail ve Güvenlik Duvarı** mimarisidir.

Harici ücretli API'lara veya bulut bağımlılıklarına ihtiyaç duymadan, mikrosaniye seviyesinde deterministik matematiksel ve heuristik algoritmalarla doğrudan istemci tarafında veya API ağ geçidi (Gateway) katmanında çalışır.

</div>

---

## 📑 İçindekiler

- [Öne Çıkan Özellikler](#-öne-çıkan-özellikler)
- [5 Aşamalı Çok Katmanlı Savunma Hattı](#-5-aşamalı-çok-katmanlı-savunma-hattı)
- [Matematiksel ve Algoritmik Doğrulama Motorları](#-matematiksel-ve-algoritmik-doğrulama-motorları)
  - [1. T.C. Kimlik No Doğrulama Algoritması (NVI Mod 10)](#1-tc-kimlik-no-doğrulama-algoritması-nvi-mod-10)
  - [2. Luhn Algoritması (ISO/IEC 7812 Mod 10)](#2-luhn-algoritması-isoiec-7812-mod-10)
  - [3. Shannon Bilgi Entropisi Analizi](#3-shannon-bilgi-entropisi-analizi)
- [OWASP LLM Top 10 Uyumluluğu](#-owasp-llm-top-10-uyumluluğu)
- [Ekran Görüntüleri ve Modüller](#-ekran-görüntüleri-ve-modüller)
- [Geliştirici Entegrasyon SDK & Middleware](#-geliştirici-entegrasyon-sdk--middleware)
- [Kurulum ve Çalıştırma](#-kurulum-ve-çalıştırma)
- [Test ve Doğrulama](#-test-ve-doğrulama)
- [Docker ile Dağıtım](#-docker-ile-dağıtım)
- [Güvenlik ve Gizlilik Mimarisi](#-güvenlik-ve-gizlilik-mimarisi)
- [Lisans ve Yazar](#-lisans-ve-yazar)

---

## ⚡ Öne Çıkan Özellikler

- **🛡️ 5 Aşamalı Derin Savunma (Defense-in-Depth):** Heuristik, Prompt Injection, KVKK Maskeleme, Semantik Tehdit ve Çıktı Filtreleme katmanları.
- **⚡ Ultra Düşük Gecikme (< 2.5 ms):** Deterministik TypeScript algoritmaları sayesinde yapay zeka yanıt süresine neredeyse sıfır ek yük getirir.
- **🔒 KVKK & GDPR Uyumlu Deterministik Maskeleme:** Rastgele sayıları değil; resmi algoritmaları sağlayan gerçek TCKN, Luhn uyumlu Kredi Kartı (TROY, VISA, MasterCard, AMEX), TR IBAN, telefon ve gizli anahtarları hedefler.
- **🗄️ Geri Dönüştürülebilir Şifreli Kasa (Vault Mode):** Maskelenen hassas veriyi istem oturumunda şifreli olarak saklar; modelden gizler ancak iş akışı sonunda geri çözümler.
- **🎯 OWASP Top 10 for LLM Kapsaması:** Prompt Injection (LLM01), Hassas Veri İfşası (LLM02), Sistem İstemi Sızıntısı (LLM07) ve DoS ataklarına tam koruma.
- **📊 Canlı Tehdit Telemetrisi ve Radar Grafiği:** Etkileşimli SVG radar grafiği, saldırı dağılımı çubukları ve indirilebilir (JSON) gerçek zamanlı güvenlik denetim günlüğü (Audit Log).
- **🎛️ Politika ve Kural Stüdyosu (Policy Studio):** Sıkı (Strict), Dengeli (Balanced) ve Esnek (Permissive) profiller, özel anahtar kelime kara listesi ve JSON import/export.
- **🧪 Algoritmik Doğrulama Laboratuvarı:** TCKN, Luhn ve Shannon Entropi formüllerinin canlı matematiksel adımlarını gösteren etkileşimli geliştirici alanı.
- **🚀 Üretime Hazır SDK ve Middleware:** Node.js Express, Python FastAPI ve Next.js Edge Runtime için kopyala-yapıştır hazır kod şablonları.

---

## 🛡️ 5 Aşamalı Çok Katmanlı Savunma Hattı

Her girdi istemi, modelin işlem hattına ulaşmadan önce 5 bağımsız güvenlik katmanından geçer:

```
[ Ham Kullanıcı İstemi ]
          │
          ▼
┌────────────────────────────────────────────────────────┐
│ 1. Katman: Heuristik & Shannon Entropi Analizi         │ ──► Şifreli / Base64 / Hex Payload &
│    - Shannon Entropi (Bits per char)                   │     Görünmez Unicode Karakter Taraması
│    - Zero-Width Space & Karakter Dolandırma Tespiti    │
└────────────────────────────────────────────────────────┘
          │ (Temiz veya Arındırılmış)
          ▼
┌────────────────────────────────────────────────────────┐
│ 2. Katman: Prompt Injection & Jailbreak Dedektörü      │ ──► Kural ihlali durumunda:
│    - DAN / Do Anything Now / Persona Bypass            │     [ ENGELLE (BLOCK) ]
│    - "Önceki talimatları unut" (Instruction Override)  │
│    - Sistem İstemi Hırsızlığı & ChatML Tag Injection   │
└────────────────────────────────────────────────────────┘
          │ (Geçti)
          ▼
┌────────────────────────────────────────────────────────┐
│ 3. Katman: KVKK & GDPR Hassas Veri (PII) Redaksiyonu   │ ──► Maskeleme veya Kasa:
│    - 11 Haneli TCKN (Algoritmik NVI Mod 10 Kontrolü)   │     [ ARINDIR & GEÇİR ]
│    - Luhn Mod 10 Kredi Kartı & TROY / VISA / MC        │
│    - TR IBAN, Telefon, E-posta, API Anahtarları (sk-)  │
└────────────────────────────────────────────────────────┘
          │ (Arındırılmış İstem)
          ▼
┌────────────────────────────────────────────────────────┐
│ 4. Katman: Semantik Tehdit & Vektör Benzerliği         │ ──► Siber istismar veya zararlı
│    - Bilinen Saldırı Kümeleri ile Kosinüs Benzerliği   │     kod taleplerini puanlama
└────────────────────────────────────────────────────────┘
          │
          ▼
┌────────────────────────────────────────────────────────┐
│ [ Güvenli LLM Proxy Yürütmesi ]                        │
└────────────────────────────────────────────────────────┘
          │
          ▼
┌────────────────────────────────────────────────────────┐
│ 5. Katman: Çıktı Koruma Duvarı (Output Guardrail)       │ ──► Canary Token veya yıkıcı
│    - Canary Token Sızıntı Kontrolü (Model İfşası)      │     kod (rm -rf) sızıntısını durdur
│    - Yıkıcı Terminal Komut Filtresi                    │
└────────────────────────────────────────────────────────┘
          │
          ▼
[ Güvenli & KVKK Uyumlu Sonuç ]
```

---

## 🧮 Matematiksel ve Algoritmik Doğrulama Motorları

NeuroShield'ı diğer guardrail araçlarından ayıran en önemli özellik, sahte pozitifleri (false-positive) sıfıra indiren **deterministik matematiksel algoritmalar** kullanmasıdır.

### 1. T.C. Kimlik No Doğrulama Algoritması (NVI Mod 10)

Rastgele 11 haneli sayılar maskelenmez; yalnızca Türkiye Cumhuriyeti Nüfus ve Vatandaşlık İşleri resmi algoritmasına tam uyan numaralar tespit edilir:

$$\text{Tek Toplam} = d_1 + d_3 + d_5 + d_7 + d_9$$
$$\text{Çift Toplam} = d_2 + d_4 + d_6 + d_8$$
$$d_{10} = ((7 \times \text{Tek Toplam}) - \text{Çift Toplam}) \pmod{10}$$
$$d_{11} = \left(\sum_{i=1}^{10} d_i\right) \pmod{10}$$

*Kural:* İlk hane 0 olamaz ($d_1 \neq 0$).

### 2. Luhn Algoritması (ISO/IEC 7812 Mod 10)

Kredi kartı ve banka kartı doğrulaması için uluslararası Luhn algoritması kullanılır:

Sağdan sola her ikinci basamak 2 ile çarpılır. Çarpım 9'dan büyükse 9 çıkarılır. Tüm basamakların toplamı 10'a tam bölünmelidir:

$$\sum_{i=1}^{n} f(d_i) \equiv 0 \pmod{10}$$

Ayrıca BIN desenleri analiz edilerek **TROY (9792...)**, **VISA (4...)**, **MasterCard (51-55...)**, **AMEX (34/37...)** kart türleri otomatik etiketlenir.

### 3. Shannon Bilgi Entropisi Analizi

Base64, hex kodlama veya şifrelenmiş zararlı yükleri (obfuscated payloads) yakalamak için bilgi entropisi formülü yürütülür:

$$H(X) = -\sum_{i=1}^{n} P(x_i) \log_2 P(x_i)$$

Doğal insan dili metinleri tipik olarak **3.2 – 4.3 bits** aralığındayken, şifrelenmiş veya rastgele gizlenmiş veriler **4.85 bits** eşiğini aşarak Heuristik alarmı tetikler.

---

## 🎯 OWASP LLM Top 10 Uyumluluğu

| OWASP Tehdit Kodu | Tehdit Tanımı | NeuroShield Savunma Mekanizması |
|---|---|---|
| **LLM01** | Prompt Injection & Jailbreak | Talimat ezme, DAN personası ve ChatML belirteç süzgeci |
| **LLM02** | Sensitive Information Disclosure | Algoritmik TCKN, Luhn Kart, IBAN, API Key redaksiyonu |
| **LLM06** | Excessive Agency | Yıkıcı terminal komutları (`rm -rf`, `DROP TABLE`) blokajı |
| **LLM07** | System Prompt Leakage | "Repeat words above" ve gizli Canary Token koruması |
| **LLM08** | Vector & Embedding Poisoning | n-gram kosinüs benzerliği ile semantik tehdit kümelemesi |
| **LLM10** | Unbounded Consumption (DoS) | Aşırı uzunluk ve token doldurma (stuffing) filtrelemesi |

---

## 💻 Geliştirici Entegrasyon SDK & Middleware

NeuroShield'ı projelerinize dakikalar içinde entegre edebilirsiniz:

### Node.js / Express.js Middleware

```typescript
import { Request, Response, NextFunction } from 'express';
import { executeGuardrailPipeline } from 'neuro-shield';

export function neuroShieldGuard(req: Request, res: Response, next: NextFunction) {
  const { prompt } = req.body;
  if (!prompt) return next();

  const report = executeGuardrailPipeline(prompt, {
    sensitivity: 'strict',
    piiStrategy: 'mask',
  });

  if (report.verdict === 'BLOCK') {
    return res.status(403).json({
      error: 'Security Policy Violation',
      reason: report.blockReason,
      reportId: report.id,
      risk: report.overallRisk,
    });
  }

  // LLM'e arındırılmış güvenli istemi ilet
  req.body.sanitizedPrompt = report.sanitizedPrompt;
  next();
}
```

### Python / FastAPI Dependency

```python
from fastapi import Request, HTTPException
from neuro_shield import inspect_prompt

async def verify_llm_guardrail(request: Request):
    body = await request.json()
    prompt = body.get("prompt", "")
    
    report = inspect_prompt(prompt, sensitivity="strict")
    if report["verdict"] == "BLOCK":
        raise HTTPException(
            status_code=403, 
            detail={
                "error": "Saldırı Engellendi (Prompt Injection)",
                "reason": report["block_reason"]
            }
        )
    request.state.sanitized_prompt = report["sanitized_prompt"]
```

---

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 20+ (Node 22 veya 24 önerilir)
- npm 10+

### Adım Adım Kurulum

```bash
# 1. Depoyu klonlayın
git clone https://github.com/goktugis/neuro-shield.git
cd neuro-shield

# 2. Bağımlılıkları yükleyin
npm install

# 3. Geliştirici sunucusunu başlatın
npm run dev

# 4. Üretim sürümünü derleyin
npm run build
```

Uygulama varsayılan olarak `http://localhost:5173` adresinde açılacaktır.

---

## 🧪 Test ve Doğrulama

NeuroShield, 21 adet otomatik birim ve entegrasyon testi ile birlikte gelir:

```bash
# Vitest testlerini tek seferlik çalıştırın
npm test

# Testleri canlı izleme (watch) modunda çalıştırın
npm run test:watch
```

**Birim Test Kapsamı:**
- ✅ Resmi NVI kurallarına göre geçerli/geçersiz TCKN doğrulaması
- ✅ Luhn algoritması, TROY, VISA, MasterCard kontrolü
- ✅ Shannon Entropi hesaplaması ve Base64 çözümleme
- ✅ Sıfır genişlikli (Zero-width) görünmez karakter ayıklama
- ✅ OWASP LLM01 Prompt Injection, DAN ve talimat ezme yakalama
- ✅ KVKK PII tam redaksiyon, yıldızlı maskeleme ve Kasa (Vault) çözümü
- ✅ Çıktı katmanında Canary Token sızıntı blokajı

---

## 🐳 Docker ile Dağıtım

```bash
# Docker imajını derleyip çalıştırın
docker-compose up -d --build

# Tarayıcınızda açın:
# http://localhost:3000
```

---

## 🔐 Güvenlik ve Gizlilik Mimarisi

- **Sıfır Dış Veri İletimi (Zero-Exfiltration):** İstemleriniz, hassas verileriniz veya API anahtarlarınız hiçbir harici üçüncü taraf sunucuya veya bulut servisine gönderilmez.
- **Sıfır Açık API Anahtarı:** Proje kaynak kodunda hiçbir gizli anahtar, API tokenı veya kimlik bilgisi bulunmaz; `.gitignore` ve CI denetimleri ile korunur.
- **Güvenli Oturum Kasası (Session Vault):** Kasa modunda saklanan orijinal veriler yalnızca istemci belleğinde (RAM) geçici olarak tutulur ve oturum sonunda silinir.

---

## 📄 Lisans ve Yazar

Bu proje [MIT Lisansı](LICENSE) kapsamında açık kaynak olarak yayınlanmıştır.

Geliştirici: **Göktuğ İşeri** ([@goktugis](https://github.com/goktugis))
