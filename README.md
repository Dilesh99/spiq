
# 🏏 SpiQ - Mobile Application
SportiQ is a mobile application designed to help Sri Lankan school athletes identify the most suitable sport for their unique body type and biometrics.
---

## 📋 Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Instructions to Run the Project](#instructions-to-run-the-project)
- [Database Setup and Configuration](#database-setup-and-configuration)
- [Assumptions](#assumptions)
- [Additional Features](#additional-features)
- [Guidelines for Stage 2](#guidelines-for-stage-2)
- [Contribution](#contribution)

---

## 📖 Overview

**SpiQ** is the ultimate mobile application where student can identify as a player what are the three sports that they are most suiatble for their physical condition and coach can identify their students which are most prefect for relevent games. Many students unknowingly choose sports that don’t match their natural physical strengths, often realizing it only after years of effort. SportiQ aims to change that by offering a scientific and accessible solution to recommend ideal sports based on key biometric data like height, weight, arm span, and more.

By empowering students and coaches with early insights, SportiQ paves the way for smarter sport selection, improved performance, and a brighter future for Sri Lankan athletics.


The application is composed of three major components:

- **Admin Panel** – Manages players, stats, and tournament details.
- **User Interface (Mobile)** – Enables coaches to add thier students's physical stats and Body measurements.
- **AI Chatbot (Spiriter)** – Using body measurements, giving the recomendation for best three sports for players that they should nore capble to do.

---

## 🚀 Key Features

### Coach Panel


### User Interface


### AI Chatbot (Spiriter)
- Provides player insights and optimal team suggestions.
- Handles FAQs and fallback messages for unknown queries.
- Accessible via in-app "Spiriter" button.

---

## 🧱 Tech Stack

| Layer        | Technology                  |
|--------------|-----------------------------|
| Frontend     | **ReactNative** (Mobile)    |
| Backend      | **Node.js (Express.js)**    |
| Database     | **PostgreSQL**              |
| AI Chatbot   | Integrated with custom logic|

---

## 🛠️ Instructions to Run the Project

### Prerequisites
Make sure you have the following installed:
- Node.js (>= 18.x.x)
- PostgreSQL (>= 15.x.x)
- Android Studio
- React Native CLI( 0.76< )
- Android SDK & Emulator (or real device with USB debugging enabled)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd spiq-mobile-app
```

### 2. Environment Setup
Create a `.env` file in the root directory and add:
```
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/spiq
NEXT_PUBLIC_API_URL=http://localhost:3001
ADMIN_SECRET=<your-admin-secret>
JWT_SECRET=<your-jwt-secret>
```

### 3. Install Dependencies

**Backend**
```bash
cd backend
npm install
```

**Mobile App (React Native)**
```bash
cd mobile
npm install
```

### 4. Start Development Servers

**Backend**
```bash
npm run dev
```

**Mobile App (Android)**
```bash
npx react-native run-android
```

> ✅ Ensure that Android Studio is installed and the emulator is running or a real device is connected.

---

## 🗄️ Database Setup and Configuration

1. Ensure PostgreSQL is running.

2. Create the database:
```sql
CREATE DATABASE spiq;
```

3. Run migrations:
```bash
npm run migrate
```

4. Seed initial data:
```bash
npm run seed
```

Alternatively, use the provided dump:
```bash
psql -U <user> -d spiq -f database_dump.sql
```

---

## 📱 User Interface

### Key Screens
- **Players View** – Lists all available players (without point details).
- **Team Builder** – Select 11 players within budget.
- **My Team** – Displays selected players and remaining budget.
- **Leaderboard** – Real-time ranking display with current user's highlight.

### Authentication
- Coach login is secured via token-based access only.

---

## 💬 AI Chatbot (Spiriter)
- Suggests most suitable games for athlete students.
- Give the physical stats and Body measurements of athletes.
- Always ensures fairness (e.g., does **not** reveal player points).

---

## 📌 Assumptions

- Coach have the login, students can go the app.
- Coach can add mesurements of their team players.
- 
- 
- 
- 
- 

---

## ✨ Additional Features

- Fully responsive mobile UI (built with ReactNative).
- Budget and points calculated dynamically.
- Live leaderboard with auto-refresh.
- AI-assisted team suggestions.
- Secure backend operations with token validation.

---

## 🛠️ Guidelines for Stage 2

- Ensure real-time sync across all components.
- Expand AI chatbot capabilities (e.g., player comparisons).
- Add error handling and user-friendly messages.
- Track player stats accurately during team selection.
- Implement versioning and document changes in this README.

---

## 🤝 Contribution

### Authors
- [iamindunil](https://github.com/iamindunil)  
- [dev-Dasan2000](https://github.com/dev-Dasan2000)  
- [Dilesh99](https://github.com/Dilesh99)  
- [RWSandaru8](https://github.com/RWSandaru8)  
- [NaveenSandaru](https://github.com/NaveenSandaru)
