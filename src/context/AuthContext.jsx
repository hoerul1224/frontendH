import { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [email, setEmail] = useState(localStorage.getItem('email') || null);
  const [role, setRole] = useState(localStorage.getItem('role') || null);
  const [username, setUsername] = useState(localStorage.getItem('username') || null);

  const login = (newToken, userEmail, userRole, userUsername) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('email', userEmail);
    localStorage.setItem('role', userRole);
    localStorage.setItem('username', userUsername || '');
    setToken(newToken);
    setEmail(userEmail);
    setRole(userRole);
    setUsername(userUsername || '');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    setToken(null);
    setEmail(null);
    setRole(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ token, email, role, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}