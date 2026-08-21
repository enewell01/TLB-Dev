// Single source of truth for the business identity used across structured data.
// Both Layout.astro (which emits the LocalBusiness/Electrician node) and
// ServiceLayout.astro (whose Service nodes reference it as `provider`) read from
// here, so the site describes one entity under one @id instead of repeating an
// anonymous business object on every page.

export const SITE_URL = 'https://tlbelectric.ca';

/** @id of the single LocalBusiness node. Referenced, never redefined. */
export const BUSINESS_ID = `${SITE_URL}/#business`;

// Greater Moncton centroid, matching the coordinates the service-area map is
// centred on in MapEmbed.astro. TLB is a mobile contractor with no public street
// address, so the service-area centroid is the meaningful point to publish.
export const BUSINESS_GEO = {
  '@type': 'GeoCoordinates',
  latitude: 46.0878,
  longitude: -64.7782,
} as const;
