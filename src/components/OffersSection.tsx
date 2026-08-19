import React from 'react';
import { Tag, ArrowRight, Clock, Gift } from 'lucide-react';
import { SpecialOffer } from '../types';

interface OffersSectionProps {
  offers: SpecialOffer[];
  onClaimOffer?: (offer: SpecialOffer) => void;
  onBookTable?: () => void;
}

export const OffersSection: React.FC<OffersSectionProps> = ({ offers, onClaimOffer, onBookTable }) => {
  if (!offers || offers.length === 0) return null;

  const handleClaim = (offer: SpecialOffer) => {
    if (onClaimOffer) {
      onClaimOffer(offer);
    } else if (onBookTable) {
      onBookTable();
    }
  };

  return (
    <section className="py-16 bg-slate-50 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold tracking-wider uppercase mb-2">
              <Gift className="w-3.5 h-3.5" />
              <span>LIMITED TIME PROMOTIONS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
              SPECIAL OFFERS & <span className="text-red-600">COMBOS</span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mt-2 md:mt-0">
            Enjoy maximum value with our specially curated family deals and weekday lunch boxes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-red-300 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.onerror = null;
                    target.src = 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />

                {/* Discount Badge */}
                <span className="absolute top-3 left-3 bg-red-600 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-md tracking-wider">
                  {offer.discountBadge}
                </span>

                {offer.validDays && (
                  <span className="absolute bottom-3 left-3 text-[11px] font-bold text-amber-900 bg-amber-100 backdrop-blur-md px-2.5 py-1 rounded-md border border-amber-300 flex items-center space-x-1 shadow-xs">
                    <Clock className="w-3 h-3 text-amber-700" />
                    <span>{offer.validDays}</span>
                  </span>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 font-serif mb-1 group-hover:text-red-600 transition-colors">
                    {offer.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {offer.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block font-medium">Offer Price</span>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-extrabold text-slate-900">
                        {offer.offerPrice > 0 ? `£${offer.offerPrice.toFixed(2)}` : 'FREE'}
                      </span>
                      {offer.originalPrice && (
                        <span className="text-xs text-slate-400 line-through">
                          £{offer.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    id={`claim-offer-${offer.id}`}
                    onClick={() => handleClaim(offer)}
                    className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5"
                  >
                    <span>Claim Deal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
