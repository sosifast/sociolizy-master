import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/services",
        destination: "/page/service",
      },
      {
        source: "/privacy",
        destination: "/page/privacy",
      },
      {
        source: "/policy",
        destination: "/page/policy",
      },
      {
        source: "/terms",
        destination: "/page/policy",
      },
      {
        source: "/about-us",
        destination: "/page/about-us",
      },
      {
        source: "/about",
        destination: "/page/about-us",
      },
      {
        source: "/contact-us",
        destination: "/page/contact-us",
      },
      {
        source: "/contact",
        destination: "/page/contact-us",
      },
    ];
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
