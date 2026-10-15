import { createContext, useContext, useState } from "react";

type UserContextType = {
  user: string | null;
  updateUser: (user: string) => void;
};

const UserContext = createContext<UserContextType>({
  user: null,
  updateUser: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<string | null>(localStorage.getItem("user") || null);

  const updateUser = (user: string) => {
    setUser(user);
    localStorage.setItem("user", user);
  };

  return <UserContext.Provider value={{ user, updateUser }}>{children}</UserContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
