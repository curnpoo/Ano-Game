---
description: How to deploy to Vercel and set up environment variables
---

# Deploying to Vercel with Environment Variables

Since we moved your API keys to a `.env` file for security, you need to tell Vercel about them.

## Option 1: Using the Vercel CLI (Recommended)

1.  **Install Vercel CLI** (if you haven't already):
    ```bash
    npm i -g vercel
    ```

2.  **Login to Vercel**:
    ```bash
    vercel login
    ```

3.  **Link your project**:
    ```bash
    vercel link
    ```
    Follow the prompts to select your project.

4.  **Upload your Environment Variables**:
    Vercel can read your local `.env` and upload it for you.
    ```bash
    vercel env pull .env.development.local
    # Actually, to PUSH your local .env to Vercel:
    while read -r line; do
      [[ ! -z "$line" && "$line" != \#* ]] && vercel env add $(echo "$line" | cut -d= -f1) production $(echo "$line" | cut -d= -f2- | tr -d '"');
    done < .env
    ```
    *Note: The command above is a bit complex for a one-liner. It might be easier to use the dashboard.*

## Option 2: Using the Vercel Dashboard (Easiest)

1.  Open your project in the [Vercel Dashboard](https://vercel.com/dashboard).
2.  Go to **Settings** > **Environment Variables**.
3.  Open your local `.env` file in your editor.
4.  Copy the **entire content** of your `.env` file.
5.  Paste it into the Vercel Environment Variables form (Vercel is smart enough to parse the whole file at once!).
6.  Click **Save**.
7.  **Redeploy** your application (Deployment > Redeploy) for changes to take effect.

## Option 3: Quick Deploy Command
If you just want to ship it now:
```bash
vercel --prod
```
*Note: You still need to set the env vars in the dashboard if you haven't yet, or the build/app will fail.*
