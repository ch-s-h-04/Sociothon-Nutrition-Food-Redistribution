import React, { useEffect, useState } from 'react';
import { CheckCircle2, HeartHandshake, MapPin, Plus, Users, X } from 'lucide-react';
import { MatchCandidate, MatchingResult, RecipientNGO, SurplusEvent } from '../types';
import { api } from '../utils/api';

interface SmartMatchingProps { surplusListings: SurplusEvent[]; selectedSurplusId?: string; onSelectSurplusId: (id: string) => void; onReservationCreated: () => Promise<void>; }

export const SmartMatching: React.FC<SmartMatchingProps> = ({ surplusListings, selectedSurplusId, onSelectSurplusId, onReservationCreated }) => {
  const [activeListingId, setActiveListingId] = useState(selectedSurplusId || surplusListings[0]?.id || '');
  const [matchResult, setMatchResult] = useState<MatchingResult | null>(null);
  const [ngos, setNgos] = useState<RecipientNGO[]>([]);
  const [loading, setLoading] = useState(false);
  const [reservingId, setReservingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const loadNGOs = async () => setNgos(await api.entities.getNGOs());
  const runMatching = async (eventId: string) => {
    if (!eventId) return;
    setLoading(true);
    try { setMatchResult(await api.matching.recommend(eventId)); }
    catch (err: any) { setMessage(err.message || 'Could not find suitable NGOs.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadNGOs().catch(() => undefined); }, []);
  useEffect(() => { if (selectedSurplusId && selectedSurplusId !== activeListingId) setActiveListingId(selectedSurplusId); }, [selectedSurplusId]);
  useEffect(() => { if (!activeListingId && surplusListings[0]) setActiveListingId(surplusListings[0].id); }, [surplusListings, activeListingId]);
  useEffect(() => { runMatching(activeListingId); }, [activeListingId]);

  const selectDonation = (id: string) => { setActiveListingId(id); onSelectSurplusId(id); setMessage(null); };
  const reserve = async (candidate: MatchCandidate) => {
    try {
      setReservingId(candidate.ngo.id);
      const delivery = await api.deliveries.reserve({ surplus_id: activeListingId, ngo_id: candidate.ngo.id });
      setMessage(`${candidate.ngo.name} reserved this food donation. Reference: ${delivery.id}`);
      await Promise.all([loadNGOs(), onReservationCreated()]);
    } catch (err: any) { setMessage(err.message || 'Reservation could not be completed.'); }
    finally { setReservingId(null); }
  };

  const registerNGO = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = (name: string) => String(form.get(name) || '').trim();
    const list = (name: string) => value(name).split(',').map(item => item.trim()).filter(Boolean);
    try {
      setIsRegistering(true); setRegistrationError(null);
      const ngo = await api.entities.createNGO({
        name: value('name'), contact_person: value('contact_person'), contact_phone: value('contact_phone'), address: value('address'), district: value('district'), state: value('state'),
        latitude: Number(value('latitude')), longitude: Number(value('longitude')), daily_capacity_meals: Number(value('daily_capacity_meals')), service_radius_km: Number(value('service_radius_km') || 15),
        accepted_food_types: list('accepted_food_types'), accepted_dietary_types: list('accepted_dietary_types'), target_demographics: list('target_demographics')
      });
      setShowRegistration(false); setMessage(`${ngo.name} is now registered and can reserve available food.`);
      await Promise.all([loadNGOs(), runMatching(activeListingId)]);
    } catch (err: any) { setRegistrationError(err.message || 'Registration failed.'); }
    finally { setIsRegistering(false); }
  };

  const activeListing = surplusListings.find(item => item.id === activeListingId);
  const eligible = matchResult?.candidates.filter(candidate => candidate.feasible) || [];
  return <div className="space-y-6">
    <section className="rounded-2xl border border-emerald-500/25 bg-gradient-to-r from-emerald-950/50 to-slate-900 p-6"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-400">NGO food recovery portal</p><h1 className="mt-1 text-2xl font-black text-white">Find food. Reserve it. Serve your community.</h1><p className="mt-2 max-w-2xl text-sm text-slate-300">Choose an available donation, see eligible NGOs, and reserve it in one step.</p></div><button onClick={() => { setRegistrationError(null); setShowRegistration(true); }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400"><Plus className="w-4 h-4" /> Register NGO</button></div></section>
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><div className="mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-emerald-400" /><div><h2 className="font-bold text-white">Registered NGOs</h2><p className="text-xs text-slate-400">{ngos.length} organizations currently available to receive food.</p></div></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{ngos.map(ngo => <article key={ngo.id} className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"><h3 className="font-bold text-white">{ngo.name}</h3><p className="mt-1 flex items-center gap-1 text-xs text-slate-400"><MapPin className="w-3.5 h-3.5" /> {ngo.district}, {ngo.state}</p><p className="mt-3 text-xs text-emerald-400">Can serve {ngo.current_capacity_meals} meals today</p><p className="mt-2 text-xs text-slate-400">{ngo.target_demographics?.join(' · ') || 'Community beneficiaries'}</p></article>)}</div></section>
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><h2 className="font-bold text-white">Available food donations</h2><p className="mt-1 text-xs text-slate-400">Select a food provider to find compatible recipient NGOs.</p></div><select value={activeListingId} onChange={event => selectDonation(event.target.value)} className="field max-w-md"><option value="">Select a donation</option>{surplusListings.filter(item => item.status === 'available').map(item => <option key={item.id} value={item.id}>{item.donor_name} — {item.quantity_meals} meals, {item.pickup_district}</option>)}</select></div>{activeListing && <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 rounded-xl bg-slate-950/70 p-4 text-sm text-slate-300"><span className="font-bold text-white">{activeListing.donor_name}</span><span>{activeListing.quantity_meals} meals</span><span className="capitalize">{activeListing.food_type} · {activeListing.dietary_type}</span><span>{activeListing.pickup_district}, {activeListing.pickup_state}</span></div>}</section>
    {message && <div className="flex items-center gap-2 rounded-xl border border-emerald-500/35 bg-emerald-500/10 p-4 text-sm text-emerald-200"><CheckCircle2 className="w-5 h-5 shrink-0" /> {message}</div>}
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><div className="mb-4 flex items-center gap-2"><HeartHandshake className="w-5 h-5 text-emerald-400" /><div><h2 className="font-bold text-white">Eligible NGOs</h2><p className="text-xs text-slate-400">Matching checks food acceptance, available capacity, storage, distance, and safe collection time.</p></div></div>{loading ? <p className="py-8 text-center text-sm text-slate-400">Finding eligible NGOs…</p> : eligible.length === 0 ? <p className="rounded-xl bg-slate-950/60 p-4 text-sm text-slate-400">Select an available donation to see eligible NGOs.</p> : <div className="grid gap-3 md:grid-cols-2">{eligible.map(candidate => <article key={candidate.ngo.id} className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-white">{candidate.ngo.name}</h3><p className="mt-1 text-xs text-slate-400">{candidate.ngo.district}, {candidate.ngo.state} · {candidate.ngo.current_capacity_meals} meals open</p></div><span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-bold text-emerald-300">Good match</span></div><p className="mt-3 text-xs text-slate-400">{candidate.nutrition_insights.food_synergy_note}</p><button disabled={reservingId !== null} onClick={() => reserve(candidate)} className="mt-4 w-full rounded-xl bg-emerald-500 px-3 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-60">{reservingId === candidate.ngo.id ? 'Reserving…' : 'Reserve food donation'}</button></article>)}</div>}</section>
    {showRegistration && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/75 p-4" role="dialog" aria-modal="true"><form onSubmit={registerNGO} className="my-8 w-full max-w-3xl rounded-2xl border border-emerald-500/35 bg-slate-900 p-6 shadow-2xl"><div className="mb-5 flex items-start justify-between"><div><h2 className="text-xl font-black text-white">Register your NGO</h2><p className="mt-1 text-xs text-slate-400">Share only the details needed to receive food donations.</p></div><button type="button" onClick={() => setShowRegistration(false)} className="rounded-lg p-2 text-slate-300 hover:bg-slate-800"><X /></button></div>{registrationError && <p className="mb-4 rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">{registrationError}</p>}<div className="grid gap-4 sm:grid-cols-2"><input required name="name" placeholder="Organization name *" className="field" /><input required name="contact_person" placeholder="Contact person *" className="field" /><input required name="contact_phone" placeholder="Phone number *" className="field" /><input required name="address" placeholder="Service address *" className="field" /><input required name="district" placeholder="District *" className="field" /><input required name="state" placeholder="State *" className="field" /><input required type="number" step="any" name="latitude" placeholder="Latitude *" className="field" /><input required type="number" step="any" name="longitude" placeholder="Longitude *" className="field" /><input required min="1" type="number" name="daily_capacity_meals" placeholder="Daily meal capacity *" className="field" /><input min="1" type="number" name="service_radius_km" placeholder="Service radius in km (default 15)" className="field" /><input name="accepted_food_types" defaultValue="cooked meals, rice, bread" placeholder="Accepted food types (comma-separated)" className="field sm:col-span-2" /><input name="accepted_dietary_types" defaultValue="vegetarian, mixed" placeholder="Dietary preferences (comma-separated)" className="field sm:col-span-2" /><input name="target_demographics" placeholder="Beneficiary groups (comma-separated)" className="field sm:col-span-2" /></div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setShowRegistration(false)} className="rounded-xl border border-slate-600 px-4 py-2 text-xs font-bold text-slate-200">Cancel</button><button disabled={isRegistering} className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 disabled:opacity-60">{isRegistering ? 'Registering…' : 'Register NGO'}</button></div></form></div>}
  </div>;
};
