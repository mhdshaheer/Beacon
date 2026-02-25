# Deploying Beacon Scholarship to Vercel

This guide will help you host your Next.js application on Vercel with MongoDB and Razorpay.

## 1. Prepare your Database
Since you are using MongoDB locally, you need a cloud database for production:
1.  Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Create a new Cluster and a Database named `beacon-scholarship`.
3.  Go to **Network Access** and add `0.0.0.0/0` (Allow Access from Anywhere) so Vercel can connect.
4.  Get your **Connection String** (it looks like `mongodb+srv://...`).

## 2. Deploy to GitHub
Vercel works best with a Git repository:
1.  Create a new private repository on GitHub.
2.  Push your code:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin YOUR_GITHUB_REPO_URL
    git push -u origin main
    ```

## 3. Host on Vercel
1.  Log in to [Vercel](https://vercel.com).
2.  Click **"Add New"** > **"Project"**.
3.  Import your GitHub repository.
4.  In the **Environment Variables** section, add all keys from your `.env.local`:
    *   `MONGODB_URI` (Use your MongoDB Atlas string)
    *   `RAZORPAY_KEY_ID`
    *   `RAZORPAY_KEY_SECRET`
    *   `NEXT_PUBLIC_RAZORPAY_KEY_ID`
    *   `NEXTAUTH_SECRET` (You can generate one using `openssl rand -base64 32`)
    *   `NEXTAUTH_URL` (Set this to your production URL, e.g., `https://your-app.vercel.app`)
5.  Click **Deploy**.

## 4. Update Razorpay Dashboard
Once your app is live (e.g., `https://beacon.vercel.app`):
1.  Go to **Razorpay Dashboard** > **Settings** > **Webhooks**.
2.  (Optional) Add a webhook pointing to `https://your-app.vercel.app/api/payment/verify` if you want to handle async payment notifications.

## 🚀 That's it!
Your app will now automatically redeploy whenever you push changes to GitHub.
