import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

// Determine if we're in development

const cspHeader = `
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com ${process.env.NEXT_PUBLIC_URL};
style-src 'self' 'unsafe-inline' ${process.env.NEXT_PUBLIC_URL} https://fonts.googleapis.com;
img-src 'self' data: blob: https: ${process.env.NEXT_PUBLIC_URL};
font-src 'self' https://fonts.gstatic.com;
object-src 'self' data:;
base-uri 'self';
form-action 'self';
frame-ancestors ${process.env.NEXT_PUBLIC_URL} https://auth.privy.io https://verify.walletconnect.com https://verify.walletconnect.org https://challenges.cloudflare.com https://warpcast.com https://*.warpcast.com https://farcaster.xyz https://*.farcaster.xyz;
child-src ${process.env.NEXT_PUBLIC_URL} https://auth.privy.io https://verify.walletconnect.com https://verify.walletconnect.org https://challenges.cloudflare.com https://warpcast.com https://*.warpcast.com https://farcaster.xyz https://*.farcaster.xyz;
frame-src ${process.env.NEXT_PUBLIC_URL} https://auth.privy.io https://verify.walletconnect.com https://verify.walletconnect.org https://challenges.cloudflare.com https://warpcast.com https://*.warpcast.com https://farcaster.xyz https://*.farcaster.xyz;
connect-src 'self' ${process.env.NEXT_PUBLIC_URL} ${process.env.NEXT_PUBLIC_BLOB_BASE_URL_DAILY_HOROSCOPE} ${process.env.NEXT_PUBLIC_BLOB_BASE_URL_WESTERN_ZODIAC} https://auth.privy.io wss://relay.walletconnect.com wss://relay.walletconnect.org wss://www.walletlink.org https://relay.walletconnect.com https://relay.walletconnect.org https://www.walletlink.org https://*.rpc.privy.systems https://explorer-api.walletconnect.com https://api.web3modal.org https://pulse.walletconnect.org https://api.developer.coinbase.com https://api.developer.coinbase.com https://keys.developer.coinbase.com https://api.developer.coinbase.com/rpc https://api.developer.coinbase.com/analytics https://warpcast.com https://*.warpcast.com https://farcaster.xyz https://*.farcaster.xyz https://*.segment.com https://api.segment.io https://cdn.segment.com;
worker-src 'self' blob:;
manifest-src 'self'
`;

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader.replace(/\n/g, ""),
          },
        ],
      },
    ];
  },
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "sheldon-corp",
  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});
