// Bump this string whenever the visual shell changes so iOS/Android visitors
// who installed the PWA pick up the new aesthetic on next launch instead of
// being stuck on the cached old version. Format: yyyymmdd-N.
const PWA_CACHE_ID = "thestackgg-20260913-2";

const { default: withPWAInit, runtimeCaching } = require("@ducanh2912/next-pwa");

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    skipWaiting: true,
    cacheId: PWA_CACHE_ID,
    cleanupOutdatedCaches: true,
    runtimeCaching: [
      // Shared games, ownership, recaps and pod rosters must stay current.
      { urlPattern: /\/api\//, handler: "NetworkOnly" },
      ...runtimeCaching,
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
};

module.exports = withPWA(nextConfig);
