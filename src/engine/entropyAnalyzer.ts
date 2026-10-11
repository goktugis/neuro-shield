/**
 * Shannon Entropi & Heuristik Obfuscation Analiz Motoru
 * Şifrelenmiş payload'ları, görünmez Unicode karakterleri ve kodlama hilelerini yakalar.
 */

import type { HeuristicStageResult } from '../types';

/**
 * Bir metnin Shannon Entropisini hesaplar (Bits per character)
 */
export function calculateShannonEntropy(text: string): number {
  if (!text || text.length === 0) return 0;

  const frequencies = new Map<string, number>();
  for (const char of text) {
    frequencies.set(char, (frequencies.get(char) || 0) + 1);
  }

  const length = text.length;
  let entropy = 0;

  for (const count of frequencies.values()) {
    const p = count / length;
    entropy -= p * Math.log2(p);
  }

  return Number(entropy.toFixed(3));
}

/**
 * Gizli ve görünmez Unicode karakterlerini tespit eder (Stealth Prompt Injection koruması)
 */
export const INVISIBLE_UNICODE_REGEX = /[\u200B\u200C\u200D\u2060\uFEFF\u00AD\u200E\u200F\u202A-\u202E]/g;

export function detectInvisibleUnicode(text: string): {
  hasInvisible: boolean;
  count: number;
  cleanedText: string;
} {
  const matches = text.match(INVISIBLE_UNICODE_REGEX);
  const count = matches ? matches.length : 0;
  const cleanedText = text.replace(INVISIBLE_UNICODE_REGEX, '');

  return {
    hasInvisible: count > 0,
    count,
    cleanedText,
  };
}

/**
 * Base64 veya Hex ile gizlenmiş saldırı yüklerini tespit eder
 */
export function detectObfuscatedEncodings(text: string): Array<{
  type: 'base64' | 'hex';
  raw: string;
  decoded: string;
}> {
  const findings: Array<{ type: 'base64' | 'hex'; raw: string; decoded: string }> = [];

  // Base64 tespiti (en az 16 karakter, isteğe bağlı = veya == dolgusu)
  const base64Regex = /(?:[A-Za-z0-9+/]{4}){3,}(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})/g;
  let match: RegExpExecArray | null;

  while ((match = base64Regex.exec(text)) !== null) {
    const raw = match[0];
    if (raw.length < 16) continue;
    try {
      let decoded = '';
      const gBuffer = (globalThis as unknown as { Buffer?: { from: (s: string, e: string) => { toString: (e: string) => string } } }).Buffer;
      if (typeof atob === 'function') {
        decoded = atob(raw);
      } else if (gBuffer) {
        decoded = gBuffer.from(raw, 'base64').toString('utf-8');
      }

      // Mantıklı yazdırılabilir ASCII metin mi?
      if (/^[\x20-\x7E\s]{4,}$/.test(decoded)) {
        findings.push({
          type: 'base64',
          raw,
          decoded,
        });
      }
    } catch {
      // Geçersiz base64, atla
    }
  }

  // Hex dizesi tespiti (örn: 0x4142... veya ardışık 16+ hex karakter)
  const hexRegex = /\b(?:0x)?([0-9a-fA-F]{16,})\b/g;
  let hexMatch: RegExpExecArray | null;

  while ((hexMatch = hexRegex.exec(text)) !== null) {
    const hex = hexMatch[1];
    if (hex.length % 2 === 0) {
      try {
        let str = '';
        for (let i = 0; i < hex.length; i += 2) {
          str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        if (/^[\x20-\x7E\s]{4,}$/.test(str)) {
          findings.push({
            type: 'hex',
            raw: hexMatch[0],
            decoded: str,
          });
        }
      } catch {
        // Geçersiz hex
      }
    }
  }

  return findings;
}

/**
 * Heuristik Aşama Analizini Yürütür
 */
export function analyzeHeuristics(
  text: string,
  entropyThreshold: number = 4.85
): HeuristicStageResult {
  const entropy = calculateShannonEntropy(text);
  const unicodeResult = detectInvisibleUnicode(text);
  const encodings = detectObfuscatedEncodings(text);

  const isHighEntropy = text.length > 30 && entropy >= entropyThreshold;
  const tokenStuffingSuspected = text.length > 4000;

  const details: string[] = [];
  if (isHighEntropy) {
    details.push(`Yüksek Shannon Entropisi (${entropy} bits) tespit edildi; rastgele veya şifrelenmiş veri olabilir.`);
  }
  if (unicodeResult.hasInvisible) {
    details.push(`${unicodeResult.count} adet görünmez/sıfır genişlikli (Zero-Width) Unicode karakter yakalandı.`);
  }
  if (encodings.length > 0) {
    details.push(`${encodings.length} adet Base64/Hex ile gizlenmiş veri tespit edildi.`);
  }
  if (tokenStuffingSuspected) {
    details.push(`Girdi çok uzun (${text.length} karakter); Token Doldurma (DoS/Stuffing) şüphesi.`);
  }

  const passed = !isHighEntropy && !unicodeResult.hasInvisible && encodings.length === 0;

  return {
    entropy,
    isHighEntropy,
    hasInvisibleUnicode: unicodeResult.hasInvisible,
    invisibleCharsCount: unicodeResult.count,
    detectedEncodings: encodings.map((e) => ({
      type: e.type,
      decodedSample: e.decoded.slice(0, 40) + (e.decoded.length > 40 ? '...' : ''),
    })),
    tokenStuffingSuspected,
    passed,
    details,
  };
}
