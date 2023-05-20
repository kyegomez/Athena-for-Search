import posthog from 'posthog-js';

const posthogConfig = {
  apiKey: process.env.POSTHOG_API_KEY || '',
  apiHost: process.env.POSTHOG_INSTANCE_URL || '',
};

export function initializePostHog() {
  posthog.init(posthogConfig.apiKey, { api_host: posthogConfig.apiHost });
}

export function trackPageView() {
  posthog.capture('$pageview');
}
