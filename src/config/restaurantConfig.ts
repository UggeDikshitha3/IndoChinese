import { RestaurantSettings } from '../types';

export const DEFAULT_RESTAURANT_SETTINGS: RestaurantSettings = {
  name: "INDO CHINESE",
  tagline: "THE REAL TASTE OF BOMBAY",
  description: "Born on the vibrant, bustling streets of Bombay, Indo-Chinese cuisine is a true celebration of two rich culinary worlds coming together. Where traditional Chinese stir-fry and wok techniques meet bold Indian spices.",
  address: "124 High Street",
  city: "Hounslow, London",
  postcode: "TW3 1NA",
  country: "United Kingdom",
  phone: "072777586916",
  email: "info@indochinesebombay.com",
  whatsapp: "072777586916",
  latitude: 51.4682,
  longitude: -0.3609,
  priceRange: "££",
  openingHours: [
    { day: "Monday", open: "10:30 AM", close: "09:30 PM" },
    { day: "Tuesday", open: "10:30 AM", close: "09:30 PM" },
    { day: "Wednesday", open: "10:30 AM", close: "09:30 PM" },
    { day: "Thursday", open: "10:30 AM", close: "09:30 PM" },
    { day: "Friday", open: "10:30 AM", close: "09:30 PM" },
    { day: "Saturday", open: "10:30 AM", close: "09:30 PM" },
    { day: "Sunday", open: "10:30 AM", close: "09:30 PM" }
  ],
  googleMapsUrl: "https://maps.google.com/?q=124+High+Street+Hounslow",
  googleBusinessProfileUrl: "https://g.page/r/indochinese-hounslow",
  instagramUrl: "https://instagram.com/indochineserestaurant",
  facebookUrl: "https://facebook.com/indochineserestaurant",
  tiktokUrl: "https://tiktok.com/@indochineserestaurant",
  orderingEnabled: true,
  reservationsEnabled: true,
  minOrderDelivery: 15.00,
  deliveryFee: 2.50,
  freeDeliveryThreshold: 35.00
};
