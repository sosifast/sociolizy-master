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
        source: "/service",
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
      {
        source: "/documentasi",
        destination: "/page/doc",
      },
      {
        source: "/dokumentasi",
        destination: "/page/doc",
      },
      {
        source: "/documentation",
        destination: "/page/doc",
      },
      {
        source: "/docs",
        destination: "/page/doc",
      },
      {
        source: "/doc",
        destination: "/page/doc",
      },
    ];
  },
  experimental: {
    agentFeedback: true,
    serverActions: {
      allowedOrigins: ["*.ngrok-free.app", "*.ngrok.app", "localhost:3000"],
    },
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
