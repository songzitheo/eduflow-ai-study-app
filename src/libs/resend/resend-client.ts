import { Resend } from 'resend';

// Use a placeholder key during build if RESEND_API_KEY is not set
// This allows the app to build without Resend configured
const resendKey = process.env.RESEND_API_KEY || 're_placeholder_key_for_build';

export const resendClient = new Resend(resendKey);
