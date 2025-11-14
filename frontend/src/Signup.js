// frontend/src/Signup.js
import React, { useState } from "react";
import axios from "axios";

function Signup({ setPage }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/signup",
        formData,
        { headers: { "Content-Type": "application/json" } }
      );
      alert(res.data.msg);
      setFormData({ email: "", password: "" });
      setPage("login"); // ✅ Go to Login after signup
    } catch (err) {
      const msg = err.response?.data?.msg || "An unknown error occurred.";
      alert("Registration Failed: " + msg);
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Sign Up</h2>
      <form
        onSubmit={onSubmit}
        style={{ maxWidth: "300px", margin: "0 auto" }}
      >
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={onChange}
          required
          style={{
            display: "block",
            width: "100%",
            margin: "10px 0",
            padding: "10px",
          }}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={onChange}
          required
          minLength="6"
          style={{
            display: "block",
            width: "100%",
            margin: "10px 0",
            padding: "10px",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            backgroundColor: "lightblue",
            border: "none",
            cursor: "pointer",
          }}
        >
          Sign Up
        </button>
      </form>

      {/* ✅ This is the only link now */}
      <p style={{ marginTop: "20px" }}>
        Already have an account?{" "}
        <button
          onClick={() => setPage("login")}
          style={{
            background: "none",
            border: "none",
            color: "blue",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          Login
        </button>
      </p>
    </div>
  );
}

export default Signup;