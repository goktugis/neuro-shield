/**
 * Çok Katmanlı Güvenlik Duvarı Orkestratörü (Multi-Stage Guardrail Pipeline)
 * Tüm analiz katmanlarını sırayla veya paralel çalıştırıp nihai kararı üretir.
 */

import type {
  GuardrailReport,
  PipelineVerdict,
  RiskLevel,
  SecurityPolicy,
  StageExecutionMetric,
} from '../types';
import { analyzeHeuristics } from './entropyAnalyzer';
import { detectPromptInjection } from './promptInjectionDetector';
import { redactPii } from './piiRedactor';
import { classifySemanticThreat } from './semanticClassifier';
import { validateOutput } from './outputGuard';

export const DEFAULT_SECURITY_POLICY: SecurityPolicy = {
  name: 'Enterprise Zero-Trust',
  sensitivity: 'strict',
  entropyThreshold: 4.85,
  maxTokenLimit: 2048,
  piiStrategy: 'mask',
  enabledStages: {
    heuristic: true,
    injection: true,
    pii: true,
    semantic: true,
    output: true,
  },
  customBlacklist: [],
  customWhitelist: [],
  systemCanaryToken: 'NS-CANARY-7749-CONFIDENTIAL',
};

/**
 * İstem için güvenli ve zeki simüle edilmiş LLM yanıtı oluşturur
 */
function generateContextualAiResponse(
  sanitizedPrompt: string,
  verdict: PipelineVerdict,
  blockReason?: string
): string {
  if (verdict === 'BLOCK') {
    return `[KORUMA ENGELİ]: Bu istek NeuroShield Zero-Trust güvenlik politikaları uyarınca engellenmiştir. Neden: ${blockReason || 'Kritik güvenlik ihlali veya saldırı vektörü tespit edildi.'}`;
  }

  const clean = sanitizedPrompt.trim();

  // Kod veya teknik danışmanlık isteği mi?
  if (/kod|function|class|typescript|python|react|api|docker|test/i.test(clean)) {
    return `Merhaba! İsteğiniz başarıyla güvenlik duvarından geçti ve arındırıldı.\n\nİlettiğiniz teknik konuya ilişkin mimari prensipler:\n1. Zero-Trust ilkeleri gereği her girdi doğrulanmalı ve arındırılmalıdır.\n2. Hassas anahtarlar (API Key / JWT) doğrudan kodda saklanmamalı, ortam değişkenlerinde (ENV) veya anahtar kasasında tutulmalıdır.\n3. Girdiğiniz parametrelerle güvenli sistem entegrasyonu tamamlanmıştır. Başka nasıl yardımcı olabilirim?`;
  }

  // Finans veya kurumsal veri isteği mi?
  if (/tckn|kart|hesap|bakiye|iban|fatura|kvkk/i.test(clean)) {
    return `Merhaba! KVKK ve bankacılık uyumluluğu doğrultusunda hassas verileriniz (TCKN, Kart vb.) güvenlik katmanında maskelenmiştir.\n\nİsteğiniz başarıyla işleme alındı. Maskelenmiş veriler ile oturum kimliği eşleştirilmiş olup, kurum içi güvenli veri tabanında hiçbir açık PII kaydedilmemiştir.`;
  }

  return `İsteğiniz NeuroShield çok katmanlı güvenlik denetiminden başarıyla geçti.\n\nAnaliz Sonucu: Herhangi bir Prompt Injection, yetkisiz rol dayatması veya veri sızıntısı tespit edilmedi. Girdiniz kurumsal yapay zeka sistemlerine güvenle iletilebilir durumdadır.`;
}

/**
 * Guardrail Pipeline Çalıştırma Fonksiyonu
 */
export function executeGuardrailPipeline(
  rawPrompt: string,
  policy: SecurityPolicy = DEFAULT_SECURITY_POLICY
): GuardrailReport {
  const startTime = performance.now();
  const stageMetrics: StageExecutionMetric[] = [];
  const reportId = `rep_${Math.random().toString(36).substring(2, 10)}`;
  const timestamp = new Date().toISOString();

  // Basit token tahmini (~4 karakter = 1 token)
  const tokenCount = Math.max(1, Math.ceil(rawPrompt.length / 4));

  // Katman 1: Heuristik & Entropi
  const tHeuristicStart = performance.now();
  const heuristicResult = policy.enabledStages.heuristic
    ? analyzeHeuristics(rawPrompt, policy.entropyThreshold)
    : {
        entropy: 0,
        isHighEntropy: false,
        hasInvisibleUnicode: false,
        invisibleCharsCount: 0,
        detectedEncodings: [],
        tokenStuffingSuspected: false,
        passed: true,
        details: [],
      };
  const tHeuristicDuration = performance.now() - tHeuristicStart;

  stageMetrics.push({
    stageId: 'heuristic',
    nameTr: '1. Heuristik & Entropi Analizi',
    durationMs: Number(tHeuristicDuration.toFixed(2)),
    status: heuristicResult.passed ? 'passed' : 'warning',
    messageTr: heuristicResult.passed
      ? `Entropi normal (${heuristicResult.entropy} bits). Görünmez Unicode yok.`
      : heuristicResult.details.join(' | ') || 'Şüpheli girdi özellikleri tespit edildi.',
  });

  // Katman 2: Prompt Injection & Jailbreak
  const tInjectionStart = performance.now();
  const injectionResult = policy.enabledStages.injection
    ? detectPromptInjection(rawPrompt, policy.customBlacklist)
    : {
        detectedAttacks: [],
        confidenceScore: 0,
        isJailbreak: false,
        passed: true,
      };
  const tInjectionDuration = performance.now() - tInjectionStart;

  const hasCriticalAttack = injectionResult.detectedAttacks.some(
    (a) => a.severity === 'CRITICAL'
  );
  const hasHighAttack = injectionResult.detectedAttacks.some(
    (a) => a.severity === 'HIGH'
  );

  stageMetrics.push({
    stageId: 'injection',
    nameTr: '2. Prompt Injection & Jailbreak Denetimi',
    durationMs: Number(tInjectionDuration.toFixed(2)),
    status: injectionResult.passed
      ? 'passed'
      : hasCriticalAttack || hasHighAttack
      ? 'blocked'
      : 'warning',
    messageTr: injectionResult.passed
      ? 'Saldırı paterni veya kural ihlali bulunamadı.'
      : `${injectionResult.detectedAttacks.length} adet saldırı vektörü yakalandı: ${injectionResult.detectedAttacks.map((a) => a.category).join(', ')}`,
  });

  // Katman 3: KVKK & GDPR PII Redaksiyonu
  const tPiiStart = performance.now();
  const piiResult = policy.enabledStages.pii
    ? redactPii(rawPrompt, policy.piiStrategy)
    : {
        entities: [],
        sanitizedText: rawPrompt,
        vaultedCount: 0,
        passed: true,
      };
  const tPiiDuration = performance.now() - tPiiStart;

  stageMetrics.push({
    stageId: 'pii',
    nameTr: '3. KVKK / GDPR Hassas Veri Maskeleme',
    durationMs: Number(tPiiDuration.toFixed(2)),
    status: piiResult.passed ? 'passed' : 'warning',
    messageTr: piiResult.passed
      ? 'Açıkta hassas veri (TCKN, Kart, API Anahtarı vb.) bulunamadı.'
      : `${piiResult.entities.length} adet hassas veri tespit edildi ve ${policy.piiStrategy} modunda arındırıldı.`,
  });

  // Katman 4: Semantik Tehdit Sınıflandırması
  const tSemanticStart = performance.now();
  const semanticResult = policy.enabledStages.semantic
    ? classifySemanticThreat(rawPrompt, policy.sensitivity === 'strict' ? 0.2 : 0.35)
    : {
        topThreatCategory: 'Güvenli',
        threatSimilarityScore: 0,
        toxicityScore: 0,
        flaggedVectors: [],
        passed: true,
      };
  const tSemanticDuration = performance.now() - tSemanticStart;

  stageMetrics.push({
    stageId: 'semantic',
    nameTr: '4. Semantik Tehdit & Toksisite Analizi',
    durationMs: Number(tSemanticDuration.toFixed(2)),
    status: semanticResult.passed ? 'passed' : 'warning',
    messageTr: semanticResult.passed
      ? 'Semantik benzerlik güvenli sınırlar içerisinde.'
      : `Eşik aşıldı: ${semanticResult.topThreatCategory} (%${Math.round(semanticResult.threatSimilarityScore * 100)})`,
  });

  // Karar Verme Mantığı (Verdict Decision Engine)
  let verdict: PipelineVerdict = 'ALLOW';
  let overallRisk: RiskLevel = 'SAFE';
  let blockReason: string | undefined = undefined;

  // Engelleme koşulları
  if (hasCriticalAttack) {
    verdict = 'BLOCK';
    overallRisk = 'CRITICAL';
    blockReason = `Kritik Prompt Injection / Jailbreak Saldırısı tespit edildi (${injectionResult.detectedAttacks[0]?.category})`;
  } else if (hasHighAttack && policy.sensitivity !== 'permissive') {
    verdict = 'BLOCK';
    overallRisk = 'HIGH';
    blockReason = `Yüksek riskli güvenlik ihlali tespit edildi (${injectionResult.detectedAttacks[0]?.descriptionTr})`;
  } else if (heuristicResult.hasInvisibleUnicode && policy.sensitivity === 'strict') {
    verdict = 'BLOCK';
    overallRisk = 'HIGH';
    blockReason = 'Görünmez Unicode karakterleriyle gizlenmiş saldırı girişimi engellendi.';
  } else if (!piiResult.passed) {
    verdict = 'SANITIZE_AND_ALLOW';
    overallRisk = 'MEDIUM';
  } else if (!heuristicResult.passed || !semanticResult.passed) {
    overallRisk = 'LOW';
    verdict = 'ALLOW';
  }

  // Simüle Edilmiş Model Çıktısı Üretimi
  const initialResponse = generateContextualAiResponse(
    piiResult.sanitizedText,
    verdict,
    blockReason
  );

  // Katman 5: Çıktı Koruma Duvarı
  let outputResult = undefined;
  let finalResponse = initialResponse;

  if (policy.enabledStages.output && verdict !== 'BLOCK') {
    const tOutputStart = performance.now();
    outputResult = validateOutput(initialResponse, policy.systemCanaryToken);
    const tOutputDuration = performance.now() - tOutputStart;

    finalResponse = outputResult.sanitizedOutputText;

    stageMetrics.push({
      stageId: 'output',
      nameTr: '5. Çıktı Koruma & Canary Token Denetimi',
      durationMs: Number(tOutputDuration.toFixed(2)),
      status: outputResult.passed ? 'passed' : 'blocked',
      messageTr: outputResult.passed
        ? 'Çıktı temiz; gizli belirteç veya zararlı komut sızıntısı yok.'
        : 'Çıktıda gizli belirteç veya kural dışı komut saptandı!',
    });
  }

  const totalLatencyMs = Number((performance.now() - startTime).toFixed(2));

  return {
    id: reportId,
    timestamp,
    inputPrompt: rawPrompt,
    sanitizedPrompt: piiResult.sanitizedText,
    verdict,
    overallRisk,
    blockReason,
    totalLatencyMs,
    tokenCount,
    stages: {
      heuristic: heuristicResult,
      injection: injectionResult,
      pii: piiResult,
      semantic: semanticResult,
      output: outputResult,
    },
    stageMetrics,
    simulatedResponse: finalResponse,
    policyUsed: policy,
  };
}
