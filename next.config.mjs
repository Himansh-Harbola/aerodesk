import nextPwa from "next-pwa";

const withPWA = nextPwa({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*supabase\.co\/rest\/v1\/flights.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "flight-search-results",
        expiration: { maxEntries: 48, maxAgeSeconds: 60 * 60 * 6 },
      },
    },
    {
      urlPattern: /\.(?:js|css|png|jpg|jpeg|svg|webp|ico)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "static-assets",
        expiration: { maxEntries: 96, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
  ],
  fallbacks: {
    document: "/offline",
  },
});

const nextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);
