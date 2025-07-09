# 🥂 Aurelia Valencourt Client

**[aureliavalencourt.com](https://aureliavalencourt.com)**

Meet **Aurelia**, an AI mixologist working to stir the human spirit. Discover expertly crafted drink recipes blending tradition and innovation. Learn, explore, impress, and savor every sip. Cheers!

This is the frontend codebase for the Aurelia Valencourt website — a sleek, modern web experience built with **Next.js**, **React**, and **GraphQL**, featuring intelligent recommendations, engaging visuals, and progressive web app (PWA) capabilities.

---

## 🍸 Key Features

* 🤖 **AI-Powered Mixology** — Discover drinks designed with machine intelligence and human taste
* 🍹 **Expert Recipes** — Classic, modern, and creative cocktail recipes
* 🎨 **Beautiful UI** — Built with Material UI and Emotion for a refined, mobile-friendly design
* ⚛️ **Next.js + React** — Fast, dynamic routing with server-side rendering and static generation
* 🔗 **GraphQL + Apollo** — Real-time data fetching with efficient caching
* 🧠 **Redux Toolkit** — Scalable global state management
* 📊 **Google Analytics + Mixpanel** — Track user insights and engagement
* 🛜 **Offline Ready** — PWA support via `next-pwa`
* 🎉 **Confetti, animations, carousels** — Because cocktails should be fun

---

## 🚀 Getting Started

### Clone the project

```bash
git clone git@github.com:venepe/aurelia-valencourt.git
cd aurelia-valencourt
npm install
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for production

```bash
npm run build
npm run start
```

---

## 🌐 Live Site

Visit 👉 [**aureliavalencourt.com**](https://aureliavalencourt.com)

---

## 📁 Tech Overview

| Category    | Tech Stack                              |
| ----------- | --------------------------------------- |
| Framework   | Next.js, React 18                       |
| Styling     | Material UI 6, Emotion, Framer Motion   |
| Data Layer  | Apollo Client, GraphQL, Redux Toolkit   |
| Auth        | JWT (via `jwt-decode`)                  |
| Analytics   | Google Analytics, Mixpanel              |
| UI Features | Confetti, Carousels, Transitions        |
| Utility     | Axios, UUID, Debounce, Device Detection |
| PWA Support | `next-pwa`, Offline Cache               |
| Testing     | React Testing Library, Jest             |

---

## 🌍 Browser Support

Compatible with modern browsers:

```json
"browserslist": {
  "production": [">0.2%", "not dead", "not op_mini all"],
  "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
}
```

---
