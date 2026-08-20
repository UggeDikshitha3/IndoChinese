import React from 'react';
import { RestaurantSettings } from '../types';
import { DEFAULT_RESTAURANT_SETTINGS } from '../config/restaurantConfig';

interface SeoSchemaProps {
  settings?: RestaurantSettings;
}

export const SeoSchema: React.FC<SeoSchemaProps> = ({ settings = DEFAULT_RESTAURANT_SETTINGS }) => {
  const currentSettings = settings || DEFAULT_RESTAURANT_SETTINGS;
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": currentSettings?.name || "INDO CHINESE",
    "image": "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=1200&q=80",
    "@id": `${currentSettings?.googleBusinessProfileUrl || ''}#restaurant`,
    "url": "https://indochinese-restaurant.com",
    "telephone": currentSettings?.phone || '',
    "priceRange": currentSettings?.priceRange || '££',
    "address": {
      "@type": "PostalAddress",
      "streetAddress": currentSettings?.address || '',
      "addressLocality": currentSettings?.city ? currentSettings.city.split(',')[0] : 'London',
      "addressRegion": "Greater London",
      "postalCode": currentSettings?.postcode || '',
      "addressCountry": "UK"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": currentSettings?.latitude || 51.4682,
      "longitude": currentSettings?.longitude || -0.3609
    },
    "openingHoursSpecification": (Array.isArray(currentSettings?.openingHours) 
      ? currentSettings.openingHours 
      : []
    )
      .filter((h: any) => !h.closed)
      .map((h: any) => ({
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": h.day,
        "opens": h.open,
        "closes": h.close
      })),
    "servesCuisine": [
      "Indo-Chinese",
      "Chinese",
      "Indian Chinese",
      "Asian Fusion"
    ],
    "menu": "https://indochinese-restaurant.com/#menu",
    "acceptsReservations": "True",
    "sameAs": [
      currentSettings?.googleBusinessProfileUrl,
      currentSettings?.instagramUrl,
      currentSettings?.facebookUrl,
      currentSettings?.tiktokUrl
    ].filter(Boolean),
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "248",
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
};
