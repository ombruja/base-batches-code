export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL;

  const fcConfigAccountAssociationHeader =
    process.env.FC_CONFIG_ACCOUNT_ASSOCIATION_HEADER;
  const fcConfigAccountAssociationPayload =
    process.env.FC_CONFIG_ACCOUNT_ASSOCIATION_PAYLOAD;
  const fcConfigAccountAssociationSignature =
    process.env.FC_CONFIG_ACCOUNT_ASSOCIATION_SIGNATURE;

  // https://github.com/farcasterxyz/miniapps/discussions/191
  const config = {
    accountAssociation: {
      header: fcConfigAccountAssociationHeader,
      payload: fcConfigAccountAssociationPayload,
      signature: fcConfigAccountAssociationSignature,
    },
    frame: {
      // *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***
      // General datapoints
      // *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***

      /**
       * version
       * Manifest version
       * Must be '1'.
       */
      version: process.env.NEXT_PUBLIC_MINIAPP_VERSION,

      /**
       * homeUrl
       * Default launch URL
       * Max length 1024 characters
       */
      homeUrl: appUrl,

      /**
       * splashImageUrl
       * URL of image to show on loading screen.
       * Max length 32 characters. Must be 200x200px.
       */
      splashImageUrl: `${appUrl}/splash.png`,

      /**
       * splashBackgroundColor
       * Hex color code to use on loading screen.
       * Hex color code.
       */
      splashBackgroundColor: `#${process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR}`,

      /**
       * webhookUrl
       * URL to which clients will POST events
       * Max length 1024 characters. Must be set if the Mini App application uses notifications.
       */
      webhookUrl: `${appUrl}/api/webhook`,

      // *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***
      // OG Details
      // *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***

      /**
       * ogTitle
       * Open Graph title
       * Max 30 characters
       */
      ogTitle: "Astrology by OMBRUJA",

      /**
       * ogDescription
       * Open Graph description
       * Max 100 characters
       */
      ogDescription: "Astrology by OMBRUJA",

      /**
       * ogImageUrl
       * Open Graph image
       * 1200x630 px JPG or PNG. Should show your brand clearly. No excessive text. Logo + tagline + UI is a good combo.
       */
      ogImageUrl: `${appUrl}/opengraph-image`,

      // *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***
      // Mini App Store Listing
      // *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***

      /**
       * noindex
       * Whether to exclude the Mini App from search results
       * true - to exclude from search results, false - to include in search results (default)
       */
      noindex: false,

      /**
       * iconUrl
       * Main icon
       * 1024x1024 px PNG, no alpha
       * Use a bold, recognizable logo. No text. Avoid photos or screenshots.
       */
      iconUrl: `${appUrl}/icon.png`,

      /**
       * name
       * Display name of the app
       * 32 characters, no emojis or special characters
       * Use brandable, unique names. Avoid generic terms. No emojis or trademark symbols.
       */
      name: "Astrology",

      /**
       * subtitle
       * Short description under the app name
       * 30 characters, no emojis or special characters
       * Should clarify what your app does in a catchy way. Avoid repeating the title.
       */
      subtitle: "Unlock your cosmic identity",

      // *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***
      // Mini App Store Page
      // *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***

      /**
       * description
       * Promotional message displayed on Mini App Page
       * 170 characters, no emojis or special characters
       * Use short paragraphs, headings, and bullet points. Focus on value, not features. Include social proof if possible. Avoid jargon.
       */
      description:
        "Collect your zodiac sign, daily horoscope and manifest in community.",

      /**
       * screenshotUrls
       * Visual previews of the app, max 3 screens
       * Portrait, 1284 x 2778
       * Focus on showing the core value or magic moment of the app in the first 2–3 shots. Use device frames and short captions.
       */
      // screenshotUrls: [
      //   `${appUrl}/frames/hello/screenshot1.png`,
      //   `${appUrl}/frames/hello/screenshot2.png`,
      //   `${appUrl}/frames/hello/screenshot3.png`,
      // ],

      // *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***
      // Search & Discovery
      // *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***

      /**
       * primaryCategory
       * Primary category of app
       * One of the pre-defined categories: games, social, finance, utility, productivity, health-fitness, news-media, music, shopping, education, developer-tools, entertainment, art-creativity
       * Games, Social, Finance, Utility, Productivity, Health & Fitness, News & Media, Music, Shopping, Education, Developer Tools, Entertainment, Art & Creativity
       */
      primaryCategory: "health-fitness",

      /**
       * tags
       * Descriptive tags for filtering/search
       * up to 5 tags
       * Use 3–5 high-volume terms; no spaces, no repeats, no brand names. Use singular form.
       */
      tags: [
        "astrology",
        "zodiacsigns",
        "wellness",
        "spirituality",
        "horoscope",
      ],

      // *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***
      // Mini App Promotional Asset
      // *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***

      /**
       * heroImageUrl
       * Promotional display image on top of the mini app store
       * 1200 x 630px (1.91:1)
       */
      heroImageUrl: `${appUrl}/splash.png`,

      /**
       * tagline
       * Marketing tagline should be punchy and descriptive
       * 30 characters
       * Use for time-sensitive promos or CTAs. Keep copy active (e.g., “Grow, Raid & Rise in Stoke Fire”).
       */
      tagline: "Here to Awaken Your Magic",

      // *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***
      // Sharing Experience
      // *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***

      /**
       * ogTitle
       * 30 characters
       * Use your app name + short tag (e.g., “AppName – Local News Fast”). Title case, no emojis.
       */
      // ogTitle: `${appUrl}/frames/hello/screenshot1.png`,

      /**
       * ogDescription
       * 100 characters
       * Summarize core benefit in 1–2 lines. Avoid repeating OG title.
       */
      // ogDescription: "",

      /**
       * ogImageUrl
       * Promotional image (same as app hero image)
       * 1200 x 630px (1.91:1)
       * 1200x630 px JPG or PNG. Should show your brand clearly. No excessive text. Logo + tagline + UI is a good combo.
       */
      // ogImageUrl: "",
    },
  };

  return Response.json(config);
}
