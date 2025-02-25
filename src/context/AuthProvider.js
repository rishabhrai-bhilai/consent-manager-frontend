// AuthProvider.js
import { createContext, useState ,useContext} from "react";

const AuthContext = createContext(null);

// Export the useAuth hook as a named export
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);

  const login = (user, role, accessToken, userId) => {
    setAuth({ user, role, accessToken, userId });
  };

  const logout = () => {
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};