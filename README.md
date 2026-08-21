# Smart Waste Management (SWM)

> A modern, integrated web platform for the Rajshahi City Corporation to streamline municipal waste collection, manage operational routes, and empower residents.

---

## 📖 Problem Statement

Rapid urbanization in Rajshahi City has led to increased challenges in municipal waste collection. Currently, the process relies on manual scheduling, lacks transparency for residents, and offers no centralized way for citizens to report missed pickups or request special services. This results in inefficient truck routing, uncollected waste, and citizen dissatisfaction. 

The **Smart Waste Management (SWM)** system solves this by providing a centralized digital platform where municipal staff can proactively manage zones, collection routes, and pickup schedules, while simultaneously giving residents real-time visibility into their neighborhood's collection schedule and a direct channel to report issues.

## ⚙️ Tech Stack

This project is built with a modern frontend stack and a serverless backend:

- **Frontend Framework:** React + Vite
- **Styling:** Tailwind CSS (v3)
- **Routing:** React Router DOM
- **Backend & Database:** Firebase (Cloud Firestore)
- **Authentication:** Firebase Authentication

## ✨ Key Features

### For Residents
- **Secure Registration & Login:** Residents can register and assign themselves to their specific neighborhood zone.
- **My Pickup Schedule:** View upcoming, scheduled, and resolved waste collection times based on their zone.
- **Service Requests:** Submit direct requests for missed collections or schedule special large-item pickups.

### For Administrators
- **Zone & Route Management:** Create geographical zones and assign specific collection routes, trucks, and crews to them.
- **Pickup Scheduling:** Plan and track the status of individual pickups across the city.
- **Resident & Request Management:** View registered residents and resolve their submitted service requests.

---

## 🚀 Getting Started

Follow these steps to set up the project locally for development.

### 1. Prerequisites
- Node.js installed on your machine.
- A Firebase project set up with Authentication (Email/Password) and Cloud Firestore enabled.

### 2. Clone the Repository
```bash
git clone https://github.com/badruddin-tasnim/smart-waste-collection-system.git
cd smart-waste-collection-system
```

### 3. Environment Setup (Firebase Keys)
This project uses Firebase, so you need to provide your own API keys. We have provided a template file called `.env.example`.

Copy the template file to create your own local environment file:
```bash
cp .env.example .env
```

Open `.env` in your code editor and fill in the values from your Firebase Project Settings. **Never commit the `.env` file to version control.**

### 4. Install Dependencies
Install all required Node modules:
```bash
npm install
```

### 5. Run the Development Server
Start the Vite development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

---

## 📂 Project Structure

- `docs/` — Contains all system design documentation, requirements, and data models.
- `src/components/` — Reusable React components (tables, forms, layouts).
- `src/pages/` — Top-level page views for Admin and Resident routes.
- `src/utils/` — Shared utilities and Firebase Firestore wrappers.
- `src/context/` — Global state management (e.g., AuthContext).

## 🤝 Contribution Guidelines

This project was built collaboratively using feature branches:
1. Ensure your `.env` file is properly configured.
2. Checkout a new branch for your feature (e.g., `feature/pickups`).
3. Make small, meaningful commits (e.g., `[pickups] added pickup form`).
4. Push to your branch and open a Pull Request against `main`.
