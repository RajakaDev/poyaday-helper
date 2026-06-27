import React from "react";
import ReactDOM from "react-dom/client";

import "leaflet/dist/leaflet.css";

import App from "./App";

import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";

import "./index.css";
import "./App.css";
import "./styles/vesak.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </AppProvider>
  </React.StrictMode>
);