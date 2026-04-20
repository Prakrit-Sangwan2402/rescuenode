# RescueNode 🚚

**RescueNode** is a decentralized logistics web application designed to bridge the gap between businesses with surplus essential items (like food or medicine) and verified organizations or volunteers who can distribute them to those in need.

Developed with a focus on real-time response and ease of use, RescueNode provides a powerful platform for orchestrating local community support.

## 🌟 Key Features

### 🔐 Secure Authentication & Role-Based Access
- **Dual User Roles**: Targeted experience for **Donors** (Business owners) and **Receivers** (NGOs/Volunteers).
- **Profile Management**: Automatic capture of organization details and location settings upon sign-up.
- **Protected Routing**: Enforced role-based navigation and session persistence via Firebase Auth.

### 🏢 Donor Dashboard
- **Active Posting**: Effortlessly post surplus "drops" (Food or Medicine).
- **Geolocation Integration**: Automatically attaches the donor's physical coordinates to drops for precision logistics.
- **Real-Time Tracking**: Live status updates for all posted items, showing when they are claimed or completed.

### 🗺️ Receiver Live Map
- **Interactive Leaflet Map**: Visual discovery of all active drops in the surrounding area.
- **Smart Filtering**: Quickly filter drops by category (Food vs. Medicine).
- **Dynamic Recenter**: One-click navigation to the user's current location to find nearby resources.

### ⚡ Claim & Rescue System
- **Transactional Logic**: Robust claiming process ensuring items are only handled by one receiver at a time.
- **Mission Timers**: Live countdown timers for each drop, indicating remaining shelf life.
- **Active Missions Console**: A dedicated space for receivers to manage their pickups and mark them as "Completed" once delivered.

### 🎨 Premium User Experience
- **Modern UI**: Built with React 19 and Tailwind CSS for a sleek, responsive, and mobile-friendly interface.
- **Toast Notifications**: Interactive global notification system for successful actions and error handling.
- **Loading States**: Seamless transitions and spinners across all asynchronous operations.

## 🛠️ Technology Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend/Database**: [Firebase](https://firebase.google.com/) (Authentication & Cloud Firestore)
- **Maps**: [React-Leaflet](https://react-leaflet.js.org/)
- **State Management**: React Context API

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- A Firebase Project

### Installation
1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/rescuenode.git
   cd rescuenode
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Launch the development server**:
   ```bash
   npm run dev
   ```

## 📂 Project Structure

```text
rescuenode/
├── src/
│   ├── components/     # Reusable UI components (Modals, ProtectedRoutes)
│   ├── context/        # Global state (AuthContext, ToastContext)
│   ├── pages/          # Full page views (Dashboards, Login, SignUp)
│   ├── firebase.js     # Firebase initialization and config
│   ├── App.jsx         # Main routing and application layout
│   └── main.jsx        # Entry point and providers
├── public/             # Static assets
└── .env                # Environment configuration (not tracked)
```

## 🛡️ License
This project is open-source and available under the [MIT License](LICENSE).
