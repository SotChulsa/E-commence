import React, { useEffect, useState } from "react";

// Mock users + students
const mockUsers = [
  { _id: "1", name: "Minh Chul", email: "minhchul1@example.com", role: "user" },
  { _id: "2", name: "Sophea", email: "sophea2@example.com", role: "admin" },
  { _id: "3", name: "Rithy", email: "rithy3@example.com", role: "user" },
  { _id: "4", name: "Dara", email: "dara4@example.com", role: "user" },
  { _id: "5", name: "Sokha", email: "sokha5@example.com", role: "user" },
  { _id: "6", name: "Chenda", email: "chenda6@example.com", role: "user" },
  { _id: "7", name: "Vanna", email: "vanna7@example.com", role: "user" },
  { _id: "8", name: "Srey Neang", email: "sreyneang8@example.com", role: "admin" },
  { _id: "9", name: "Pisey", email: "pisey9@example.com", role: "user" },
  { _id: "10", name: "Rattanak", email: "rattanak10@example.com", role: "user" },
  { _id: "11", name: "Monika", email: "monika11@example.com", role: "user" },
  { _id: "12", name: "Chakra", email: "chakra12@example.com", role: "user" },
  { _id: "13", name: "Kosal", email: "kosal13@example.com", role: "user" },
  { _id: "14", name: "Sophal", email: "sophal14@example.com", role: "user" },
  { _id: "15", name: "Nary", email: "nary15@example.com", role: "admin" },
  { _id: "16", name: "Vicheka", email: "vicheka16@example.com", role: "user" },
  { _id: "17", name: "Sreymom", email: "sreymom17@example.com", role: "user" },
  { _id: "18", name: "Borey", email: "borey18@example.com", role: "user" },
  { _id: "19", name: "Sovann", email: "sovann19@example.com", role: "user" },
  { _id: "20", name: "Sreypov", email: "sreypov20@example.com", role: "user" },
  { _id: "21", name: "Chhon", email: "chhon21@example.com", role: "user" },
  { _id: "22", name: "Srey Nita", email: "sreynita22@example.com", role: "user" },
  { _id: "23", name: "Pich", email: "pich23@example.com", role: "user" },
  { _id: "24", name: "Malis", email: "malis24@example.com", role: "user" },
  { _id: "25", name: "Sophaline", email: "sophaline25@example.com", role: "admin" },
  { _id: "26", name: "Rachana", email: "rachana26@example.com", role: "user" },
  { _id: "27", name: "Sokunthea", email: "sokunthea27@example.com", role: "user" },
  { _id: "28", name: "Sokly", email: "sokly28@example.com", role: "user" },
  { _id: "29", name: "Sopheak", email: "sopheak29@example.com", role: "user" },
  { _id: "30", name: "Chantha", email: "chantha30@example.com", role: "user" },
  { _id: "31", name: "Sovanna", email: "sovanna31@example.com", role: "user" },
  { _id: "32", name: "Vuthy", email: "vuthy32@example.com", role: "user" },
  { _id: "33", name: "Monorom", email: "monorom33@example.com", role: "user" },
  { _id: "34", name: "Sreymuch", email: "sreymuch34@example.com", role: "admin" },
  { _id: "35", name: "Bopha", email: "bopha35@example.com", role: "user" },
  { _id: "36", name: "Sokhom", email: "sokhom36@example.com", role: "user" },
  { _id: "37", name: "Rith", email: "rith37@example.com", role: "user" },
  { _id: "38", name: "Channary", email: "channary38@example.com", role: "user" },
  { _id: "39", name: "Srey Leak", email: "sreyleak39@example.com", role: "user" },
  { _id: "40", name: "Sopheap", email: "sopheap40@example.com", role: "user" },
  { _id: "41", name: "Vicheth", email: "vicheth41@example.com", role: "user" },
  { _id: "42", name: "Phirun", email: "phirun42@example.com", role: "user" },
  { _id: "43", name: "Ravy", email: "ravy43@example.com", role: "user" },
  { _id: "44", name: "Sophalin", email: "sophalin44@example.com", role: "user" },
  { _id: "45", name: "Chanrith", email: "chanrith45@example.com", role: "user" },
];

const mockStudents = [
  { _id: "101", name: "Kimleng", email: "kimleng101@student.com", role: "student" },
  { _id: "102", name: "Sreypov", email: "sreypov102@student.com", role: "student" },
  { _id: "103", name: "Ratanak", email: "ratanak103@student.com", role: "student" },
  { _id: "104", name: "Vannak", email: "vannak104@student.com", role: "student" },
  { _id: "105", name: "Sreynich", email: "sreynich105@student.com", role: "student" },
  { _id: "106", name: "Channy", email: "channy106@student.com", role: "student" },
  { _id: "107", name: "Sopheak", email: "sopheak107@student.com", role: "student" },
  { _id: "108", name: "Sokunthea", email: "sokunthea108@student.com", role: "student" },
  { _id: "109", name: "Ravy", email: "ravy109@student.com", role: "student" },
  { _id: "110", name: "Sokha", email: "sokha110@student.com", role: "student" },
];

const Users = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // fetch users from backend
    fetch("http://localhost:5000/admin/users")
      .then((res) => res.json())
      .then((data) => {
        // combine backend users + mock data
        const combined = [...mockUsers, ...mockStudents, ...data];
        setUsers(combined);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        // fallback to mock data only
        setUsers([...mockUsers, ...mockStudents]);
      });
  }, []);

  return (
    <div className="users-container">
      <h2>All Users & Students</h2>
      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Email</th><th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="4">No users found</td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user._id}>
                <td>{user._id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Users;