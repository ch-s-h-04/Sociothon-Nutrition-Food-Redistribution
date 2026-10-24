import React, { useState } from 'react';
import { SurplusEvent, SurplusStatus, FoodCategory, DietaryType, StorageRequirement } from '../types';
import { api } from '../utils/api';
import {
  UtensilsCrossed,
  PlusCircle,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ArrowRight,
  ShieldAlert,
  Flame,
  Snowflake,
  Sun
} from 'lucide-react';

interface SurplusManagementProps {
  surplusListings: SurplusEvent[];
  onRefresh: () => void;
  onSelectForMatching: (eventId: string) => void;
  preselectedDistrict?: string;
}

export const SurplusManagement: React.FC<SurplusManagementProps> = ({
  surplusListings,
  onRefresh,
  onSelectForMatching,
  preselectedDistrict
}) => {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [donorName, setDonorName] = useState('Satpura Agro Community Canteen');
  const [pickupAddress, setPickupAddress] = useState('Station Road, Shahada');
  const [pickupDistrict, setPickupDistrict] = useState(preselectedDistrict || 'Nandurbar');
  const [pickupState, setPickupState] = useState('Maharashtra');
  const [latitude, setLatitude] = useState('21.3667');
  const [longitude, setLongitude] = useState('74.2333');
  const [foodType, setFoodType] = useState<FoodCategory>('cooked meals');
  const [dietaryType, setDietaryType] = useState<DietaryType>('vegetarian');
  const [quantityMeals, setQuantityMeals] = useState('60');
  const [storageRequirement, setStorageRequirement] = useState<StorageRequirement>('hot_holding');
  const [hoursUntilExpiry, setHoursUntilExpiry] = useState('2.5');
  const [contactName, setContactName] = useState('Ganesh Shinde');
  const [contactPhone, setContactPhone] = useState('+91 94220 88765');
  const [notes, setNotes] = useState('Freshly prepared dal tadka with fortified rice and local moringa/amaranth greens.');

  const handleCreateSurplus = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const expiryDate = new Date(Date.now() + parseFloat(hoursUntilExpiry) * 3600000).toISOString();
      await api.surplus.create({
        donor_name: donorName,
        pickup_address: pickupAddress,
        pickup_district: pickupDistrict,
        pickup_state: pickupState,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        food_type: foodType,
        dietary_type: dietaryType,
        quantity_meals: parseInt(quantityMeals, 10),
        storage_requirement: storageRequirement,
        expiry_at: expiryDate,
        contact_name: contactName,
        contact_phone: contactPhone,
        notes: notes
      });

      setShowCreateModal(false);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to register surplus');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this surplus listing?')) {
      try {
        await api.surplus.delete(id);
        onRefresh();
      } catch (err) {
        console.error('Failed to delete:', err);
      }
    }
  };

  const filtered = surplusListings.filter(s => {
    if (statusFilter === 'all') return true;
    return s.status === statusFilter;
  });

  const getStorageIcon = (req: StorageRequirement) => {
    switch (req) {
      case 'hot_holding':
        return <span className="flex items-center text-orange-400 gap-1 text-[11px]"><Flame className="w-3.5 h-3.5" /> Hot Holding (&gt;60°C)</span>;
      case 'cold_storage':
        return <span className="flex items-center text-cyan-400 gap-1 text-[11px]"><Snowflake className="w-3.5 h-3.5" /> Cold Storage (&lt;4°C)</span>;
      default:
        return <span className="flex items-center text-slate-400 gap-1 text-[11px]"><Sun className="w-3.5 h-3.5" /> Ambient</span>;
    }
  };

  const getStatusBadge = (status: SurplusStatus) => {
    switch (status) {
      case 'available':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Available</span>;
      case 'matched':
      case 'assigned':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">Assigned</span>;
      case 'in_transit':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">In Transit</span>;
      case 'delivered':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">Redistributed (Edible)</span>;
      case 'diverted_to_compost':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-lime-500/20 text-lime-400 border border-lime-500/30">Diverted to Compost</span>;
      case 'disposed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">Disposed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/20 text-slate-400 border border-slate-500/30">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            SOCIOTHON 2026 · SOURCE SEGREGATION & LOGGING
          </span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Food Surplus Prevention, Segregation & Waste Logging
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Intake portal for campus dining halls, canteens, and catering facilities. Enforces waste segregation, safe storage constraints (hot holding &gt;60°C, cold chain &lt;4°C, ambient), and expiry deadlines.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-xs bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 transition whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Log Surplus Batch</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {['all', 'available', 'assigned', 'in_transit', 'delivered', 'diverted_to_compost', 'disposed'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition ${
              statusFilter === st
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {st.replace(/_/g, ' ')} ({st === 'all' ? surplusListings.length : surplusListings.filter(s => s.status === st).length})
          </button>
        ))}
      </div>

      {/* Surplus Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => {
          const hoursLeft = ((new Date(item.expiry_at).getTime() - Date.now()) / 3600000).toFixed(1);
          return (
            <div
              key={item.id}
              className="bg-slate-900 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-700 transition shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-500">{item.id}</span>
                    <h3 className="font-bold text-base text-white">{item.donor_name || 'Food Donor'}</h3>
                    <p className="text-xs text-slate-400 flex items-center mt-0.5">
                      <MapPin className="w-3 h-3 mr-1 text-slate-500" /> {item.pickup_district}, {item.pickup_state}
                    </p>
                  </div>
                  {getStatusBadge(item.status)}
                </div>

                <div className="mt-4 p-3 rounded-xl bg-slate-800/50 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Available Meals:</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {item.quantity_meals} meals <span className="text-slate-400 text-xs font-normal">({item.food_weight_kg} kg)</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Category & Diet:</span>
                    <span className="font-medium text-slate-200 capitalize">{item.food_type} ({item.dietary_type})</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Storage Required:</span>
                    {getStorageIcon(item.storage_requirement)}
                  </div>
                </div>

                {item.notes && (
                  <p className="text-xs text-slate-400 mt-3 italic line-clamp-2">
                    "{item.notes}"
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Safe Window: {parseFloat(hoursLeft) > 0 ? `${hoursLeft} hrs left` : 'Expired'}
                  </span>
                  <span>Contact: {item.contact_phone}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-slate-500 hover:text-rose-400 transition p-1.5"
                  title="Remove listing"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {item.status === 'available' ? (
                  <button
                    onClick={() => onSelectForMatching(item.id)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 transition"
                  >
                    <span>Match Recipient NGO</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 font-mono">
                    {item.status === 'delivered' ? '✓ Completed' : '→ Processing Delivery'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Registration Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-emerald-400" /> Register Food Surplus Donation
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="my-3 p-3 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {errorMessage}
              </div>
            )}

            <form onSubmit={handleCreateSurplus} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Donor Establishment Name *</label>
                <input
                  type="text"
                  required
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">District *</label>
                  <input
                    type="text"
                    required
                    value={pickupDistrict}
                    onChange={(e) => setPickupDistrict(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={pickupState}
                    onChange={(e) => setPickupState(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Pickup Address *</label>
                <input
                  type="text"
                  required
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Food Category *</label>
                  <select
                    value={foodType}
                    onChange={(e) => setFoodType(e.target.value as FoodCategory)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="cooked meals">Cooked Meals (Dal/Sabzi/Rice)</option>
                    <option value="rice">Rice & Grains</option>
                    <option value="bread">Bread & Rotis</option>
                    <option value="vegetables">Fresh Vegetables & Greens</option>
                    <option value="packaged food">Packaged Food</option>
                    <option value="bakery">Bakery Items</option>
                    <option value="mixed meals">Mixed Meals</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Dietary Classification *</label>
                  <select
                    value={dietaryType}
                    onChange={(e) => setDietaryType(e.target.value as DietaryType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="mixed">Mixed</option>
                    <option value="non_vegetarian">Non-Vegetarian</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Meal Portions *</label>
                  <input
                    type="number"
                    min="5"
                    required
                    value={quantityMeals}
                    onChange={(e) => setQuantityMeals(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    ≈ {(parseInt(quantityMeals || '0', 10) * 0.38).toFixed(1)} kg
                  </span>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Storage Handling</label>
                  <select
                    value={storageRequirement}
                    onChange={(e) => setStorageRequirement(e.target.value as StorageRequirement)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ambient">Ambient</option>
                    <option value="hot_holding">Hot Holding (&gt;60°C)</option>
                    <option value="cold_storage">Cold Storage (&lt;4°C)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Safe Window (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="48"
                    required
                    value={hoursUntilExpiry}
                    onChange={(e) => setHoursUntilExpiry(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Contact Phone *</label>
                  <input
                    type="text"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Food Description / Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/20"
                >
                  {isSubmitting ? 'Registering...' : 'Confirm Surplus Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
