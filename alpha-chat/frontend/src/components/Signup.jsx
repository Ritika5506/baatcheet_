import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialEmail, setSocialEmail] = useState("");
  const [socialPassword, setSocialPassword] = useState("");
  const [socialConfirmPassword, setSocialConfirmPassword] = useState("");
  const [showSocialEmailInput, setShowSocialEmailInput] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);

  const handleSignup = async () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!password.trim()) {
      setError("Please enter a password");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      const res = await axios.post("http://localhost:5000/api/auth/signup", { 
        name, 
        email, 
        mobile: mobile || undefined, 
        password 
      });
      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/chat");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Signup failed";
      console.error("❌ Signup error:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Open social signup dialog
  const initiateSocialSignup = (provider) => {
    setSelectedProvider(provider);
    setSocialEmail("");
    setSocialPassword("");
    setSocialConfirmPassword("");
    setShowSocialEmailInput(true);
    setError("");
  };

  // Complete social signup
  const completeSocialSignup = async () => {
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
      console.log(`🔵 Attempting ${selectedProvider} signup with email: ${socialEmail}`);
      
      const providerId = `${selectedProvider}_${Date.now()}`;
      const res = await axios.post("http://localhost:5000/api/auth/social-auth", {
        email: socialEmail,
        name: socialEmail.split("@")[0],
        provider: selectedProvider,
        providerId: providerId,
        password: socialPassword
      }, { timeout: 10000 });
      
      console.log(`✅ ${selectedProvider} signup SUCCESS:`, res.data);
      if (res.data.user) {
        console.log("📥 User created with password");
        console.log("📥 Saving user to localStorage and navigating...");
        localStorage.setItem("user", JSON.stringify(res.data.user));
        alert(`✅ Account created successfully!\n\nEmail: ${socialEmail}\nYou can now login with your password.`);
        setShowSocialEmailInput(false);
        navigate("/chat");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || `${selectedProvider} signup failed`;
      console.error(`❌ ${selectedProvider} signup FAILED:`, errorMsg);
      console.error("Full Error:", err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (showSocialEmailInput) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 capitalize">
            Sign up with {selectedProvider}
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
              onClick={completeSocialSignup}
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              {loading ? "Loading..." : "Sign Up"}
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

  // Demo social signup functions
  const handleGoogleSignup = async () => {
    initiateSocialSignup("google");
  };

  const handleFacebookSignup = async () => {
    initiateSocialSignup("facebook");
  };

  const handleLinkedInSignup = async () => {
    initiateSocialSignup("linkedin");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Header Card */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-br from-pink-400 to-purple-400 rounded-full p-4 mb-4">
            <span className="text-4xl">✨</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-300 via-purple-300 to-pink-300 bg-clip-text text-transparent mb-2">BaatCheet</h1>
          <p className="text-gray-300 text-sm font-light">Join millions chatting now</p>
        </div>

        {/* Signup Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 overflow-y-auto max-h-[90vh]">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
            <span>🎉</span> Create Account
          </h2>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl mb-6 text-sm backdrop-blur-sm">
              ⚠️ {error}
            </div>
          )}
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-gray-200 font-medium mb-2 text-sm">👤 Full Name</label>
              <input
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 text-white placeholder-gray-400 transition backdrop-blur-sm"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-gray-200 font-medium mb-2 text-sm">📧 Email</label>
              <input
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 text-white placeholder-gray-400 transition backdrop-blur-sm"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-gray-200 font-medium mb-2 text-sm">📱 Mobile (optional)</label>
              <input
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 text-white placeholder-gray-400 transition backdrop-blur-sm"
                type="text"
                placeholder="9876543210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-gray-200 font-medium mb-2 text-sm">🔒 Password</label>
              <input
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 text-white placeholder-gray-400 transition backdrop-blur-sm"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-gray-200 font-medium mb-2 text-sm">🔐 Confirm Password</label>
              <input
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 text-white placeholder-gray-400 transition backdrop-blur-sm"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            
            <button 
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200 transform hover:scale-105 shadow-lg"
              onClick={handleSignup}
              disabled={loading}
            >
              {loading ? "🔄 Creating account..." : "🚀 Sign Up"}
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-400/20"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white/10 text-gray-300 backdrop-blur-sm">Or sign up with</span>
            </div>
          </div>

          {/* Social Signup Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={handleGoogleSignup}
              disabled={loading}
              className="bg-white/10 hover:bg-white/20 disabled:opacity-50 border border-white/20 text-white font-bold py-3 px-2 rounded-lg transition duration-200 transform hover:scale-105 text-sm backdrop-blur-sm flex flex-col items-center gap-1"
              title="Google"
            >
              <span className="text-xl">🔵</span>
              <span>Google</span>
            </button>
            
            <button 
              onClick={handleFacebookSignup}
              disabled={loading}
              className="bg-white/10 hover:bg-white/20 disabled:opacity-50 border border-white/20 text-white font-bold py-3 px-2 rounded-lg transition duration-200 transform hover:scale-105 text-sm backdrop-blur-sm flex flex-col items-center gap-1"
              title="Facebook"
            >
              <span className="text-xl">📘</span>
              <span>Facebook</span>
            </button>
            
            <button 
              onClick={handleLinkedInSignup}
              disabled={loading}
              className="bg-white/10 hover:bg-white/20 disabled:opacity-50 border border-white/20 text-white font-bold py-3 px-2 rounded-lg transition duration-200 transform hover:scale-105 text-sm backdrop-blur-sm flex flex-col items-center gap-1"
              title="LinkedIn"
            >
              <span className="text-xl">🔗</span>
              <span>LinkedIn</span>
            </button>
          </div>
          
          {/* Footer */}
          <p className="mt-8 text-center text-gray-300 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-pink-300 hover:text-purple-300 font-bold transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
