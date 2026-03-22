import React, { createContext, useContext } from "react";

interface AuthContextValue {
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue>({ signOut: () => {} });

export const AuthProvider = AuthContext.Provider;
export const useAuth = () => useContext(AuthContext);
