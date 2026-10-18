import Script from "next/script";

// Google Analytics 4 (analytics only: no ads).
// It loads on the live site (Vercel "production") with the ID below. Local development and preview deployments send
// nothing, so your own testing does not pollute the numbers. Set NEXT_PUBLIC_GA_ID to use a different ID, or set it to
// an empty value to switch analytics off.
//
// - No cookie banner. Google's advertising features are off: no ad storage, no personalised ads, no Google signals.
// - For visitors in the EEA, the UK and Switzerland, analytics storage is OFF (Google Consent Mode), so no analytics
//   cookies are set for them and Google only receives cookieless pings.
// - Nothing personal (name, email, account id) is ever sent to Google.
// - Events (view_item, search, add_to_cart, begin_checkout, purchase...) are sent from lib/analytics.ts.
//
// If you ever add ads or remarketing, you will need a consent banner first (see README, "Analytics").
// A measurement ID is public (it is visible in every visitor's browser), so it is safe to keep in the code.
const LIVE_SITE_GA_ID = "G-B3NREJGEBZ";
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? (process.env.VERCEL_ENV === "production" ? LIVE_SITE_GA_ID : undefined);

const STRICT_REGIONS = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU",
  "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "IS", "LI", "NO", "GB", "CH",
];

export default function Analytics() {
  // The ID ends up inside inline JavaScript, so only accept the exact shape Google uses.
  if (!GA_ID || !/^G-[A-Z0-9]+$/.test(GA_ID)) return null;
  const init = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  analytics_storage: 'granted',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied'
});
gtag('consent', 'default', { analytics_storage: 'denied', region: ${JSON.stringify(STRICT_REGIONS)} });
gtag('js', new Date());
gtag('config', '${GA_ID}', { allow_google_signals: false, allow_ad_personalization_signals: false });
`;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {init}
      </Script>
    </>
  );
}
