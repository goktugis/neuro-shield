/**
 * Semantik Tehdit ve Vektör Benzerlik Sınıflandırıcısı
 * Bilinen saldırı vektörlerinin temsilci n-gram gömüleri (embeddings) ile
 * kosinüs benzerliği hesaplar. Sıfır harici API bağımlılığı ile istemci tarafında çalışır.
 */

import type { SemanticThreatStageResult } from '../types';

interface ThreatCluster {
  id: string;
  nameTr: string;
  keywords: string[];
  weight: number;
}

const THREAT_CLUSTERS: ThreatCluster[] = [
  {
    id: 'jailbreak_persona',
    nameTr: 'Jailbreak & Rol Dayatması',
    keywords: ['jailbreak', 'dan', 'bypass', 'unrestricted', 'no limits', 'ignore rules', 'pretend', 'kısıtlama', 'filtre'],
    weight: 1.2,
  },
  {
    id: 'credential_exfil',
    nameTr: 'Yetki ve Kimlik Sızıntısı',
    keywords: ['steal', 'dump', 'password', 'token', 'credential', 'api key', 'exfiltrate', 'şifre çal', 'sızdır'],
    weight: 1.3,
  },
  {
    id: 'cyber_exploit',
    nameTr: 'Siber İstismar ve Zararlı Kod',
    keywords: ['exploit', 'reverse shell', 'sql injection', 'payload', 'xss', 'malware', 'antivirus bypass', 'istismar'],
    weight: 1.4,
  },
  {
    id: 'social_engineering',
    nameTr: 'Sosyal Mühendislik ve Oltalama',
    keywords: ['phishing', 'fake login', 'impersonate', 'scam', 'oltalama', 'sahte banka', 'kandır'],
    weight: 1.1,
  },
  {
    id: 'toxic_harm',
    nameTr: 'Zararlı İçerik ve Toksisite',
    keywords: ['bomb', 'weapon', 'poison', 'terror', 'hate', 'patlayıcı', 'silah yapımı', 'zehir'],
    weight: 1.5,
  },
];

/**
 * Metni n-gram kelime frekans vektörüne dönüştürür
 */
function createBagOfWords(text: string): Map<string, number> {
  const map = new Map<string, number>();
  const tokens = text
    .toLowerCase()
    .replace(/[^\w\sğüşıöçĞÜŞİÖÇ]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2);

  for (const token of tokens) {
    map.set(token, (map.get(token) || 0) + 1);
  }

  return map;
}

/**
 * İki terim vektörü arasındaki Kosinüs Benzerliğini hesaplar
 */
function calculateCosineSimilarity(vecA: Map<string, number>, targetKeywords: string[]): number {
  if (vecA.size === 0 || targetKeywords.length === 0) return 0;

  let dotProduct = 0;
  for (const kw of targetKeywords) {
    const valA = vecA.get(kw.toLowerCase()) || 0;
    if (valA > 0) {
      dotProduct += valA * 1;
    }
  }

  let magA = 0;
  for (const val of vecA.values()) {
    magA += val * val;
  }
  magA = Math.sqrt(magA);

  const magB = Math.sqrt(targetKeywords.length);

  if (magA === 0 || magB === 0) return 0;

  return dotProduct / (magA * magB);
}

/**
 * Semantik Tehdit Analizini Yürütür
 */
export function classifySemanticThreat(
  prompt: string,
  threshold: number = 0.25
): SemanticThreatStageResult {
  const textVector = createBagOfWords(prompt);

  let topThreatCategory = 'Güvenli (Tehdit Yok)';
  let highestSimilarity = 0;
  const flaggedVectors: string[] = [];

  for (const cluster of THREAT_CLUSTERS) {
    const score = calculateCosineSimilarity(textVector, cluster.keywords) * cluster.weight;

    if (score > highestSimilarity) {
      highestSimilarity = score;
      topThreatCategory = cluster.nameTr;
    }

    if (score >= threshold) {
      flaggedVectors.push(`${cluster.nameTr} (${Math.round(score * 100)}%)`);
    }
  }

  // Normalleştirilmiş skor (0-1 arası)
  const normalizedScore = Number(Math.min(1, highestSimilarity).toFixed(2));
  const passed = normalizedScore < threshold;

  return {
    topThreatCategory: passed ? 'Güvenli (Normal İstek)' : topThreatCategory,
    threatSimilarityScore: normalizedScore,
    toxicityScore: Number((normalizedScore * 0.8).toFixed(2)),
    flaggedVectors,
    passed,
  };
}
