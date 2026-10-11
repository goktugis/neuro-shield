import { useState } from 'react';
import {
  Cpu,
  CheckCircle2,
  XCircle,
  CreditCard,
  Hash,
  Binary,
  Lightbulb,
} from 'lucide-react';
import { validateTcKimlik } from '../engine/tcKimlikValidator';
import { validateLuhn } from '../engine/luhnValidator';
import { calculateShannonEntropy } from '../engine/entropyAnalyzer';

export const AlgorithmicLab: React.FC = () => {
  // TCKN State
  const [tcInput, setTcInput] = useState('10000000146');
  const tcResult = validateTcKimlik(tcInput);

  // Luhn State
  const [cardInput, setCardInput] = useState('4532012345678910');
  const cardResult = validateLuhn(cardInput);

  // Entropy State
  const [entropyInput, setEntropyInput] = useState('k8#P!9z$Q2@vL1*xM0&yR5^wN3~');
  const entropyVal = calculateShannonEntropy(entropyInput);

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          Algoritmik Doğrulama & Kriptografik Matematik Laboratuvarı
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          NeuroShield motorunun arka planında çalışan deterministik algoritmaları canlı inceleyin ve adım adım doğrulayın.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. TCKN Algoritması */}
        <div className="lg:col-span-6 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Hash className="w-4 h-4 text-emerald-400" />
              1. T.C. Kimlik Numarası Algoritması (NVI Mod 10)
            </h3>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                tcResult.isValid
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                  : 'bg-rose-950/80 text-rose-300 border border-rose-700/60'
              }`}
            >
              {tcResult.isValid ? 'GEÇERLİ TCKN' : 'GEÇERSİZ TCKN'}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={tcInput}
                maxLength={11}
                onChange={(e) => setTcInput(e.target.value.replace(/\D/g, ''))}
                placeholder="11 haneli TCKN girin..."
                className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500/50"
              />
              <button
                type="button"
                onClick={() => setTcInput('10000000146')}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-300 border border-slate-800"
              >
                Geçerli Test No
              </button>
            </div>
            {tcResult.reason && (
              <p className="text-[11px] text-rose-400 font-mono">
                {tcResult.reason}
              </p>
            )}
          </div>

          {/* Matematiksel Basamak Dağılım Tablosu */}
          {tcResult.digitBreakdown && (
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5 text-xs">
              <div className="text-[11px] font-semibold text-slate-300">
                Matematiksel Doğrulama Adımları:
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <div className="text-slate-400">1,3,5,7,9. Toplamı (oddSum):</div>
                  <div className="text-cyan-300 font-bold">{tcResult.digitBreakdown.oddSum}</div>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <div className="text-slate-400">2,4,6,8. Toplamı (evenSum):</div>
                  <div className="text-cyan-300 font-bold">{tcResult.digitBreakdown.evenSum}</div>
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 font-mono text-[11px] space-y-1">
                <div>
                  <span className="text-slate-400">10. Hane Formülü:</span>{' '}
                  <span className="text-slate-300">((oddSum * 7) - evenSum) % 10</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">
                    Hesaplanan: {tcResult.digitBreakdown.calculatedTenth}
                  </span>
                  <span className="text-slate-500">vs</span>
                  <span className="text-slate-200">
                    Gerçek: {tcResult.digitBreakdown.actualTenth}
                  </span>
                  {tcResult.digitBreakdown.calculatedTenth === tcResult.digitBreakdown.actualTenth ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-rose-400 inline" />
                  )}
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 font-mono text-[11px] space-y-1">
                <div>
                  <span className="text-slate-400">11. Hane Formülü:</span>{' '}
                  <span className="text-slate-300">(İlk 10 Hane Toplamı) % 10</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">
                    Hesaplanan: {tcResult.digitBreakdown.calculatedEleventh}
                  </span>
                  <span className="text-slate-500">vs</span>
                  <span className="text-slate-200">
                    Gerçek: {tcResult.digitBreakdown.actualEleventh}
                  </span>
                  {tcResult.digitBreakdown.calculatedEleventh === tcResult.digitBreakdown.actualEleventh ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-rose-400 inline" />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Luhn Kredi Kartı Algoritması */}
        <div className="lg:col-span-6 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-cyan-400" />
              2. Luhn Algoritması (ISO/IEC 7812 Mod 10)
            </h3>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                cardResult.isValid
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                  : 'bg-rose-950/80 text-rose-300 border border-rose-700/60'
              }`}
            >
              {cardResult.isValid ? `GEÇERLİ (${cardResult.brand})` : 'GEÇERSİZ KART'}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={cardInput}
                maxLength={19}
                onChange={(e) => setCardInput(e.target.value.replace(/[\s-]/g, ''))}
                placeholder="Kart numarası girin..."
                className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500/50"
              />
              <button
                type="button"
                onClick={() => setCardInput('4532012345678910')}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-300 border border-slate-800"
              >
                Test Kartı
              </button>
            </div>
            {cardResult.reason && (
              <p className="text-[11px] text-rose-400 font-mono">
                {cardResult.reason}
              </p>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5 text-xs font-mono">
            <div className="text-[11px] font-semibold text-slate-300 font-sans">
              Luhn Doğrulama Matematiği:
            </div>
            <div className="p-2 rounded bg-slate-900/60 border border-slate-800 space-y-1 text-[11px]">
              <div>
                <span className="text-slate-400">Kart Şeması:</span>{' '}
                <span className="text-cyan-300 font-bold">{cardResult.brand}</span>
              </div>
              <div>
                <span className="text-slate-400">Sağdan Sola Katlama Toplamı:</span>{' '}
                <span className="text-emerald-300 font-bold">{cardResult.checksumSum}</span>
              </div>
              <div>
                <span className="text-slate-400">Toplam % 10 =</span>{' '}
                <span className="text-emerald-400 font-bold">
                  {cardResult.checksumSum >= 0 ? cardResult.checksumSum % 10 : -1}
                </span>{' '}
                {cardResult.isValid ? '(0 ile tam bölünüyor)' : '(Kalan var, geçersiz!)'}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Shannon Entropi Hesaplayıcı */}
        <div className="lg:col-span-12 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Binary className="w-4 h-4 text-purple-400" />
              3. Shannon Bilgi Entropisi Hesaplayıcı (H(X) = -Σ P(x) log₂ P(x))
            </h3>
            <span className="text-xs font-mono text-purple-300 px-2.5 py-0.5 rounded bg-purple-950/60 border border-purple-800/60 font-bold">
              {entropyVal} bits / karakter
            </span>
          </div>

          <div className="space-y-2">
            <textarea
              value={entropyInput}
              rows={3}
              onChange={(e) => setEntropyInput(e.target.value)}
              placeholder="Entropisini ölçmek istediğiniz metni veya anahtarı girin..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500/50 resize-none"
            />
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-purple-950/20 border border-purple-800/40 text-xs text-slate-300">
            <Lightbulb className="w-4 h-4 text-purple-400 shrink-0" />
            <p>
              Doğal diller (Türkçe, İngilizce) tipik olarak <strong>3.2 – 4.3 bits</strong> entropiye sahiptir. Base64, rastgele üretilmiş API anahtarları veya şifrelenmiş zararlı payloadlar ise <strong>4.8 bits</strong> ve üzeri yüksek entropi verir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
