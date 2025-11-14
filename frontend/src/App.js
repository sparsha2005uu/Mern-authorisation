// frontend/src/App.js
import React, { useState } from "react";
import Signup from "./Signup";
import Login from "./Login";
import Home from "./Home";

function App() {
  const [page, setPage] = useState(() =>
    localStorage.getItem("token") ? "home" : "signup"
  );

  return (
    <div>
      {page === "signup" && <Signup setPage={setPage} />}
      {page === "login" && <Login onLogin={() => setPage("home")} />}
      {page === "home" && <Home onLogout={() => setPage("login")} />}
    </div>
  );
}

export default App;