# LiveBus - Real-Time Transit Tracker

LiveBus is a modern, real-time bus tracking application built with Next.js, Firebase, and Google Maps. It features separate dashboards for Drivers (to broadcast location) and Passengers (to view live movements).

## 🚀 Getting Started Locally

### 1. Download and Extract
Download the project ZIP from Firebase Studio and extract it to a folder on your computer.

### 2. Install Dependencies
Open your terminal in the project folder and run:
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory and fill in your credentials:
```env
# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:9002](http://localhost:9002) to see the app.

## 📤 Push to GitHub

To send this project to your own GitHub repository, follow these steps:

1. Create a new, empty repository on [GitHub](https://github.com/new).
2. In your local project folder, run:
```bash
git init
git add .
git commit -m "Initial commit of LiveBus"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

## 🏗 Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database/Auth**: Firebase & Firestore
- **Maps**: Google Maps JS API (@vis.gl/react-google-maps)
- **UI**: ShadCN UI + Tailwind CSS
- **Icons**: Lucide React
