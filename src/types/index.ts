export type RiskLevel = 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type PipelineVerdict = 'ALLOW' | 'SANITIZE_AND_ALLOW' | 'BLOCK';

export type PiiStrategy = 'redact' | 'mask' | 'vault';

export type SecuritySensitivity = 'strict' | 'balanced' | 'permissive';

export interface PiiEntity {
  type: 'TCKN' | 'CREDIT_CARD' | 'IBAN' | 'PHONE' | 'EMAIL' | 'API_KEY' | 'JWT' | 'PRIVATE_KEY';
  original: string;
  masked: string;
  vaultId?: string;
  startIndex: number;
  endIndex: number;
  confidence: number;
  metadata?: Record<string, string | number | boolean>;
}

export interface HeuristicStageResult {
  entropy: number; // Shannon entropy in bits
  isHighEntropy: boolean;
  hasInvisibleUnicode: boolean;
  invisibleCharsCount: number;
  detectedEncodings: Array<{ type: 'base64' | 'hex'; decodedSample: string }>;
  tokenStuffingSuspected: boolean;
  passed: boolean;
  details: string[];
}

export interface PromptInjectionStageResult {
  detectedAttacks: Array<{
    category: 'INSTRUCTION_OVERRIDE' | 'ROLEPLAY_JAILBREAK' | 'SYSTEM_PROMPT_LEAK' | 'DELIMITER_INJECTION' | 'INDIRECT_INJECTION' | 'HOSTILE_COMMAND';
    severity: RiskLevel;
    pattern: string;
    descriptionTr: string;
    matchSnippet: string;
  }>;
  confidenceScore: number; // 0 to 1
  isJailbreak: boolean;
  passed: boolean;
}

export interface PiiStageResult {
  entities: PiiEntity[];
  sanitizedText: string;
  vaultedCount: number;
  passed: boolean;
}

export interface SemanticThreatStageResult {
  topThreatCategory: string;
  threatSimilarityScore: number; // 0 to 1
  toxicityScore: number; // 0 to 1
  flaggedVectors: string[];
  passed: boolean;
}

export interface OutputGuardStageResult {
  leakedCanaryTokens: string[];
  hasDangerousCode: boolean;
  sanitizedOutputText: string;
  passed: boolean;
}

export interface StageExecutionMetric {
  stageId: 'heuristic' | 'injection' | 'pii' | 'semantic' | 'output';
  nameTr: string;
  durationMs: number;
  status: 'passed' | 'warning' | 'blocked';
  messageTr: string;
}

export interface GuardrailReport {
  id: string;
  timestamp: string;
  inputPrompt: string;
  sanitizedPrompt: string;
  verdict: PipelineVerdict;
  overallRisk: RiskLevel;
  blockReason?: string;
  totalLatencyMs: number;
  tokenCount: number;
  stages: {
    heuristic: HeuristicStageResult;
    injection: PromptInjectionStageResult;
    pii: PiiStageResult;
    semantic: SemanticThreatStageResult;
    output?: OutputGuardStageResult;
  };
  stageMetrics: StageExecutionMetric[];
  simulatedResponse: string;
  policyUsed: SecurityPolicy;
}

export interface SecurityPolicy {
  name: string;
  sensitivity: SecuritySensitivity;
  entropyThreshold: number; // e.g. 4.8
  maxTokenLimit: number; // e.g. 2048
  piiStrategy: PiiStrategy;
  enabledStages: {
    heuristic: boolean;
    injection: boolean;
    pii: boolean;
    semantic: boolean;
    output: boolean;
  };
  customBlacklist: string[];
  customWhitelist: string[];
  systemCanaryToken: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  promptSnippet: string;
  verdict: PipelineVerdict;
  overallRisk: RiskLevel;
  attackCategory?: string;
  piiDetectedCount: number;
  latencyMs: number;
}

export interface AttackPreset {
  id: string;
  titleTr: string;
  category: string;
  riskLevel: RiskLevel;
  descriptionTr: string;
  prompt: string;
}
