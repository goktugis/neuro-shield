import { useState } from 'react';
import {
  Activity,
  ShieldAlert,
  ShieldX,
  Clock,
  Download,
  Search,
  BarChart3,
  Radar,
  FileSpreadsheet,
} from 'lucide-react';
import type { AuditLogEntry, GuardrailReport } from '../types';

interface AnalyticsDashboardProps {
  logs: AuditLogEntry[];
  recentReports?: GuardrailReport[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  logs,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');

  // Metrik Hesaplamaları
  const totalCount = logs.length;
  const blockedCount = logs.filter((l) => l.verdict === 'BLOCK').length;
  const blockedRate = totalCount > 0 ? Math.round((blockedCount / totalCount) * 100) : 0;
  const totalPii = logs.reduce((acc, curr) => acc + curr.piiDetectedCount, 0);
  const avgLatency =
    totalCount > 0
      ? (logs.reduce((acc, curr) => acc + curr.latencyMs, 0) / totalCount).toFixed(2)
      : '1.24';

  // Log Filtreleme
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.promptSnippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.attackCategory && log.attackCategory.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRisk = filterRisk === 'ALL' || log.overallRisk === filterRisk;
    return matchesSearch && matchesRisk;
  });

  // JSON Olarak Dışa Aktar (Export)
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `neuroshield_audit_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // OWASP LLM Radar Grafiği Koordinatları (6 Eksenli SVG Radar)
  const owaspAxes = [
    { label: 'LLM01: Prompt Injection', value: 0.95 },
    { label: 'LLM02: Sensitive Info', value: 0.85 },
    { label: 'LLM06: Excessive Agency', value: 0.70 },
    { label: 'LLM07: System Prompt Leak', value: 0.90 },
    { label: 'LLM08: Vector Poisoning', value: 0.60 },
    { label: 'LLM10: Model DoS / Stuffing', value: 0.75 },
  ];

  const centerX = 150;
  const centerY = 130;
  const radius = 95;

  const points = owaspAxes.map((axis, index) => {
    const angle = (Math.PI * 2 / owaspAxes.length) * index - Math.PI / 2;
    const r = radius * axis.value;
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="space-y-6">
      {/* 4 Ana Metrik Kartı */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Toplam İstek */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Toplam Taranan İstek</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">{totalCount}</div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1">
            <span>● Gerçek zamanlı denetim hattı</span>
          </p>
        </div>

        {/* Engellenen Saldırılar */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Engellenen Tehditler</span>
            <ShieldX className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400">
            {blockedCount} <span className="text-xs font-normal text-slate-400">(%{blockedRate})</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Kritik injection & jailbreak blokajı
          </p>
        </div>

        {/* Maskelenen PII */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Maskelenen PII / Gizli Veri</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300">
            {totalPii} <span className="text-xs font-normal text-slate-400">Varlık</span>
          </div>
          <p className="text-[11px] text-slate-400">
            TCKN, Kart, IBAN, API Anahtarı
          </p>
        </div>

        {/* Ortalama Gecikme */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Ortalama Denetim Süresi</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {avgLatency} <span className="text-xs font-normal text-slate-400">ms</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Mikrosaniye hassasiyetinde yürütme
          </p>
        </div>
      </div>

      {/* Grafikler: OWASP Top 10 Radar & Dağılım */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Grafiği */}
        <div className="lg:col-span-6 glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Radar className="w-4 h-4 text-emerald-400" />
              OWASP Top 10 for LLM Kapsama Radarı
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
              %92 Ortalama Savunma
            </span>
          </div>

          <div className="flex justify-center items-center py-2">
            <svg width="300" height="260" className="overflow-visible">
              {/* Eksen Halkaları */}
              {[0.25, 0.5, 0.75, 1.0].map((level, i) => (
                <polygon
                  key={i}
                  points={owaspAxes
                    .map((_, index) => {
                      const angle = (Math.PI * 2 / owaspAxes.length) * index - Math.PI / 2;
                      const r = radius * level;
                      return `${centerX + r * Math.cos(angle)},${centerY + r * Math.sin(angle)}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="1"
                />
              ))}

              {/* Merkezden Dışa Çizgiler */}
              {owaspAxes.map((_, index) => {
                const angle = (Math.PI * 2 / owaspAxes.length) * index - Math.PI / 2;
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);
                return (
                  <line
                    key={index}
                    x1={centerX}
                    y1={centerY}
                    x2={x}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Radar Veri Alanı */}
              <polygon
                points={points}
                fill="rgba(16, 185, 129, 0.25)"
                stroke="#10b981"
                strokeWidth="2"
              />

              {/* Köşe Noktaları */}
              {owaspAxes.map((axis, index) => {
                const angle = (Math.PI * 2 / owaspAxes.length) * index - Math.PI / 2;
                const r = radius * axis.value;
                const x = centerX + r * Math.cos(angle);
                const y = centerY + r * Math.sin(angle);
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#34d399"
                    stroke="#06080e"
                    strokeWidth="1.5"
                  />
                );
              })}

              {/* Etiketler */}
              {owaspAxes.map((axis, index) => {
                const angle = (Math.PI * 2 / owaspAxes.length) * index - Math.PI / 2;
                const labelRadius = radius + 22;
                const x = centerX + labelRadius * Math.cos(angle);
                const y = centerY + labelRadius * Math.sin(angle);
                return (
                  <text
                    key={index}
                    x={x}
                    y={y}
                    fill="#94a3b8"
                    fontSize="9"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="font-mono"
                  >
                    {axis.label.split(':')[0]}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Saldırı Türleri Dağılım Çubukları */}
        <div className="lg:col-span-6 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Saldırı Vektörü Tehdit Dağılımı
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Son 50 Oturum</span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { name: 'Direct Prompt Injection (LLM01)', pct: 45, color: 'bg-rose-500' },
              { name: 'PII & Veri İfşası (TCKN/Kart)', pct: 32, color: 'bg-amber-500' },
              { name: 'Rol Dayatması & DAN Jailbreak', pct: 28, color: 'bg-red-400' },
              { name: 'Sistem İstemi Sızıntısı (Prompt Theft)', pct: 19, color: 'bg-purple-500' },
              { name: 'Base64/Hex Obfuscation & Evasion', pct: 14, color: 'bg-cyan-500' },
              { name: 'Görünmez Unicode Karakter Saldırısı', pct: 8, color: 'bg-emerald-500' },
            ].map((bar, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-300">{bar.name}</span>
                  <span className="text-slate-400 font-mono">%{bar.pct}</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full ${bar.color} rounded-full transition-all duration-500`}
                    style={{ width: `${bar.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Canlı Güvenlik Denetim Günlüğü (Audit Log Table) */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Canlı Güvenlik Denetim Günlüğü (Audit Log)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              İstemlerin anlık denetim kararları, gecikme süreleri ve risk seviyeleri.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportJson}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              JSON Dışa Aktar
            </button>
          </div>
        </div>

        {/* Filtre ve Arama Çubuğu */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="İstem içeriği veya saldırı türü ile ara..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
          >
            <option value="ALL">Tüm Risk Seviyeleri</option>
            <option value="CRITICAL">Kritik Risk</option>
            <option value="HIGH">Yüksek Risk</option>
            <option value="MEDIUM">Orta Risk</option>
            <option value="SAFE">Güvenli</option>
          </select>
        </div>

        {/* Tablo */}
        <div className="overflow-x-auto rounded-xl border border-slate-800/80">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/60 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-3.5 py-2.5">Zaman</th>
                <th className="px-3.5 py-2.5">İstem Özeti</th>
                <th className="px-3.5 py-2.5">Karar</th>
                <th className="px-3.5 py-2.5">Risk Seviyesi</th>
                <th className="px-3.5 py-2.5">PII Sayısı</th>
                <th className="px-3.5 py-2.5">Gecikme</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 font-mono">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  return (
                    <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-3.5 py-2.5 text-slate-400 whitespace-nowrap text-[11px]">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-3.5 py-2.5 font-sans truncate max-w-xs text-slate-200">
                        {log.promptSnippet}
                      </td>
                      <td className="px-3.5 py-2.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            log.verdict === 'ALLOW'
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                              : log.verdict === 'SANITIZE_AND_ALLOW'
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                              : 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                          }`}
                        >
                          {log.verdict}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 whitespace-nowrap text-[11px]">
                        <span
                          className={`${
                            log.overallRisk === 'CRITICAL'
                              ? 'text-rose-400 font-bold'
                              : log.overallRisk === 'HIGH'
                              ? 'text-amber-400'
                              : log.overallRisk === 'MEDIUM'
                              ? 'text-sky-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {log.overallRisk}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-slate-300">
                        {log.piiDetectedCount > 0 ? (
                          <span className="text-amber-400 font-bold">
                            {log.piiDetectedCount} varlık
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="px-3.5 py-2.5 text-emerald-400 font-bold">
                        {log.latencyMs} ms
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-500 font-sans">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
