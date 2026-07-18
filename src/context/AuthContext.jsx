import { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [email, setEmail] = useState(localStorage.getItem('email') || null);
  const [role, setRole] = useState(localStorage.getItem('role') || null);

  const login = (newToken, userEmail, userRole) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('email', userEmail);
    localStorage.setItem('role', userRole);
    setToken(newToken);
    setEmail(userEmail);
    setRole(userRole);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    setToken(null);
    setEmail(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ token, email, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}