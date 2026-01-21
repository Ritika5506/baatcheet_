import React, { useEffect, useState } from "react";
import axios from "axios";

const UserList = ({ onSelectUser }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get("https://baatcheet-2-xd3b.onrender.com/api/users")
      .then(res => setUsers(res.data))
      .catch(err => console.log("Error fetching users:", err));
  }, []);

  return (
    <div className="w-1/4 bg-gray-100 p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Online Users</h2>
      {users.length === 0 ? (
        <p className="text-gray-500">No users available</p>
      ) : (
        users.map(user => (
          <div
            key={user._id}
            className="p-3 bg-white mb-2 cursor-pointer hover:bg-gray-200 rounded"
            onClick={() => onSelectUser(user)}
          >
            <p className="font-semibold text-sm">{user.name}</p>
            <p className="text-xs text-gray-600">{user.email}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default UserList;
