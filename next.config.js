// Bump this string whenever the visual shell changes so iOS/Android visitors
// who installed the PWA pick up the new aesthetic on next launch instead of
// being stuck on the cached old version. Format: yyyymmdd-N.
const PWA_CACHE_ID = "thestackgg-20260507-2";

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  cacheId: PWA_CACHE_ID,
  cleanupOutdatedCaches: true,
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = withPWA(nextConfig);
