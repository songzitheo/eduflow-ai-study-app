# Google OAuth Setup Guide for Supabase

## Problem
Getting error: `{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}`

This means Google OAuth is not enabled in your Supabase project.

## Solution Steps

### 1. Go to Supabase Dashboard
1. Navigate to https://supabase.com/dashboard
2. Select your project

### 2. Enable Google OAuth Provider
1. In the left sidebar, click on **Authentication**
2. Click on **Providers**
3. Find **Google** in the list of providers
4. Click on Google to expand its settings
5. Toggle **Enable Sign in with Google** to ON

### 3. Configure Google OAuth Credentials

You need to create OAuth credentials in Google Cloud Console:

#### A. Create Google OAuth Client ID
1. Go to https://console.cloud.google.com/
2. Select or create a project
3. Navigate to **APIs & Services** → **Credentials**
4. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
5. If prompted, configure the OAuth consent screen first:
   - User Type: External
   - App name: EduFlow
   - User support email: your email
   - Developer contact: your email
   - Click Save and Continue through the scopes and test users

6. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: EduFlow (or any name you prefer)
   
7. Add Authorized redirect URIs (ADD BOTH):
   - **Supabase callback** (required):
     ```
     https://axgpchkgvnebvzvqkmox.supabase.co/auth/v1/callback
     ```
   - **Local development callback** (for testing):
     ```
     http://localhost:3000/auth/callback
     ```
   
   ⚠️ **IMPORTANT**: You must add BOTH URIs for OAuth to work properly
   
8. Click **CREATE**
9. Copy the **Client ID** and **Client Secret**

#### B. Add Credentials to Supabase
1. Go back to Supabase Dashboard → Authentication → Providers → Google
2. Paste your **Client ID** in the "Client ID" field
3. Paste your **Client Secret** in the "Client Secret" field
4. Click **Save**

### 4. Test Google Sign-In
1. Go to your app's login page
2. Click "Continue with Google"
3. You should now be redirected to Google's OAuth consent screen
4. After authorizing, you'll be redirected back to your app

## Environment Variables (Optional)

If you want to use different OAuth credentials for development vs production, you can set them in your `.env.local` file, but Supabase manages this in their dashboard by default.

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Make sure the redirect URI in Google Cloud Console exactly matches:
  ```
  https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
  ```

### Still getting "provider is not enabled"
- Wait a few minutes after enabling the provider in Supabase
- Clear your browser cache
- Try in an incognito window

### Users not being created in database
- Check your Supabase Database → Tables → `auth.users` to see if users are being created
- Ensure your RLS (Row Level Security) policies allow user creation

## Additional Resources
- [Supabase Google OAuth Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Setup](https://support.google.com/cloud/answer/6158849)
