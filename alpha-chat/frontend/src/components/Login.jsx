import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialEmail, setSocialEmail] = useState("");
  const [socialPassword, setSocialPassword] = useState("");
  const [socialConfirmPassword, setSocialConfirmPassword] = useState("");
  const [showSocialEmailInput, setShowSocialEmailInput] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.post("http://localhost:5000/api/auth/login", { emailOrMobile, password });
      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/chat");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Open social login dialog
  const initiateSocialLogin = (provider) => {
    setSelectedProvider(provider);
    setSocialEmail("");
    setSocialPassword("");
    setSocialConfirmPassword("");
    setShowSocialEmailInput(true);
    setError("");
  };

  // Complete social login
  const completeSocialLogin = async () => {
    if (!socialEmail.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!socialPassword.trim()) {
      setError("Please enter a password");
      return;
    }
    if (socialPassword !== socialConfirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError("");
      console.log(`🔵 Attempting ${selectedProvider} login with email: ${socialEmail}`);
      
      const res = await axios.post("http://localhost:5000/api/auth/social-auth", {
        email: socialEmail,
        name: socialEmail.split("@")[0],
        provider: selectedProvider,
        providerId: `${selectedProvider}_${Date.now()}`,
        password: socialPassword
      }, { timeout: 10000 });
      
      console.log(`✅ ${selectedProvider} login SUCCESS:`, res.data);
      if (res.data.user) {
        console.log("📥 Saving user to localStorage and navigating...");
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setShowSocialEmailInput(false);
        navigate("/chat");
      }
    } catch (err) {
      const fullError = `${err.message}${err.response?.data?.message ? ' - ' + err.response.data.message : ''}`;
      console.error(`❌ ${selectedProvider} login FAILED:`, fullError);
      console.error("Full Error:", err);
      setError(fullError || `${selectedProvider} login failed`);
    } finally {
      setLoading(false);
    }
  };

  if (showSocialEmailInput) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 capitalize">
            Login with {selectedProvider}
          </h2>
          
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Email Address</label>
            <input
              type="email"
              value={socialEmail}
              onChange={(e) => setSocialEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Password</label>
            <input
              type="password"
              value={socialPassword}
              onChange={(e) => setSocialPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Confirm Password</label>
            <input
              type="password"
              value={socialConfirmPassword}
              onChange={(e) => setSocialConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              disabled={loading}
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={completeSocialLogin}
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              {loading ? "Loading..." : "Login"}
            </button>
            <button
              onClick={() => setShowSocialEmailInput(false)}
              disabled={loading}
              className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Header Card */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-br from-purple-400 to-pink-400 rounded-full p-4 mb-4">
            <span className="text-4xl">💬</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent mb-2">BaatCheet</h1>
          <p className="text-gray-300 text-sm font-light">Connect with friends instantly</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
            <span>🔐</span> Welcome Back
          </h2>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl mb-6 text-sm backdrop-blur-sm">
              ⚠️ {error}
            </div>
          )}
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-gray-200 font-medium mb-2 text-sm">📧 Email or Mobile</label>
              <input
                type="text"
                value={emailOrMobile}
                onChange={(e) => setEmailOrMobile(e.target.value)}
                placeholder="your@email.com or 9876543210"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 text-white placeholder-gray-400 transition backdrop-blur-sm"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-gray-200 font-medium mb-2 text-sm">🔑 Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 text-white placeholder-gray-400 transition backdrop-blur-sm"
                disabled={loading}
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-200 transform hover:scale-105 shadow-lg mb-6"
          >
            {loading ? "🔄 Logging in..." : "🚀 Login"}
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-400/20"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white/10 text-gray-300 backdrop-blur-sm">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => initiateSocialLogin("google")}
              disabled={loading}
              className="bg-white/10 hover:bg-white/20 disabled:opacity-50 border border-white/20 text-white font-bold py-3 px-2 rounded-lg transition duration-200 transform hover:scale-105 text-sm backdrop-blur-sm flex flex-col items-center gap-1"
              title="Google"
            >
              <span className="text-xl">🔵</span>
              <span>Google</span>
            </button>
            <button
              onClick={() => initiateSocialLogin("facebook")}
              disabled={loading}
              className="bg-white/10 hover:bg-white/20 disabled:opacity-50 border border-white/20 text-white font-bold py-3 px-2 rounded-lg transition duration-200 transform hover:scale-105 text-sm backdrop-blur-sm flex flex-col items-center gap-1"
              title="Facebook"
            >
              <span className="text-xl">📘</span>
              <span>Facebook</span>
            </button>
            <button
              onClick={() => initiateSocialLogin("linkedin")}
              disabled={loading}
              className="bg-white/10 hover:bg-white/20 disabled:opacity-50 border border-white/20 text-white font-bold py-3 px-2 rounded-lg transition duration-200 transform hover:scale-105 text-sm backdrop-blur-sm flex flex-col items-center gap-1"
              title="LinkedIn"
            >
              <span className="text-xl">🔗</span>
              <span>LinkedIn</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-300 mt-8 text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="text-purple-300 hover:text-pink-300 font-bold transition">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
