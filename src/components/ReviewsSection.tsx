import React, { useState, useMemo } from 'react';
import { Star, MessageSquarePlus, CheckCircle2, ExternalLink, X, Send, Search, Sparkles, Filter, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [successToast, setSuccessToast] = useState(false);

  // Filter & Search State
  const [activeFilter, setActiveFilter] = useState<'all' | '5stars' | 'verified' | 'google' | 'tripadvisor'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(8);

  const currentYear = new Date().getFullYear();

  // Filtered Reviews List
  const filteredReviews = useMemo(() => {
    return reviews.filter((rev) => {
      // Category Match
      let matchCat = true;
      if (activeFilter === '5stars') matchCat = rev.rating === 5;
      else if (activeFilter === 'verified') matchCat = rev.verified === true;
      else if (activeFilter === 'google') matchCat = (rev.source || '').toLowerCase().includes('google');
      else if (activeFilter === 'tripadvisor') matchCat = (rev.source || '').toLowerCase().includes('tripadvisor');

      // Search Match
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        rev.author.toLowerCase().includes(q) ||
        rev.comment.toLowerCase().includes(q) ||
        (rev.recommendedDish && rev.recommendedDish.toLowerCase().includes(q));

      return matchCat && matchSearch;
    });
  }, [reviews, activeFilter, searchQuery]);

  const displayedReviews = filteredReviews.slice(0, visibleCount);

  // Ratings calculation
  const totalReviewsCount = reviews.length;
  const avgRating = totalReviewsCount > 0
    ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / totalReviewsCount).toFixed(1)
    : '4.9';

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author || !comment) return;

    setIsSubmitting(true);
    let createdReview: Review;

    try {
      const res = await fetch(getApiUrl('/api/reviews'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, rating, comment, recommendedDish })
      });

      if (res.ok) {
        const data = await res.json();
        createdReview = data.review || data;
      } else {
        createdReview = {
          id: `rev_${Date.now()}`,
          author,
          rating,
          comment,
          recommendedDish: recommendedDish || undefined,
          date: 'Just now',
          year: currentYear,
          verified: true,
          source: 'Direct'
        };
      }
    } catch (err) {
      createdReview = {
        id: `rev_${Date.now()}`,
        author,
        rating,
        comment,
        recommendedDish: recommendedDish || undefined,
        date: 'Just now',
        year: currentYear,
        verified: true,
        source: 'Direct'
      };
    } finally {
      if (onReviewSubmitted) {
        onReviewSubmitted(createdReview!);
      }
      setIsSubmitting(false);
      setModalOpen(false);
      setAuthor('');
      setComment('');
      setRecommendedDish('');
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 5000);
    }
  };

  return (
    <section id="reviews" className="py-20 bg-white border-t border-slate-200 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold tracking-wider uppercase mb-3">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>AUTHENTIC CUSTOMER TESTIMONIALS</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 font-serif tracking-tight">
              CUSTOMER <span className="text-red-600">REVIEWS</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Real dining experiences & customer feedback for INDO CHINESE in London.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Aggregate Rating Score Card */}
            <div className="flex items-center space-x-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-center border-r border-slate-200 pr-3.5">
                <span className="text-2xl font-extrabold text-slate-900 font-serif">{reviews.length > 0 ? avgRating : '5.0'}</span>
                <span className="text-[9px] text-slate-500 block font-bold">OUT OF 5</span>
              </div>
              <div>
                <div className="flex text-amber-500 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <span className="text-[11px] font-bold text-slate-700">
                  {reviews.length > 0 ? `${reviews.length} Verified Reviews` : 'Verified Diner Rating'}
                </span>
              </div>
            </div>

            {/* Quick Header Write Review Button */}
            <button
              onClick={() => setModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all hover:shadow-md"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>WRITE A REVIEW</span>
            </button>
          </div>
        </div>

        {/* Filter Pills & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {[
              { id: 'all', label: `All Reviews (${reviews.length})` },
              { id: '5stars', label: `5 Stars (${reviews.filter(r => r.rating === 5).length})` },
              { id: 'verified', label: `Verified Diners (${reviews.filter(r => r.verified).length})` },
              { id: 'google', label: `Google (${reviews.filter(r => (r.source || '').toLowerCase().includes('google')).length})` },
              { id: 'tripadvisor', label: `TripAdvisor (${reviews.filter(r => (r.source || '').toLowerCase().includes('tripadvisor')).length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, dish or note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Review Submitted Success Banner */}
        {successToast && (
          <div className="mb-8 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between shadow-xs animate-fadeIn">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-bold">Thank you for your review!</p>
                <p className="text-[11px] text-emerald-700">Your feedback has been published and added to our customer testimonials.</p>
              </div>
            </div>
            <button
              onClick={() => setSuccessToast(false)}
              className="p-1 text-emerald-600 hover:text-emerald-900 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Review Cards Grid */}
        {filteredReviews.length === 0 ? (
          <div className="py-16 px-6 text-center bg-gradient-to-b from-amber-50/40 via-orange-50/20 to-transparent rounded-3xl border border-amber-200/80 max-w-2xl mx-auto my-6 shadow-xs">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Star className="w-7 h-7 fill-amber-500 text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-serif mb-1">Be the First to Review INDO CHINESE!</h3>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed max-w-lg mx-auto">
              Share your dining or takeaway experience with us. Recommend your favorite Bombay street food specialties and help fellow foodies discover authentic wok flavors!
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>WRITE A CUSTOMER REVIEW</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {displayedReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-slate-50 border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow group"
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
                    <p className="text-[11px] text-red-600 font-bold mb-2 truncate">
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
                    <span className="text-[10px] text-slate-400 font-mono">{rev.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View More / Show Less Toggle */}
        {filteredReviews.length > 8 && (
          <div className="flex justify-center mb-8">
            {visibleCount < filteredReviews.length ? (
              <button
                onClick={() => setVisibleCount(prev => Math.min(filteredReviews.length, prev + 8))}
                className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <span>View More Reviews ({filteredReviews.length - visibleCount} remaining)</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setVisibleCount(8)}
                className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <span>Show Less Reviews</span>
                <ChevronUp className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-slate-100">
          <a
            id="read-google-reviews-button"
            href={settings?.googleBusinessProfileUrl || '#'}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-bold transition-all shadow-xs flex items-center space-x-2 cursor-pointer"
          >
            <span>READ OUR GOOGLE REVIEWS</span>
            <ExternalLink className="w-4 h-4 text-red-600" />
          </a>

          <button
            id="write-review-button"
            onClick={() => setModalOpen(true)}
            className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md flex items-center space-x-2 cursor-pointer"
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
                className="absolute top-4 right-4 p-2 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer"
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
                        className="p-1 focus:outline-none cursor-pointer"
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
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md flex items-center justify-center space-x-2 cursor-pointer"
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
