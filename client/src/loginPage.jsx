import React, { useState } from "react";
import LoginFacade from "./services/loginFacade";

// Component for the login page
const Login = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notification, setNotification] = useState("");

  // Function to handle the login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailRegex =
      /^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]{1,253}\.[A-Za-z]{2,10}$/;
    const isEmail = emailRegex.test(usernameOrEmail);
    const loginType = isEmail ? "Email" : "Username";

    try {
      const response =
        loginType === "Email"
          ? await LoginFacade.loginByEmail(usernameOrEmail, password)
          : await LoginFacade.loginByUsername(usernameOrEmail, password);

      if (response.token) {
        setNotification("Login avvenuto con successo!");
        localStorage.setItem("token", response.token);

        // Decode the token to get the user's role
        const payload = JSON.parse(atob(response.token.split(".")[1]));
        const role = payload.role;

        // Redirect based on role
        if (role === "admin") {
          window.location.href = "/admin/adminTicketDashboard";
        } else {
          window.location.href = "/homepage";
        }
      } else {
        setNotification(`Errore durante il login: ${response.message}`);
      }
    } catch (error) {
      console.error("Errore durante il login:", error);
      setNotification(error.message);
    }
  };

  // Return the login form
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="card-body py-8 px-6 bg-white rounded shadow-md">
        <h1 className="text-[#f7d1cd] font-bold text-2xl text-center mb-6">
          Login
        </h1>
        {notification && (
          <div className="mb-4 text-center text-red-500">{notification}</div>
        )}
        <form className="flex flex-col items-center" onSubmit={handleSubmit}>
          <div className="mb-4 w-72">
            <label className="block text-white font-bold mb-2 text-center text-sm">
              Username o Email
            </label>
            <input
              type="text"
              className="rounded-2xl w-72 h-8 pl-2 border"
              placeholder="Username o Email"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
            />
          </div>
          <div className="mb-6 w-72 justify-center">
            <label className="block text-white font-bold mb-2 text-center text-sm">
              Password
            </label>
            <input
              type="password"
              className="rounded-2xl w-72 h-8 pl-2 border"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="button-CD py-2 px-8 text-xl">
            Login
          </button>
          <div className="mt-4">
            <a
              href="/forgot-password"
              className="text-blue-500 hover:underline"
            >
              Forgot Password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
