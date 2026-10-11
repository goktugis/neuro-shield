/**
 * KVKK & GDPR Uyumlu Hassas Veri (PII) ve Gizli Anahtar Redaksiyon Motoru
 * TCKN, Kredi Kartı, TR IBAN, Telefon, E-posta ve API Anahtarlarını tespit ve maskeleme.
 */

import type { PiiEntity, PiiStageResult, PiiStrategy } from '../types';
import { extractAndValidateTCKNs } from './tcKimlikValidator';
import { extractCreditCards } from './luhnValidator';

// Şifreli Kasa Token Deposu (In-Memory Reversible Session Vault)
const sessionVault = new Map<string, string>();

/**
 * Benzersiz Kasa Token Kimliği Üretir
 */
function generateVaultId(type: string): string {
  const rand = Math.random().toString(36).substring(2, 9);
  return `NS-VAULT-${type.toUpperCase()}-${rand}`;
}

/**
 * Maskeleme Stratejisine Göre Metin Dönüşümü Yapar
 */
function formatMasked(
  entity: Omit<PiiEntity, 'masked' | 'vaultId'>,
  strategy: PiiStrategy
): { masked: string; vaultId?: string } {
  const { type, original } = entity;

  if (strategy === 'vault') {
    const vaultId = generateVaultId(type);
    sessionVault.set(vaultId, original);
    return {
      masked: `[TOKEN:${vaultId}]`,
      vaultId,
    };
  }

  if (strategy === 'mask') {
    switch (type) {
      case 'TCKN':
        return { masked: `${original.slice(0, 3)}*****${original.slice(8)}` };
      case 'CREDIT_CARD': {
        const clean = original.replace(/[\s-]/g, '');
        return { masked: `${clean.slice(0, 4)} **** **** ${clean.slice(-4)}` };
      }
      case 'IBAN': {
        const clean = original.replace(/\s+/g, '');
        return { masked: `${clean.slice(0, 4)} **** **** **** ${clean.slice(-4)}` };
      }
      case 'EMAIL': {
        const parts = original.split('@');
        const name = parts[0] || '';
        const domain = parts[1] || '';
        return { masked: `${name.slice(0, 2)}***@${domain}` };
      }
      case 'PHONE':
        return { masked: `${original.slice(0, 4)} *** ** ${original.slice(-2)}` };
      case 'API_KEY':
        return { masked: `${original.slice(0, 5)}...[GİZLENDİ]...${original.slice(-4)}` };
      case 'JWT':
        return { masked: 'eyJ...[JWT_MASKELENDİ]' };
      case 'PRIVATE_KEY':
        return { masked: '-----BEGIN PRIVATE KEY-----\n[GİZLENDİ]\n-----END PRIVATE KEY-----' };
      default:
        return { masked: `[MASKELENDİ:${type}]` };
    }
  }

  // Varsayılan: 'redact' (Tam Sansür)
  return { masked: `[REDACTED_${type}]` };
}

/**
 * Metin üzerindeki tüm PII ve gizli anahtarları tespit edip maskeler
 */
export function redactPii(
  text: string,
  strategy: PiiStrategy = 'redact'
): PiiStageResult {
  const entities: PiiEntity[] = [];

  // 1. TCKN Taraması (Algoritmik Doğrulamalı)
  const tcknCandidates = extractAndValidateTCKNs(text);
  for (const cand of tcknCandidates) {
    const rawEntity = {
      type: 'TCKN' as const,
      original: cand.tckn,
      startIndex: cand.startIndex,
      endIndex: cand.endIndex,
      confidence: cand.isValidChecksum ? 0.99 : 0.7,
      metadata: { isValidChecksum: cand.isValidChecksum },
    };
    const { masked, vaultId } = formatMasked(rawEntity, strategy);
    entities.push({ ...rawEntity, masked, vaultId });
  }

  // 2. Kredi Kartı Taraması (Luhn Doğrulamalı)
  const cardCandidates = extractCreditCards(text);
  for (const card of cardCandidates) {
    const rawEntity = {
      type: 'CREDIT_CARD' as const,
      original: card.raw,
      startIndex: card.startIndex,
      endIndex: card.endIndex,
      confidence: 0.98,
      metadata: { brand: card.validation.brand },
    };
    const { masked, vaultId } = formatMasked(rawEntity, strategy);
    entities.push({ ...rawEntity, masked, vaultId });
  }

  // 3. TR IBAN Taraması
  const ibanRegex = /\bTR\d{2}\s?(?:\d{4}\s?){5}\d{2}\b/gi;
  let ibanMatch: RegExpExecArray | null;
  while ((ibanMatch = ibanRegex.exec(text)) !== null) {
    const rawEntity = {
      type: 'IBAN' as const,
      original: ibanMatch[0],
      startIndex: ibanMatch.index,
      endIndex: ibanMatch.index + ibanMatch[0].length,
      confidence: 0.95,
    };
    const { masked, vaultId } = formatMasked(rawEntity, strategy);
    entities.push({ ...rawEntity, masked, vaultId });
  }

  // 4. Türkiye ve Uluslararası Telefon Numaraları (Kelime sınırları ile)
  const phoneRegex = /\b(?:(?:\+?90|0)\s*)?5\d{2}[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}\b/g;
  let phoneMatch: RegExpExecArray | null;
  while ((phoneMatch = phoneRegex.exec(text)) !== null) {
    const rawEntity = {
      type: 'PHONE' as const,
      original: phoneMatch[0],
      startIndex: phoneMatch.index,
      endIndex: phoneMatch.index + phoneMatch[0].length,
      confidence: 0.9,
    };
    const { masked, vaultId } = formatMasked(rawEntity, strategy);
    entities.push({ ...rawEntity, masked, vaultId });
  }

  // 5. E-posta Adresleri
  const emailRegex = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g;
  let emailMatch: RegExpExecArray | null;
  while ((emailMatch = emailRegex.exec(text)) !== null) {
    const rawEntity = {
      type: 'EMAIL' as const,
      original: emailMatch[0],
      startIndex: emailMatch.index,
      endIndex: emailMatch.index + emailMatch[0].length,
      confidence: 0.95,
    };
    const { masked, vaultId } = formatMasked(rawEntity, strategy);
    entities.push({ ...rawEntity, masked, vaultId });
  }

  // 6. API Anahtarları (OpenAI, AWS, GitHub)
  const apiKeyPatterns: Array<{ name: PiiEntity['type']; regex: RegExp }> = [
    { name: 'API_KEY', regex: /\b(?:sk-[a-zA-Z0-9_-]{20,}|AKIA[0-9A-Z]{16}|(?:ghp|gho)_[a-zA-Z0-9]{36})\b/g },
    { name: 'JWT', regex: /\beyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\b/g },
    { name: 'PRIVATE_KEY', regex: /-----BEGIN (?:RSA )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA )?PRIVATE KEY-----/g },
  ];

  for (const pat of apiKeyPatterns) {
    let match: RegExpExecArray | null;
    while ((match = pat.regex.exec(text)) !== null) {
      const rawEntity = {
        type: pat.name,
        original: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        confidence: 0.99,
      };
      const { masked, vaultId } = formatMasked(rawEntity, strategy);
      entities.push({ ...rawEntity, masked, vaultId });
    }
  }

  // Metin üzerindeki çakışan indeksleri sırala ve sondan başa doğru değiştir
  // Böylece indeks kaymaları önlenir
  entities.sort((a, b) => b.startIndex - a.startIndex);

  let sanitizedText = text;
  // Tekrarlanan veya çakışan aralıkları filtrele
  const appliedIntervals: Array<[number, number]> = [];

  for (const ent of entities) {
    const isOverlapping = appliedIntervals.some(
      ([start, end]) =>
        (ent.startIndex >= start && ent.startIndex < end) ||
        (ent.endIndex > start && ent.endIndex <= end) ||
        (ent.startIndex <= start && ent.endIndex >= end)
    );

    if (!isOverlapping) {
      appliedIntervals.push([ent.startIndex, ent.endIndex]);
      sanitizedText =
        sanitizedText.slice(0, ent.startIndex) +
        ent.masked +
        sanitizedText.slice(ent.endIndex);
    }
  }

  // Orijinal sıralamaya göre dön
  entities.sort((a, b) => a.startIndex - b.startIndex);

  const vaultedCount = entities.filter((e) => e.vaultId !== undefined).length;
  const passed = entities.length === 0;

  return {
    entities,
    sanitizedText,
    vaultedCount,
    passed,
  };
}

/**
 * Kasa Deposu Üzerinden Orijinal Veriyi Çözümler (Reversible Vault Detokenizer)
 */
export function resolveVaultToken(vaultId: string): string | undefined {
  return sessionVault.get(vaultId);
}
