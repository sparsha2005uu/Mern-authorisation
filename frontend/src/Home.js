// frontend/src/Home.js
import React from "react";

function Home({ onLogout }) {
  const handleLogout = () => {
    localStorage.removeItem("token");
    onLogout();
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome to Home Page 🏠</h1>
      <p>This page is protected and visible only after login.</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Home;