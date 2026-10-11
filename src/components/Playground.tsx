import { useState, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Lock,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { AttackPreset, GuardrailReport, SecurityPolicy } from '../types';
import { ATTACK_PRESETS } from '../data/attackPresets';
import { executeGuardrailPipeline } from '../engine/guardrailPipeline';

interface PlaygroundProps {
  policy: SecurityPolicy;
  onReportGenerated: (report: GuardrailReport) => void;
}

export const Playground: React.FC<PlaygroundProps> = ({
  policy,
  onReportGenerated,
}) => {
  const [prompt, setPrompt] = useState<string>(ATTACK_PRESETS[0].prompt);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(ATTACK_PRESETS[0].id);
  const [report, setReport] = useState<GuardrailReport | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [expandedStage, setExpandedStage] = useState<string | null>('injection');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Sayfa yüklendiğinde varsayılan preset ile ilk çalıştırma
  useEffect(() => {
    handleRunGuardrail(ATTACK_PRESETS[0].prompt);
  }, []);

  const handleRunGuardrail = (customPrompt?: string) => {
    const textToAnalyze = customPrompt !== undefined ? customPrompt : prompt;
    if (!textToAnalyze.trim()) return;

    setIsRunning(true);

    setTimeout(() => {
      const generatedReport = executeGuardrailPipeline(textToAnalyze, policy);
      setReport(generatedReport);
      onReportGenerated(generatedReport);
      setIsRunning(false);

      // Temiz istekte küçük bir kutlama konfetisi
      if (generatedReport.verdict === 'ALLOW') {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#10B981', '#06B6D4', '#3B82F6'],
        });
      }
    }, 120);
  };

  const handleSelectPreset = (preset: AttackPreset) => {
    setSelectedPresetId(preset.id);
    setPrompt(preset.prompt);
    handleRunGuardrail(preset.prompt);
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 1800);
  };

  const getVerdictBadge = (verdict: GuardrailReport['verdict']) => {
    switch (verdict) {
      case 'ALLOW':
        return {
          icon: ShieldCheck,
          text: 'ONAYLANDI (GÜVENLİ)',
          desc: 'İstem tüm güvenlik filtrelerinden başarıyla geçti ve modele iletildi.',
          bg: 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300',
          dot: 'bg-emerald-400',
        };
      case 'SANITIZE_AND_ALLOW':
        return {
          icon: ShieldAlert,
          text: 'ARINDIRILDI & ONAYLANDI',
          desc: 'Hassas veriler (TCKN/Kart/vb.) maskelendi ve güvenli hale getirilerek onaylandı.',
          bg: 'bg-amber-950/60 border-amber-500/50 text-amber-300',
          dot: 'bg-amber-400',
        };
      case 'BLOCK':
        return {
          icon: ShieldX,
          text: 'ENGELENDİ (SALDIRI VEYA İHLAL)',
          desc: 'Kritik Prompt Injection, Jailbreak veya yetkisiz kural aşımı tespit edilerek engellendi.',
          bg: 'bg-rose-950/60 border-rose-500/50 text-rose-300',
          dot: 'bg-rose-400',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Başlık ve Hızlı Hazır Senaryolar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400" />
              Tehdit Simülasyonu & Koruma Laboratuvarı
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Hazır saldırı senaryolarını test edin veya kendi özel isteminizi girerek çok katmanlı savunma hattını canlı gözlemleyin.
            </p>
          </div>
          <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
            <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">
              Kısayol: <kbd className="text-emerald-400 font-semibold">Ctrl + Enter</kbd>
            </span>
          </div>
        </div>

        {/* Saldırı Preset Butonları */}
        <div className="flex flex-wrap gap-2">
          {ATTACK_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    preset.riskLevel === 'CRITICAL'
                      ? 'bg-rose-400'
                      : preset.riskLevel === 'HIGH'
                      ? 'bg-amber-400'
                      : preset.riskLevel === 'MEDIUM'
                      ? 'bg-sky-400'
                      : 'bg-emerald-400'
                  }`}
                />
                {preset.titleTr}
              </button>
            );
          })}
        </div>
      </div>

      {/* İki Sütunlu Ana Gövde: Giriş & Sonuç Paneli */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sol Sütun: Girdi İstem Editörü */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  Girdi İstem (Prompt / Payload)
                </span>
                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                  <span>{prompt.length} Karakter</span>
                  <span>•</span>
                  <span>~{Math.ceil(prompt.length / 4)} Token</span>
                </div>
              </div>

              <textarea
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  setSelectedPresetId('custom');
                }}
                onKeyDown={(e) => {
                  if (e.ctrlKey && e.key === 'Enter') {
                    handleRunGuardrail();
                  }
                }}
                rows={9}
                placeholder="Test etmek istediğiniz girdiyi veya saldırı yükünü buraya yazın..."
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-all resize-none"
              />
            </div>

            <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  setPrompt('');
                  setSelectedPresetId('custom');
                }}
                className="px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Temizle
              </button>

              <button
                type="button"
                onClick={() => handleRunGuardrail()}
                disabled={isRunning || !prompt.trim()}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRunning ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    Analiz Ediliyor...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Güvenlik Duvarını Çalıştır
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Sağ Sütun: Karar ve Pipeline Telemetrisi */}
        <div className="lg:col-span-7 space-y-4">
          {report ? (
            <>
              {/* Nihai Karar Kartı */}
              {(() => {
                const badge = getVerdictBadge(report.verdict);
                const Icon = badge.icon;
                return (
                  <div className={`p-4 rounded-2xl border ${badge.bg} transition-all`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-slate-950/40 border border-current">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm tracking-wide">
                              {badge.text}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950/60 border border-slate-700 text-slate-300">
                              Risk: {report.overallRisk}
                            </span>
                          </div>
                          <p className="text-xs mt-1 text-slate-300">
                            {report.blockReason || badge.desc}
                          </p>
                        </div>
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {report.totalLatencyMs} ms
                        </span>
                        <div className="text-[10px] text-slate-400">Toplam Gecikme</div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 5 Aşamalı Güvenlik Savunma Hattı (Pipeline Inspector) */}
              <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    5 Aşamalı Savunma Hattı Telemetrisi
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    5/5 Katman Aktif
                  </span>
                </div>

                {report.stageMetrics.map((stage) => {
                  const isExpanded = expandedStage === stage.stageId;
                  const isPassed = stage.status === 'passed';
                  const isBlocked = stage.status === 'blocked';

                  return (
                    <div
                      key={stage.stageId}
                      className="rounded-xl border border-slate-800/90 bg-slate-950/60 overflow-hidden transition-all"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedStage(isExpanded ? null : stage.stageId)
                        }
                        className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-slate-900/50 transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          {isPassed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : isBlocked ? (
                            <XCircle className="w-4 h-4 text-rose-400" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                          )}
                          <div>
                            <span className="text-xs font-semibold text-slate-200">
                              {stage.nameTr}
                            </span>
                            <p className="text-[11px] text-slate-400 truncate max-w-sm sm:max-w-md">
                              {stage.messageTr}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-mono text-slate-400">
                            {stage.durationMs}ms
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {/* Katman İçi Detay Açılır Panel */}
                      {isExpanded && (
                        <div className="px-3.5 py-3 border-t border-slate-800/80 bg-slate-900/40 text-xs text-slate-300 space-y-2">
                          {stage.stageId === 'heuristic' && (
                            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                              <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
                                <span className="text-slate-400">Shannon Entropi:</span>{' '}
                                <span className="text-cyan-300 font-bold">
                                  {report.stages.heuristic.entropy} bits
                                </span>
                              </div>
                              <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
                                <span className="text-slate-400">Görünmez Karakter:</span>{' '}
                                <span className="text-emerald-300 font-bold">
                                  {report.stages.heuristic.invisibleCharsCount} adet
                                </span>
                              </div>
                            </div>
                          )}

                          {stage.stageId === 'injection' && (
                            <div>
                              {report.stages.injection.detectedAttacks.length > 0 ? (
                                <div className="space-y-1.5">
                                  {report.stages.injection.detectedAttacks.map((att, i) => (
                                    <div
                                      key={i}
                                      className="p-2 rounded bg-rose-950/30 border border-rose-800/40 text-[11px] space-y-1"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="font-bold text-rose-300">
                                          {att.category}
                                        </span>
                                        <span className="px-1.5 py-0.5 rounded bg-rose-900/50 text-rose-300 text-[9px] uppercase font-mono">
                                          {att.severity}
                                        </span>
                                      </div>
                                      <p className="text-slate-300">{att.descriptionTr}</p>
                                      <p className="font-mono text-[10px] text-slate-400 bg-slate-950/60 p-1 rounded">
                                        Eşleşen: "{att.matchSnippet}"
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-emerald-400 text-xs">
                                  ✓ Hiçbir OWASP LLM01 Prompt Injection veya Jailbreak kalıbı eşleşmedi.
                                </p>
                              )}
                            </div>
                          )}

                          {stage.stageId === 'pii' && (
                            <div>
                              {report.stages.pii.entities.length > 0 ? (
                                <div className="space-y-1.5">
                                  <div className="text-[11px] font-semibold text-slate-300">
                                    Yakalanan Hassas Varlıklar:
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {report.stages.pii.entities.map((ent, i) => (
                                      <span
                                        key={i}
                                        className="px-2 py-1 rounded bg-amber-950/40 border border-amber-700/50 text-amber-300 text-[10px] font-mono flex items-center gap-1"
                                      >
                                        <Lock className="w-2.5 h-2.5" />
                                        {ent.type}: {ent.masked}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-emerald-400 text-xs">
                                  ✓ Açıkta TCKN, Kredi Kartı, Telefon veya API Anahtarı bulunamadı.
                                </p>
                              )}
                            </div>
                          )}

                          {stage.stageId === 'semantic' && (
                            <div className="space-y-1 text-[11px]">
                              <div>
                                <span className="text-slate-400">Baskın Tehdit Kümesi:</span>{' '}
                                <span className="font-semibold text-slate-200">
                                  {report.stages.semantic.topThreatCategory}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400">Vektör Benzerlik Skoru:</span>{' '}
                                <span className="font-mono text-cyan-300">
                                  %{Math.round(report.stages.semantic.threatSimilarityScore * 100)}
                                </span>
                              </div>
                            </div>
                          )}

                          {stage.stageId === 'output' && (
                            <p className="text-emerald-400 text-xs">
                              ✓ Model yanıtında sistem anahtarı veya yetkisiz terminal komutu yok.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Arındırılmış Prompt ve Simüle Edilmiş Güvenli LLM Yanıtı */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Arındırılmış İstem */}
                <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      Arındırılmış İstem (Sanitized)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(report.sanitizedPrompt, 'sanitized')}
                      className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                      title="Kopyala"
                    >
                      {copiedType === 'sanitized' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <div className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-xl text-xs font-mono text-slate-300 max-h-36 overflow-y-auto leading-relaxed">
                    {report.sanitizedPrompt}
                  </div>
                </div>

                {/* Güvenli LLM Yanıtı */}
                <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Simüle Edilmiş Güvenli Yanıt
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(report.simulatedResponse, 'response')}
                      className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                      title="Kopyala"
                    >
                      {copiedType === 'response' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <div
                    className={`p-3 rounded-xl text-xs font-mono max-h-36 overflow-y-auto leading-relaxed border ${
                      report.verdict === 'BLOCK'
                        ? 'bg-rose-950/20 border-rose-800/40 text-rose-300'
                        : 'bg-slate-950/80 border-slate-800/80 text-emerald-300'
                    }`}
                  >
                    {report.simulatedResponse}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-3">
              <Shield className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
              <p className="text-sm font-semibold text-slate-300">
                Analiz Başlatılmayı Bekliyor
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Soldaki panelden bir hazır senaryo seçin veya "Güvenlik Duvarını Çalıştır" butonuna tıklayın.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
