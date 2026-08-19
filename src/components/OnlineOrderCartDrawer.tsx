import React, { useState } from 'react';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Sparkles,
  Tag,
  Clock,
  Truck,
  Store,
  Utensils,
  CheckCircle2,
  AlertCircle,
  Percent
} from 'lucide-react';
import { CartItem, OrderType, RestaurantSettings } from '../types';

interface OnlineOrderCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  orderType: OrderType;
  onChangeOrderType: (type: OrderType) => void;
  promoCode: string;
  onApplyPromoCode: (code: string) => { success: boolean; message: string };
  onRemovePromoCode: () => void;
  appliedDiscount: number;
  onProceedToCheckout: () => void;
  settings?: RestaurantSettings;
}

export const OnlineOrderCartDrawer: React.FC<OnlineOrderCartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  orderType,
  onChangeOrderType,
  promoCode,
  onApplyPromoCode,
  onRemovePromoCode,
  appliedDiscount,
  onProceedToCheckout,
  settings
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [promoFeedback, setPromoFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  // Calculation
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  const deliveryFee = orderType === 'delivery' ? (subtotal >= 30 ? 0 : 2.50) : 0;
  const taxableAmount = Math.max(0, subtotal - appliedDiscount);
  const tax = Math.round(taxableAmount * 0.20 * 100) / 100; // UK 20% VAT
  const grandTotal = Math.max(0, subtotal - appliedDiscount + deliveryFee + tax);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = onApplyPromoCode(promoInput.trim());
    setPromoFeedback(res);
    if (res.success) {
      setPromoInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-slideLeft text-slate-800">
          
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-serif flex items-center gap-1.5 text-amber-300">
                  <span>Your Order Cart</span>
                  <span className="text-xs font-mono font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                    {cartItems.reduce((sum, itm) => sum + itm.quantity, 0)} items
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">Indo Chinese • Hounslow, London</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Fulfillment Type Toggle */}
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-2">
              Select Fulfillment Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onChangeOrderType('collection')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all border ${
                  orderType === 'collection'
                    ? 'bg-red-600 text-white border-red-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Takeaway (15-20m)</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeOrderType('delivery')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all border ${
                  orderType === 'delivery'
                    ? 'bg-red-600 text-white border-red-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Delivery (25-35m)</span>
              </button>
            </div>

            {orderType === 'delivery' && (
              <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>{subtotal >= 30 ? '🎉 Free delivery applied on orders over £30!' : 'Add items for £' + (30 - subtotal).toFixed(2) + ' more for FREE delivery.'}</span>
              </p>
            )}
          </div>

          {/* Cart Item List / Empty State */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <ShoppingBag className="w-8 h-8 stroke-1" />
                </div>
                <h4 className="text-base font-bold text-slate-800 font-serif">Your Cart is Currently Empty</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Explore our wok-tossed Bombay delicacies, dim sums, and spicy noodles to start building your meal.
                </p>
                <button
                  onClick={onClose}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-colors"
                >
                  Explore Delicious Menu
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-1 text-xs text-slate-500">
                  <span>Selected Dishes</span>
                  <button
                    onClick={onClearCart}
                    className="text-red-600 hover:text-red-800 font-semibold underline text-[11px]"
                  >
                    Clear Cart
                  </button>
                </div>

                {cartItems.map((item, idx) => (
                  <div
                    key={`${item.menuItem.id}-${idx}`}
                    className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3 transition-all hover:border-slate-300"
                  >
                    <img
                      src={item.menuItem.image}
                      alt={item.menuItem.name}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-slate-100"
                      onError={(e) => {
                        e.currentTarget.src = item.menuItem.isVeg
                          ? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'
                          : 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=200&q=80';
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate font-serif">
                          {item.menuItem.name}
                        </h4>
                        <span className="text-xs font-extrabold text-slate-900 font-serif whitespace-nowrap">
                          £{(item.menuItem.price * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          item.menuItem.isVeg ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.menuItem.isVeg ? 'VEG' : 'NON-VEG'}
                        </span>
                        {item.spiceLevel && (
                          <span className="text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded font-semibold border border-rose-200">
                            {item.spiceLevel}
                          </span>
                        )}
                      </div>

                      {item.specialInstructions && (
                        <p className="text-[10px] text-slate-500 italic truncate mt-0.5">
                          Note: "{item.specialInstructions}"
                        </p>
                      )}

                      {/* Quantity Modifier */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                        <div className="flex items-center space-x-2 bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(idx, item.quantity - 1)}
                            className="w-5 h-5 flex items-center justify-center rounded bg-white text-slate-700 hover:bg-slate-200 transition-colors shadow-2xs text-xs font-bold"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-slate-900 px-1.5">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                            className="w-5 h-5 flex items-center justify-center rounded bg-white text-slate-700 hover:bg-slate-200 transition-colors shadow-2xs text-xs font-bold"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(idx)}
                          className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Footer Billing & Checkout Action */}
          {cartItems.length > 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
              {/* Promo Code Input */}
              <form onSubmit={handleApplyPromo} className="space-y-1">
                {promoCode ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-300 rounded-xl px-3 py-1.5 text-xs text-emerald-900 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Code <strong>{promoCode}</strong> applied (-£{appliedDiscount.toFixed(2)})</span>
                    </div>
                    <button
                      type="button"
                      onClick={onRemovePromoCode}
                      className="text-emerald-700 hover:text-emerald-950 font-bold text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Promo code (e.g. BOMBAY10)"
                      className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 font-mono uppercase"
                    />
                    <button
                      type="submit"
                      disabled={!promoInput.trim()}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                )}
                {promoFeedback && !promoCode && (
                  <p className={`text-[11px] ${promoFeedback.success ? 'text-emerald-600' : 'text-red-600'} font-semibold`}>
                    {promoFeedback.message}
                  </p>
                )}
              </form>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-200">
                <div className="flex justify-between">
                  <span>Subtotal (Dishes):</span>
                  <span className="font-semibold text-slate-800">£{subtotal.toFixed(2)}</span>
                </div>

                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount ({promoCode}):</span>
                    <span>-£{appliedDiscount.toFixed(2)}</span>
                  </div>
                )}

                {orderType === 'delivery' && (
                  <div className="flex justify-between">
                    <span>Delivery Charge:</span>
                    <span className="font-semibold text-slate-800">
                      {deliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `£${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>UK VAT (20% Included):</span>
                  <span>£{tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200 font-serif">
                  <span>TOTAL AMOUNT TO PAY:</span>
                  <span className="text-base text-red-600">£{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Trigger */}
              <button
                type="button"
                id="cart-checkout-button"
                onClick={onProceedToCheckout}
                className="w-full py-3 px-4 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-sm font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 transform active:scale-98 cursor-pointer"
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
