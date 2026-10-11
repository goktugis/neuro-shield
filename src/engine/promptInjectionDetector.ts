/**
 * OWASP Top 10 for LLM: Prompt Injection & Jailbreak Tespit Motoru
 * Doğrudan, dolaylı, rol yapma ve sistem istemi sızdırma girişimlerini tespit eder.
 */

import type { PromptInjectionStageResult, RiskLevel } from '../types';

interface AttackPattern {
  id: string;
  category: PromptInjectionStageResult['detectedAttacks'][0]['category'];
  severity: RiskLevel;
  regex: RegExp;
  descriptionTr: string;
}

export const ATTACK_PATTERNS: AttackPattern[] = [
  // 1. INSTRUCTION OVERRIDE (Talimat Ezme)
  {
    id: 'ovr-ignore-en',
    category: 'INSTRUCTION_OVERRIDE',
    severity: 'HIGH',
    regex: /(?:ignore|disregard|forget|dismiss|override)\s+(?:all\s+)?(?:previous|prior|above|system)\s+(?:instructions|prompts|rules|guidelines|context)/i,
    descriptionTr: 'Önceki sistem talimatlarını ve kuralları yok sayma/ezme girişimi.',
  },
  {
    id: 'ovr-ignore-tr',
    category: 'INSTRUCTION_OVERRIDE',
    severity: 'HIGH',
    regex: /(?:önceki|geçmiş|yukarıdaki|tüm|bütün)[^\n\r]*?(?:talimat|kural|yönerge|istem)[^\n\r]*?(?:unut|yok say|boşver|atla|sil|geç)/iu,
    descriptionTr: 'Sistem kurallarını ve önceki istemleri sıfırlama/yok sayma girişimi.',
  },
  {
    id: 'ovr-new-directive',
    category: 'INSTRUCTION_OVERRIDE',
    severity: 'MEDIUM',
    regex: /(?:from now on|bundan sonra|starting now)\s*,?\s*(?:you are|sen|you must|act as if there are no rules)/i,
    descriptionTr: 'Yapay zekanın davranış kuralını zorla yeniden tanımlama girişimi.',
  },

  // 2. ROLEPLAY JAILBREAK (Karakter & Gardiyan Kırma)
  {
    id: 'jb-dan',
    category: 'ROLEPLAY_JAILBREAK',
    severity: 'CRITICAL',
    regex: /\b(?:DAN\s*(?:mode|\d+\.0)?|Do Anything Now|AIM\s*mode|STAN\s*mode|DUDE\s*mode)\b/i,
    descriptionTr: 'Klasik DAN (Do Anything Now) veya çoklu kişilik jailbreak paterni.',
  },
  {
    id: 'jb-dev-mode',
    category: 'ROLEPLAY_JAILBREAK',
    severity: 'CRITICAL',
    regex: /(?:developer mode(?:\s+is)?\s+(?:enabled|activated|on)|geliştirici modu(?:nu)?\s+(?:aç|etkinleştir|aktif et))/i,
    descriptionTr: 'Korumasız "Developer Mode" (Geliştirici Modu) tetikleme girişimi.',
  },
  {
    id: 'jb-evil-twin',
    category: 'ROLEPLAY_JAILBREAK',
    severity: 'HIGH',
    regex: /(?:hypothetical scenario where you have no constraints|senin kısıtlamasız ve etik kuralları olmayan bir ikizin var|evil confidant|unfiltered ai)/i,
    descriptionTr: 'Varsayımsal senaryo veya kısıtlamasız ikiz personası ile kural aşımı.',
  },

  // 3. SYSTEM PROMPT LEAK (Sistem İstemi Hırsızlığı)
  {
    id: 'leak-sys-prompt-en',
    category: 'SYSTEM_PROMPT_LEAK',
    severity: 'HIGH',
    regex: /(?:repeat|print|reveal|output|display|show|quote)\s+(?:the\s+)?(?:words\s+above|system\s+prompt|initial\s+instructions|secret\s+guidelines)/i,
    descriptionTr: 'Gizli sistem istemini (System Prompt) ifşa etme talebi.',
  },
  {
    id: 'leak-sys-prompt-tr',
    category: 'SYSTEM_PROMPT_LEAK',
    severity: 'HIGH',
    regex: /(?:sistem\s+istemini|başlangıç\s+talimatlarını|sana\s+verilen\s+gizli\s+kuralları)\s+(?:yaz|göster|ifşa et|tekrarla|bana ver)/i,
    descriptionTr: 'Yapay zekanın gizli sistem yönergelerini sızdırma girişimi.',
  },

  // 4. DELIMITER INJECTION (Sözdizimsel Ayırıcı Enjeksiyonu)
  {
    id: 'delim-chatml',
    category: 'DELIMITER_INJECTION',
    severity: 'CRITICAL',
    regex: /<\|(?:im_start|im_end|endoftext|system|user|assistant)\|>|<\/(?:system|user|context)>\s*<(?:system|user)>/i,
    descriptionTr: 'ChatML veya model özel belirteçleri (<|im_start|>) ile yapısal enjeksiyon.',
  },
  {
    id: 'delim-llama-inst',
    category: 'DELIMITER_INJECTION',
    severity: 'HIGH',
    regex: /\[(?:INST|SYS)\]|\[\/(?:INST|SYS)\]|<<SYS>>|<\/<<SYS>>/i,
    descriptionTr: 'LLaMA veya benzeri modellerin dahili `[INST]` ve `<<SYS>>` etiketlerini taklit etme.',
  },

  // 5. INDIRECT INJECTION (Dolaylı / Görsel Enjeksiyon)
  {
    id: 'ind-exfil-img',
    category: 'INDIRECT_INJECTION',
    severity: 'CRITICAL',
    regex: /!\[.*?\]\(https?:\/\/[^\s)]+[\?&](?:token|leak|secret|data|exfil)=[^)]*\)/i,
    descriptionTr: 'Markdown görsel isteğiyle arka planda veri sızdırma (Exfiltration) girişimi.',
  },

  // 6. HOSTILE COMMAND (Zararlı Komut ve İstismar Kodları)
  {
    id: 'cmd-destructive',
    category: 'HOSTILE_COMMAND',
    severity: 'CRITICAL',
    regex: /\b(?:rm\s+-rf\s+\/|DROP\s+(?:DATABASE|TABLE)\b|format\s+c:|powershell\s+-enc|Invoke-Expression|mimikatz|reverse_shell)\b/i,
    descriptionTr: 'Yıkıcı sistem komutları veya zararlı yazılım çalıştırma isteği.',
  },
];

/**
 * Verilen istem üzerinde Prompt Injection ve Jailbreak denetimi yapar
 */
export function detectPromptInjection(
  prompt: string,
  customBlacklist: string[] = []
): PromptInjectionStageResult {
  const detectedAttacks: PromptInjectionStageResult['detectedAttacks'] = [];
  const normalized = prompt.trim();

  // Standart desenleri tara
  for (const pattern of ATTACK_PATTERNS) {
    const match = pattern.regex.exec(normalized);
    if (match) {
      detectedAttacks.push({
        category: pattern.category,
        severity: pattern.severity,
        pattern: pattern.id,
        descriptionTr: pattern.descriptionTr,
        matchSnippet: match[0],
      });
    }
  }

  // Özel kullanıcı kara listesini (Blacklist) kontrol et
  for (const word of customBlacklist) {
    if (word && normalized.toLowerCase().includes(word.toLowerCase())) {
      detectedAttacks.push({
        category: 'INSTRUCTION_OVERRIDE',
        severity: 'HIGH',
        pattern: 'custom-blacklist-match',
        descriptionTr: `Özel kara listede bulunan '${word}' ifadesi tespit edildi.`,
        matchSnippet: word,
      });
    }
  }

  // Güven skoru hesaplama (0: Temiz, 1: Kesin Saldırı)
  let confidenceScore = 0;
  if (detectedAttacks.length > 0) {
    const hasCritical = detectedAttacks.some((a) => a.severity === 'CRITICAL');
    const hasHigh = detectedAttacks.some((a) => a.severity === 'HIGH');

    if (hasCritical) {
      confidenceScore = Math.min(1, 0.85 + detectedAttacks.length * 0.05);
    } else if (hasHigh) {
      confidenceScore = Math.min(1, 0.7 + detectedAttacks.length * 0.05);
    } else {
      confidenceScore = Math.min(1, 0.4 + detectedAttacks.length * 0.1);
    }
  }

  const isJailbreak = detectedAttacks.length > 0 && confidenceScore >= 0.5;
  const passed = detectedAttacks.length === 0;

  return {
    detectedAttacks,
    confidenceScore: Number(confidenceScore.toFixed(2)),
    isJailbreak,
    passed,
  };
}
