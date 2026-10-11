/**
 * Çıktı Koruma Duvarı (Output Guardrail & Canary Token Sızıntı Filtresi)
 * Modelin ürettiği yanıtın güvenliğini denetler, sistem isteminin ifşa edilmediğini
 * ve zararlı komutların iletilmediğini garanti altına alır.
 */

import type { OutputGuardStageResult } from '../types';

/**
 * Üretilen model çıktısını denetler
 */
export function validateOutput(
  outputText: string,
  canaryToken: string = 'NS-CANARY-7749-CONFIDENTIAL'
): OutputGuardStageResult {
  const leakedCanaryTokens: string[] = [];

  // Canary Token kontrolü (Gizli sistem belirteci sızdırıldı mı?)
  if (canaryToken && outputText.includes(canaryToken)) {
    leakedCanaryTokens.push(canaryToken);
  }

  // Çıktıda yıkıcı komut var mı?
  const dangerousPatterns = [
    /\brm\s+-rf\s+\//i,
    /\bDROP\s+DATABASE\b/i,
    /\bformat\s+c:\b/i,
    /\bpowershell\s+.*-(?:enc|encodedcommand)\b/i,
  ];

  const hasDangerousCode = dangerousPatterns.some((pat) => pat.test(outputText));

  let sanitizedOutputText = outputText;
  if (leakedCanaryTokens.length > 0) {
    sanitizedOutputText = '[GÜVENLİK ENGELİ: Gizli Sistem Belirteci (Canary Token) sızıntısı engellendi!]';
  } else if (hasDangerousCode) {
    sanitizedOutputText = '[GÜVENLİK ENGELİ: Model çıktısında potansiyel olarak zararlı komut tespit edildi!]';
  }

  const passed = leakedCanaryTokens.length === 0 && !hasDangerousCode;

  return {
    leakedCanaryTokens,
    hasDangerousCode,
    sanitizedOutputText,
    passed,
  };
}
