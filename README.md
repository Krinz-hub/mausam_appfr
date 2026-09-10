# Personalized Mausam

Personalized AI Weather Companion application with cleanly separated **Frontend** (React Native / Expo) and **Backend** (Node.js / Express / MongoDB).

---

## 📁 Repository Structure

```text
Personalized_Mausam_Architecture_MD/
├── frontend/                     # React Native / Expo Mobile App
│   ├── app/                      # Expo Router screens (Tabs, Details, Onboarding)
│   ├── src/                      # UI Components, State, Personalization Engines
│   ├── assets/                   # Character artwork, fonts, sounds
│   ├── android/                  # Native Android workspace
│   ├── ios/                      # Native iOS workspace
│   ├── app.json                  # Expo mobile configuration
│   ├── package.json              # Frontend dependencies
│   ├── tsconfig.json             # Frontend TypeScript configuration
│   └── .env                      # Frontend environment variables
│
├── backend/                      # Node.js / Express / MongoDB REST API
│   ├── src/                      # Controllers, routes, models, middleware, config
│   │   ├── controllers/          # Auth, User, Onboarding controllers
│   │   ├── routes/               # Express route definitions
│   │   ├── models/               # Mongoose schema models
│   │   └── services/             # Engine 1 and backend services
│   ├── test/                     # Backend unit & integration tests
│   ├── package.json              # Backend dependencies
│   ├── tsconfig.json             # Backend TypeScript configuration
│   └── .env                      # Backend environment variables
│
├── package.json                  # Root orchestrator scripts
└── README.md
```

---

## 🚀 Quick Start

### 1. Run Everything (Frontend + Backend)
From the root directory:
```bash
npm run dev
```
This runs the backend server (on `http://localhost:3000`) and the Expo dev server concurrently.

---

### 2. Run Only the Frontend (Mobile App)
From the root directory:
```bash
npm start
# or
npm run frontend
```
Or directly inside the `frontend/` folder:
```bash
cd frontend
npx expo start --tunnel
```

Targeting specific platforms:
```bash
npm run android    # Run on Android emulator / connected device
npm run ios        # Run on iOS simulator
npm run web        # Run in browser
```

---

### 3. Run Only the Backend (API Server)
From the root directory:
```bash
npm run backend
```
Or directly inside the `backend/` folder:
```bash
cd backend
npm run dev
```

---

## 🧪 Testing & Verification

Run tests from the root directory:
```bash
# Typecheck both projects
npm run typecheck

# Run frontend tests
npm test

# Run backend tests
npm run test:backend

# Run all tests
npm run test:all
```
