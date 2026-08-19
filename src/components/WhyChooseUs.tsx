import React from 'react';
import { Leaf, Flame, Sparkles, HeartHandshake } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const features = [
    {
      icon: Leaf,
      iconColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      title: 'FRESH INGREDIENTS',
      description: 'Prepared daily using carefully selected fresh vegetables, high-grade meats, and aromatic garden herbs.'
    },
    {
      icon: Flame,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      title: 'AUTHENTIC FLAVOURS',
      description: 'Bold Indo-Chinese flavours cooked over high-heat woks inspired by authentic Kolkata Hakka traditions.'
    },
    {
      icon: Sparkles,
      iconColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      title: 'CHEF SPECIALITIES',
      description: 'Signature dishes like Triple Schezwan Rice & Dragon Chicken expertly crafted by our head chef.'
    },
    {
      icon: HeartHandshake,
      iconColor: 'text-rose-700',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      title: 'GREAT DINING EXPERIENCE',
      description: 'A warm, welcoming luxury environment designed for families, social gatherings, and celebrations.'
    }
  ];

  return (
    <section className="py-16 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 font-serif">
            WHY DINERS CHOOSE <span className="text-red-600">INDO CHINESE</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Committed to culinary excellence, fast service, and unforgettable Asian fusion flavours.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-slate-50 p-6 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className={`w-12 h-12 rounded-xl ${item.bgColor} ${item.borderColor} border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${item.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-serif tracking-tight mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
