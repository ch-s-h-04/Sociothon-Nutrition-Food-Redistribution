import React, { useEffect, useState } from 'react';
import { Award, CheckCircle2, ShieldCheck, Trophy } from 'lucide-react';
import type { ProviderLeaderboardEntry } from '../types';
import { api } from '../utils/api';

type LeaderboardResponse = {
  providers: ProviderLeaderboardEntry[];
  methodology: { reliability: number; ngo_rating: number; safety: number; handover: number; verification: number; principle: string };
};

const badgeStyle: Record<ProviderLeaderboardEntry['badge'], string> = {
  Gold: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Silver: 'bg-slate-300/10 text-slate-200 border-slate-300/25',
  Bronze: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  Verified: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
};

export const ProviderLeaderboard: React.FC = () => {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.providers.getLeaderboard()
      .then(setData)
      .catch((error) => console.error('Failed to load provider leaderboard:', error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-sm text-slate-400">Loading provider leaderboard…</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <section className="rounded-3xl border border-amber-500/25 bg-gradient-to-br from-amber-950/45 via-slate-900 to-emerald-950/35 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="w-12 h-12 shrink-0 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-amber-300" />
          </div>
          <div className="space-y-2">
            <span className="text-[11px] font-mono font-bold text-amber-300 tracking-wider">PROVIDER IMPACT & TRUST PASSPORT</span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Food Recovery Partner Leaderboard</h1>
            <p className="max-w-3xl text-sm leading-relaxed text-slate-300">
              Recognising restaurants, canteens, and caterers that make safe, dependable food recovery possible for NGOs. Rank is based on trustworthy operations—not donation size.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
        <div className="flex items-start gap-3 mb-5">
          <ShieldCheck className="w-5 h-5 mt-0.5 text-emerald-400 shrink-0" />
          <div>
            <h2 className="font-bold text-white">How the Trust Score is calculated</h2>
            <p className="text-xs text-slate-400 mt-1">{data?.methodology.principle}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {[
            ['Reliability', data?.methodology.reliability, 'Punctuality and cancellation record'],
            ['NGO ratings', data?.methodology.ngo_rating, 'Post-handover recipient feedback'],
            ['Food safety', data?.methodology.safety, 'Quality confidence of logged surplus'],
            ['Safe handovers', data?.methodology.handover, 'Resolved collections delivered to NGOs'],
            ['Verification', data?.methodology.verification, 'Completed handovers, capped at four']
          ].map(([label, weight, detail]) => (
            <div key={String(label)} className="rounded-xl bg-slate-800/65 border border-slate-700/70 p-3">
              <div className="flex justify-between gap-2"><span className="font-bold text-slate-200">{label}</span><span className="text-emerald-400 font-mono">{weight}%</span></div>
              <p className="text-[10px] leading-relaxed text-slate-500 mt-1">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900 shadow-xl">
        <div className="px-5 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-white flex items-center gap-2"><Award className="w-5 h-5 text-amber-400" /> Verified Providers</h2>
          <span className="text-xs font-mono text-slate-400">{data?.providers.length ?? 0} partners</span>
        </div>
        <div className="divide-y divide-slate-800">
          {data?.providers.map((provider) => (
            <article key={provider.provider_id} className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4 hover:bg-slate-800/35 transition-colors">
              <div className="flex items-center gap-3 min-w-0 lg:w-[40%]">
                <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-black ${provider.rank <= 3 ? 'bg-amber-500/15 text-amber-300 border border-amber-500/25' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                  #{provider.rank}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-white truncate">{provider.provider_name}</h3>
                  <p className="text-xs text-slate-400 truncate">{provider.provider_type} · {provider.district}, {provider.state}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 lg:flex-1 text-center text-xs">
                <div><span className="block text-lg font-black text-emerald-300">{provider.reliability_score}</span><span className="text-slate-500">Reliability</span></div>
                <div><span className="block text-lg font-black text-cyan-300">{provider.ngo_rating ? `${provider.ngo_rating}/5` : '—'}</span><span className="text-slate-500">NGO rating</span></div>
                <div><span className="block text-lg font-black text-violet-300">{provider.verified_handovers}</span><span className="text-slate-500">Handovers</span></div>
              </div>

              <div className="flex items-center justify-between lg:justify-end gap-3 lg:w-44">
                <span className={`px-2.5 py-1 rounded-full border text-[11px] font-bold ${badgeStyle[provider.badge]}`}>{provider.badge}</span>
                <div className="text-right"><span className="block text-2xl font-black text-white">{provider.trust_score}</span><span className="text-[10px] text-slate-500">TRUST / 100</span></div>
              </div>
            </article>
          ))}
          {!data?.providers.length && <div className="p-10 text-center text-sm text-slate-400">No active food providers yet.</div>}
        </div>
      </section>

      <p className="text-center text-[11px] text-slate-500 flex justify-center items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Scores update from verified platform records as collections are completed.</p>
    </div>
  );
};
