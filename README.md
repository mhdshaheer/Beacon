# Beacon Scholarship Registration 2026

A modern, responsive, and secure football talent registration platform built with Next.js 14+, MongoDB, and Razorpay.

## 🚀 Features
- **Modern UI**: Dark/Green sports theme with glassmorphism, Framer Motion animations, and Tailwind CSS.
- **Multi-step Form**: 5-step intuitive registration process with Zod validation.
- **Payment Gateway**: Seamless Razorpay integration for registration fee processing.
- **Admin Panel**: Dashboard for managing applicants, tracking payments, and exporting data.
- **Fully Responsive**: Optimized for mobile, tablet, and desktop.

## 🛠 Tech Stack
- **Framework**: Next.js (App Router, TypeScript)
- **Database**: MongoDB (Mongoose)
- **Styling**: Tailwind CSS, Framer Motion, Lucide React
- **Payments**: Razorpay Node SDK
- **Validation**: React Hook Form, Zod

## 📦 Getting Started

### 1. Clone the repository and install dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory and add the following:

```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# Razorpay Credentials (Get from Razorpay Dashboard > Settings > API Keys)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx

# Next Auth (For Admin Login)
NEXTAUTH_SECRET=your_secret_string
NEXTAUTH_URL=http://localhost:3000

# Cloudinary (Optional, for document storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Run the development server
```bash
npm run dev
```

## 🏗 Project Structure
- `src/app`: Page routes and Server Components.
- `src/app/api`: Serverless API routes (Payment, Registration).
- `src/components`: Reusable UI components.
- `src/models`: Mongoose database schemas.
- `src/lib`: Utility functions (DB connection, Validations).

## 📄 License
This project is licensed under the MIT License.

© 2026 Beacon Scholarship Program. All rights reserved.
