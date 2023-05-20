import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Script from "next/script";
import posthog from "posthog-js";
import { useEffect } from "react";
import { PostHogProvider } from "posthog-js/react";
import { useRouter } from "next/router";

interface PostHogConfig {
  apiKey: string;
  apiHost: string;
}

// const posthogConfig: PostHogConfig = {
//   apiKey: process.env.POSTHOG_API_KEY || "",
//   apiHost: process.env.POSTHOG_INSTANCE_URL || "",
// };

// Check that PostHog is client-side (used to handle Next.js SSR)
if (typeof window !== "undefined") {
  posthog.init('phc_hslKdorllPf5Ts4iRyJHKKtxKnVCtMs5NI3E7eVAaU3', {
    api_host: 'https://app.posthog.com' || "https://app.posthog.com",
    // Enable debug mode in development
    loaded: (posthog) => {
      if (process.env.NODE_ENV === "production") posthog.debug();
    },
  });
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // const posthogConfig: PostHogConfig = {
  //   apiKey: process.env.POSTHOG_API_KEY || "",
  //   apiHost: process.env.POSTHOG_INSTANCE_URL || "",
  // };


  useEffect(() => {
    // Track page views
    const handleRouteChange = () => posthog?.capture("$pageview");
    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, []);

  return (
    <>
      <PostHogProvider client={posthog}>
        <Script
          async
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-2J2VEE18TV"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-2J2VEE18TV');
        `}
        </Script>
        <Component {...pageProps} />
      </PostHogProvider>
    </>
  );
}
