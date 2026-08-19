import React, { useState } from 'react';
import { Star, MessageSquarePlus, CheckCircle2, ExternalLink, X, Send } from 'lucide-react';
import { Review, RestaurantSettings } from '../types';
import { getApiUrl } from '../utils/api';

interface ReviewsSectionProps {
  reviews?: Review[];
  settings?: RestaurantSettings;
  onReviewSubmitted?: (review: Review) => void;
  onBookTable?: () => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews = [],
  settings,
  onReviewSubmitted,
  onBookTable,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [recommendedDish, setRecommendedDish] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author || !comment) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(getApiUrl('/api/reviews'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, rating, comment, recommendedDish })
      });

      if (!res.ok) throw new Error('Failed to submit review');

      const newReview: Review = await res.json();
      if (onReviewSubmitted) {
        onReviewSubmitted(newReview);
      }
      setModalOpen(false);
      setAuthor('');
      setComment('');
      setRecommendedDish('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="py-20 bg-white border-t border-slate-200 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold tracking-wider uppercase mb-3">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>CUSTOMER TESTIMONIALS</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 font-serif tracking-tight">
              CUSTOMER <span className="text-red-600">REVIEWS</span>
            </h2>
          </div>

          {/* Aggregate Rating Score Card */}
          <div className="mt-4 md:mt-0 flex items-center space-x-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-center border-r border-slate-200 pr-4">
              <span className="text-3xl font-extrabold text-slate-900 font-serif">4.9</span>
              <span className="text-[10px] text-slate-500 block font-bold">OUT OF 5</span>
            </div>
            <div>
              <div className="flex text-amber-500 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <span className="text-xs text-slate-600 font-medium">Based on 248+ verified diners</span>
            </div>
          </div>
        </div>

        {/* Review Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-slate-50 border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    ))}
                  </div>

                  <span className="text-[10px] text-slate-600 font-medium bg-white px-2 py-0.5 rounded border border-slate-200">
                    {rev.source}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans italic mb-4">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200">
                {rev.recommendedDish && (
                  <p className="text-[11px] text-red-600 font-bold mb-2">
                    Dish Recommended: <span className="text-slate-800 font-normal">{rev.recommendedDish}</span>
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-slate-900">{rev.author}</span>
                    {rev.verified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" title="Verified Customer" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">{rev.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            id="read-google-reviews-button"
            href={settings?.googleBusinessProfileUrl || '#'}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-bold transition-all shadow-xs flex items-center space-x-2"
          >
            <span>READ OUR GOOGLE REVIEWS</span>
            <ExternalLink className="w-4 h-4 text-red-600" />
          </a>

          <button
            id="write-review-button"
            onClick={() => setModalOpen(true)}
            className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md flex items-center space-x-2"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>WRITE A REVIEW</span>
          </button>
        </div>

        {/* Write Review Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-slate-800">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-slate-900 font-serif mb-1">Write a Customer Review</h3>
              <p className="text-xs text-slate-600 mb-4">Share your Indo-Chinese dining or takeaway experience.</p>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Rahul Verma"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rating *</label>
                  <div className="flex space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-300">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= rating ? 'fill-amber-500 text-amber-500' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dish You Recommended (Optional)</label>
                  <input
                    type="text"
                    value={recommendedDish}
                    onChange={(e) => setRecommendedDish(e.target.value)}
                    placeholder="e.g. Chilli Chicken & Hakka Noodles"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Review *</label>
                  <textarea
                    rows={3}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Food quality, flavor profile, delivery speed..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'SUBMITTING...' : 'SUBMIT REVIEW'}</span>
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
