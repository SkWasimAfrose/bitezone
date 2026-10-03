# Bitezone 🍔

Bitezone is a modern, fast, and fully responsive food ordering application built with React, Vite, and Tailwind CSS. It is designed to provide a seamless app-like experience (PWA) allowing users to order from their favorite local restaurants directly from their browser.

## 🚀 Features

- **Progressive Web App (PWA):** Installable on Android, iOS, and Desktop with offline caching and native-like standalone experience.
- **Role-Based Access Control:** Distinct experiences for Students/Public, Restaurant Admins, and Super Admins.
- **Authentication:** Secure user authentication handled seamlessly.
- **Dynamic Routing:** Utilizing `react-router-dom` with lazy-loaded routes for maximum performance.
- **Modern UI:** Crafted with Tailwind CSS, Lucide React icons, and Framer Motion for buttery smooth animations.
- **Backend Ready:** Integrated with Firebase and Firebase Admin for real-time database and secure serverless operations.

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite
- **Styling:** Tailwind CSS v4, Framer Motion
- **Icons:** Lucide React
- **Backend & Auth:** Firebase
- **Tooling:** ESLint (oxlint), Babel

## 📦 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/SkWasimAfrose/bitezone.git
   cd bitezone
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup Environment Variables:
   Create a `.env` file in the root directory and add your Firebase configuration and other necessary keys.

   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. Run the Development Server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`.

## 🌐 Deployment (Vercel)

This project is optimized for deployment on Vercel. 

1. Connect your GitHub repository to Vercel.
2. Vercel will automatically detect the Vite preset.
3. The `vercel.json` file ensures that all React Router routes are correctly rewritten to `index.html` (Single Page Application routing).
4. Add your `.env` variables to the Vercel project settings.
5. Deploy!

## 📜 Scripts

- `npm run dev`: Starts the local Vite development server.
- `npm run build`: Builds the app for production into the `dist` folder.
- `npm run preview`: Previews the production build locally.
- `npm run lint`: Runs the linter to ensure code quality.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/SkWasimAfrose/bitezone/issues).
