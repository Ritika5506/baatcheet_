import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ selectUser, currentUser, unreadMessages = {} }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Fetch all users except current user
    axios.get("http://localhost:5000/api/users")
      .then(res => {
        const filteredUsers = res.data.filter(u => u._id !== currentUser?._id);
        setUsers(filteredUsers);
      })
      .catch(err => console.log("Error fetching users:", err));
  }, [currentUser?._id]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-1/4 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white h-screen overflow-y-auto flex flex-col shadow-xl">
      {/* Header */}
      <div className="p-5 border-b border-slate-700 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-1">👤 {currentUser?.name}</h3>
          <p className="text-sm text-blue-100">{currentUser?.email}</p>
        </div>
        <button 
          className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-bold py-2 px-4 rounded-lg transition transform hover:scale-105"
          onClick={handleLogout}
        >
          🚪 Logout
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-slate-700">
        <input
          type="text"
          placeholder="🔍 Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto p-3">
        <h2 className="text-sm font-bold text-slate-400 px-3 py-2 mb-2">💬 CONTACTS ({filteredUsers.length})</h2>
        <div className="space-y-2">
          {filteredUsers.length === 0 ? (
            <p className="text-center text-slate-400 py-4 text-sm">No users found</p>
          ) : (
            filteredUsers.map(user => (
              <div
                key={user._id}
                className="p-4 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-blue-600 hover:to-purple-600 rounded-xl cursor-pointer transition transform hover:scale-105 flex justify-between items-center group"
                onClick={() => selectUser(user)}
              >
                <div className="flex-1">
                  <p className="font-bold text-white group-hover:text-blue-100">👤 {user.name}</p>
                  <p className="text-xs text-slate-300 group-hover:text-blue-100">📧 {user.email}</p>
                </div>
                {unreadMessages[user._id] > 0 && (
                  <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full px-3 py-1 ml-2 animate-pulse">
                    {unreadMessages[user._id]}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 bg-slate-900 text-center text-xs text-slate-400">
        💬 BaatCheet v1.0
      </div>
    </div>
  );
};

export default Sidebar;
