import { useState } from 'react';
import {
  Sliders,
  Shield,
  Lock,
  Plus,
  Trash2,
  Download,
  Upload,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import type { SecurityPolicy, PiiStrategy, SecuritySensitivity } from '../types';
import { DEFAULT_SECURITY_POLICY } from '../engine/guardrailPipeline';

interface PolicyStudioProps {
  policy: SecurityPolicy;
  onPolicyChange: (newPolicy: SecurityPolicy) => void;
}

export const PolicyStudio: React.FC<PolicyStudioProps> = ({
  policy,
  onPolicyChange,
}) => {
  const [newBlacklistWord, setNewBlacklistWord] = useState('');
  const [saveFeedback, setSaveFeedback] = useState(false);

  const handleSensitivityChange = (sens: SecuritySensitivity) => {
    let entropyThresh = 4.85;
    if (sens === 'strict') entropyThresh = 4.5;
    if (sens === 'permissive') entropyThresh = 5.4;

    onPolicyChange({
      ...policy,
      sensitivity: sens,
      entropyThreshold: entropyThresh,
    });
  };

  const handleToggleStage = (stageKey: keyof SecurityPolicy['enabledStages']) => {
    onPolicyChange({
      ...policy,
      enabledStages: {
        ...policy.enabledStages,
        [stageKey]: !policy.enabledStages[stageKey],
      },
    });
  };

  const handleStrategyChange = (strat: PiiStrategy) => {
    onPolicyChange({
      ...policy,
      piiStrategy: strat,
    });
  };

  const handleAddBlacklistWord = () => {
    if (!newBlacklistWord.trim()) return;
    if (!policy.customBlacklist.includes(newBlacklistWord.trim())) {
      onPolicyChange({
        ...policy,
        customBlacklist: [...policy.customBlacklist, newBlacklistWord.trim()],
      });
    }
    setNewBlacklistWord('');
  };

  const handleRemoveBlacklistWord = (word: string) => {
    onPolicyChange({
      ...policy,
      customBlacklist: policy.customBlacklist.filter((w) => w !== word),
    });
  };

  const handleExportPolicy = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(policy, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `neuroshield_policy_${policy.name.toLowerCase().replace(/\s+/g, '_')}.json`;
    a.click();
  };

  const handleImportPolicy = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.enabledStages && parsed.piiStrategy) {
          onPolicyChange(parsed);
          setSaveFeedback(true);
          setTimeout(() => setSaveFeedback(false), 2000);
        }
      } catch (err) {
        alert('Geçersiz JSON politika dosyası!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Üst Başlık & Kaydet / Dışa Aktar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            Güvenlik Politikası & Kural Yapılandırıcı (Policy Studio)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Kurumsal Zero-Trust LLM kurallarınızı, hassasiyet eşiklerini ve maskeleme modellerini özelleştirin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveFeedback && (
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-1 rounded-lg">
              ✓ Politika Yüklendi
            </span>
          )}
          <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium transition-all flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            İçe Aktar (JSON)
            <input type="file" accept=".json" onChange={handleImportPolicy} className="hidden" />
          </label>

          <button
            type="button"
            onClick={handleExportPolicy}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Dışa Aktar (JSON)
          </button>

          <button
            type="button"
            onClick={() => onPolicyChange(DEFAULT_SECURITY_POLICY)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all"
            title="Varsayılana Sıfırla"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Ana Yapılandırma Kartları */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sol Sütun: Hassasiyet & Katman Kontrolleri */}
        <div className="lg:col-span-6 space-y-6">
          {/* Hassasiyet Profili */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Savunma Hassasiyet Profili
            </h3>
            <p className="text-xs text-slate-400">
              Uygulamanızın güvenlik önceliğine göre koruma modunu belirleyin:
            </p>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { id: 'strict' as SecuritySensitivity, label: 'Sıkı (Strict)', desc: 'Sıfır tolerans, görünmez karakter engeli' },
                { id: 'balanced' as SecuritySensitivity, label: 'Dengeli', desc: 'Standart kurumsal güvenlik dengesi' },
                { id: 'permissive' as SecuritySensitivity, label: 'Esnek', desc: 'Yalnızca kritik saldırıları engeller' },
              ].map((item) => {
                const isSelected = policy.sensitivity === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSensitivityChange(item.id)}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-200">{item.label}</div>
                    <div className="text-[10px] text-slate-400 mt-1 leading-snug">{item.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aktif Katman Anahtarları */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Aktif Savunma Katmanları (Pipeline Toggle)
            </h3>

            <div className="space-y-2 pt-1">
              {[
                { key: 'heuristic' as const, name: '1. Katman: Heuristik & Shannon Entropi', desc: 'Şifreli veri, görünmez karakter ve DoS analizi' },
                { key: 'injection' as const, name: '2. Katman: Prompt Injection & Jailbreak', desc: 'OWASP LLM01, DAN ve talimat ezme kalıpları' },
                { key: 'pii' as const, name: '3. Katman: KVKK & GDPR PII Maskeleme', desc: 'TCKN, Kredi Kartı, Telefon, E-posta ve API anahtarları' },
                { key: 'semantic' as const, name: '4. Katman: Semantik Tehdit & Toksisite', desc: 'Vektör benzerliği ve siber istismar sınıflandırması' },
                { key: 'output' as const, name: '5. Katman: Çıktı Koruma & Canary Token', desc: 'Model yanıtında gizli belirteç ve zararlı kod denetimi' },
              ].map((stage) => {
                const isEnabled = policy.enabledStages[stage.key];
                return (
                  <div
                    key={stage.key}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{stage.name}</div>
                      <div className="text-[11px] text-slate-400">{stage.desc}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleStage(stage.key)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        isEnabled ? 'bg-emerald-500' : 'bg-slate-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sağ Sütun: PII Stratejisi & Özel Kara Liste */}
        <div className="lg:col-span-6 space-y-6">
          {/* PII Maskeleme Stratejisi */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              KVKK / PII Maskeleme & Dönüşüm Modu
            </h3>
            <p className="text-xs text-slate-400">
              Yakalanan hassas verilerin istem üzerinde nasıl dönüştürüleceğini seçin:
            </p>

            <div className="space-y-2 pt-1">
              {[
                {
                  id: 'mask' as PiiStrategy,
                  title: 'Kısmi Yıldızlı Maskeleme (Önerilen)',
                  example: '123*****789 | 4532 **** **** 1234',
                  desc: 'Hata ayıklamaya olanak tanır, veri kimliğini korur.',
                },
                {
                  id: 'redact' as PiiStrategy,
                  title: 'Tam Redaksiyon (Kör Sansür)',
                  example: '[REDACTED_TCKN] | [REDACTED_CREDIT_CARD]',
                  desc: 'Veriyi tamamen kaldırır, en sıkı uyumluluk modudur.',
                },
                {
                  id: 'vault' as PiiStrategy,
                  title: 'Geri Dönüştürülebilir Şifreli Kasa (Vault)',
                  example: '[TOKEN:NS-VAULT-TCKN-9a4f21]',
                  desc: 'Orijinal veriyi oturum kasasında saklar, modelden gizler.',
                },
              ].map((strat) => {
                const isSelected = policy.piiStrategy === strat.id;
                return (
                  <div
                    key={strat.id}
                    onClick={() => handleStrategyChange(strat.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">{strat.title}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                    </div>
                    <div className="text-[11px] font-mono text-amber-300/80 mt-1">
                      Örnek: {strat.example}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{strat.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Özel Kara Liste (Blacklist Tag Manager) */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-400" />
              Özel Anahtar Kelime Kara Listesi (Blacklist)
            </h3>
            <p className="text-xs text-slate-400">
              Şirketinize veya projenize özel yasaklı terimleri ekleyin. Bu terimleri içeren istemler derhal engellenir:
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={newBlacklistWord}
                onChange={(e) => setNewBlacklistWord(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddBlacklistWord()}
                placeholder="Örn: gizli_proje_kodadi, master_key..."
                className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
              />
              <button
                type="button"
                onClick={handleAddBlacklistWord}
                className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-medium transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Ekle
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2 min-h-16">
              {policy.customBlacklist.length > 0 ? (
                policy.customBlacklist.map((word, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs font-mono"
                  >
                    {word}
                    <button
                      type="button"
                      onClick={() => handleRemoveBlacklistWord(word)}
                      className="text-rose-400 hover:text-rose-200"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">
                  Henüz özel kara liste kuralı eklenmedi.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
