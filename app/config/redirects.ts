// Centralized redirect configuration
// Update these URLs whenever you need to change the target links
export const REDIRECT_CONFIG = {
    '/tester': process.env.NEXT_PUBLIC_CUSTOMGPT_LINK || process.env.NEXT_PUBLIC_BASE_URL,
    // Add more redirects as needed
    // '/beta': 'https://another-link.com',
    // '/demo': 'https://demo-link.com',
    // '/v2': 'https://new-version-link.com',
} as const;

export type RedirectPath = keyof typeof REDIRECT_CONFIG;
