import React, { createContext, useContext, useEffect, useState } from "react";

type User = { sub: string; email?: string; name?: string; picture?: string };
type Ctx = {
  user: User | null;
  isLoading: boolean;
  setUserFromIdToken: (idToken: string) => void;
  logout: () => void;
};

const AuthCtx = createContext<Ctx | null>(null);
export const useAuth = () => useContext(AuthCtx)!;

function decodeJwt<T = any>(jwt: string): T | null {
  try {
    const [, payload] = jwt.split(".");
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("demo_user");
    if (raw) setUser(JSON.parse(raw));
    setIsLoading(false);
  }, []);

  function setUserFromIdToken(idToken: string) {
    const claims = decodeJwt<User>(idToken);
    const u: User = {
      sub: claims?.sub ?? crypto.randomUUID(),
      email: claims?.email,
      name: claims?.name,
      picture: claims?.picture,
    };
    localStorage.setItem("demo_user", JSON.stringify(u));
    setUser(u);
  }

  function logout() {
    localStorage.removeItem("demo_user");
    setUser(null);
  }

  return (
    <AuthCtx.Provider value={{ user, isLoading, setUserFromIdToken, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}