import React from 'react';
import { X, Shield, AlertTriangle, FileText, CheckCircle2, Award, HeartHandshake } from 'lucide-react';
import { RestaurantSettings } from '../types';

export type LegalModalType = 'privacy' | 'terms' | 'allergens' | 'hygiene' | null;

interface LegalModalsProps {
  activeModal: LegalModalType;
  onClose: () => void;
  settings: RestaurantSettings;
}

export const LegalModals: React.FC<LegalModalsProps> = ({ activeModal, onClose, settings }) => {
  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[85vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            {activeModal === 'privacy' && (
              <>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Privacy Policy</h3>
                  <p className="text-xs text-slate-400">UK GDPR & Data Protection Act 2018</p>
                </div>
              </>
            )}

            {activeModal === 'terms' && (
              <>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Terms of Service & Reservation Policy</h3>
                  <p className="text-xs text-slate-400">Dine-in terms, cancellation & guest guidelines</p>
                </div>
              </>
            )}

            {activeModal === 'allergens' && (
              <>
                <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Allergen & Food Safety Advisory</h3>
                  <p className="text-xs text-slate-400">Natasha's Law & FSA Allergen Compliance</p>
                </div>
              </>
            )}

            {activeModal === 'hygiene' && (
              <>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Food Hygiene & Quality Standards</h3>
                  <p className="text-xs text-slate-400">FSA 5-Star Rating & 100% Halal Guarantee</p>
                </div>
              </>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-300">
          {activeModal === 'privacy' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-950/30 border border-blue-800/40 rounded-xl text-blue-300">
                <strong>Data Controller:</strong> {settings.name} Restaurant ({settings.address}, {settings.city} {settings.postcode}). Email: {settings.email}.
              </div>

              <h4 className="text-sm font-bold text-white">1. Information We Collect</h4>
              <p>
                When you make a table reservation or submit an event inquiry, we collect your name, phone number, email address, reservation details (date, time, party size, occasion), and any dietary notes you voluntarily disclose.
              </p>

              <h4 className="text-sm font-bold text-white">2. Lawful Basis & Purpose</h4>
              <p>
                We process this information strictly to manage, confirm, and verify your dining reservations, communicate table status updates, and provide high-quality hospitality service. We do not sell or rent personal information to third-party advertisers.
              </p>

              <h4 className="text-sm font-bold text-white">3. Data Retention & Security</h4>
              <p>
                Your booking records are securely stored and encrypted in transit (HTTPS/TLS). Reservation records are retained only for the duration necessary to satisfy operational and accounting requirements.
              </p>

              <h4 className="text-sm font-bold text-white">4. Your Rights Under UK GDPR</h4>
              <p>
                You have the right to access, rectify, or request deletion of your reservation data at any time by contacting our restaurant manager at <span className="text-white font-medium">{settings.email}</span>.
              </p>
            </div>
          )}

          {activeModal === 'terms' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white">1. Table Reservations & Holding Policy</h4>
              <p>
                To guarantee fair access for all guests, reserved tables are held for a maximum of <strong>15 minutes</strong> past your scheduled reservation time. If your party is delayed, please call us on <span className="text-white font-medium">{settings.phone}</span> immediately so we can preserve your table.
              </p>

              <h4 className="text-sm font-bold text-white">2. Dining Durations</h4>
              <p>
                Standard dining durations are allocated at 90 minutes for parties of 1–4 guests, and 120 minutes for parties of 5+ guests, ensuring comfortable service for subsequent bookings.
              </p>

              <h4 className="text-sm font-bold text-white">3. Cancellations & Rescheduling</h4>
              <p>
                You can manage, reschedule, or cancel your booking at no charge using your unique Booking Reference (`IC-2026-XXXXXX`) via our online Manage Booking portal or by phoning our front-of-house team at least 2 hours in advance.
              </p>

              <h4 className="text-sm font-bold text-white">4. Large Parties & Private Events</h4>
              <p>
                Parties of 8 or more guests may require a deposit during peak festival periods. Private dining hall reservations are governed by specific event agreements.
              </p>
            </div>
          )}

          {activeModal === 'allergens' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-red-950/30 border border-red-800/40 rounded-xl text-red-300">
                <strong>Important Notice:</strong> If you or anyone in your party has a severe food allergy, please notify our team when booking AND inform your server prior to ordering.
              </div>

              <h4 className="text-sm font-bold text-white">1. 14 Major Food Allergens</h4>
              <p>
                In compliance with UK Food Information Regulations and Natasha's Law, we monitor the 14 major allergens: Celery, Cereals containing gluten, Crustaceans, Eggs, Fish, Lupin, Milk, Molluscs, Mustard, Nuts, Peanuts, Sesame seeds, Soya, and Sulphur dioxide.
              </p>

              <h4 className="text-sm font-bold text-white">2. Kitchen Environment & Cross-Contamination</h4>
              <p>
                Our authentic wok dishes are prepared in a fast-paced kitchen where gluten, sesame, soya, and dairy are handled. While our chefs adhere to rigorous sanitation protocols, we cannot guarantee 100% allergen-free environments for airborne traces.
              </p>

              <h4 className="text-sm font-bold text-white">3. Dietary Icons</h4>
              <p>
                All items on our digital menu feature explicit indicators: 🟢 Vegetarian, 🔴 Non-Veg, 🌶️ Spice Level (1–4 peppers), and Halal certification.
              </p>
            </div>
          )}

          {activeModal === 'hygiene' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-emerald-950/40 border border-emerald-800/50 rounded-xl">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-2xl border border-emerald-500/30">
                  5
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Food Hygiene Rating: 5 (Very Good)</h4>
                  <p className="text-slate-400 text-xs">Inspected by the UK Food Standards Agency (FSA)</p>
                </div>
              </div>

              <h4 className="text-sm font-bold text-white">1. 100% Certified Halal Meat</h4>
              <p>
                All chicken, lamb, and meat served across our restaurant is sourced from certified Halal suppliers with complete traceability.
              </p>

              <h4 className="text-sm font-bold text-white">2. Fresh Daily Wok Preparation</h4>
              <p>
                Our sauces, stocks, and dim sum doughs are freshly prepared daily in-house using authentic Himalayan spices, garlic, ginger, and wok hei mastery.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
