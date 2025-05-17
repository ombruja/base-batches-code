import { Metadata } from "next";

import App from "./app";

const appUrl = process.env.NEXT_PUBLIC_URL;

const frame = {
  version: process.env.NEXT_PUBLIC_MINIAPP_VERSION,
  imageUrl: `${appUrl}/login/opengraph-image`,
  button: {
    title: "Discover",
    action: {
      type: "launch_frame",
      name: "Astrology",
      url: appUrl,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: `#${process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR}`,
    },
  },
};

// export const revalidate = +(process.env.NEXT_REVALIDATION_TIME || 0) || 3600;
// export const dynamic = "force-static";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Astrology",
    openGraph: {
      title: "Astrology",
      description: "Unlock your cosmic identity",
    },
    twitter: {
      card: "summary_large_image",
      title: "Astrology",
      description: "Unlock your cosmic identity",
      creator: "@ombruja",
      site: "@ombruja",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function Login() {
  return <App />;
}
