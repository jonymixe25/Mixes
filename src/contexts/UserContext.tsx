import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db, logout as firebaseLogout } from "../firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface User {
  id: string;
  email: string;
  name: string;
  photoUrl?: string;
  role?: "admin" | "user";
  isAdmin?: boolean;
  isFirebase?: boolean;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("broadcaster_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (uid: string, email: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        return userDoc.data().role as "admin" | "user";
      } else {
        // Default admin for the super user
        const role = email === "mixecultura25@gmail.com" ? "admin" : "user";
        // Create user doc if it doesn't exist
        await setDoc(doc(db, "users", uid), {
          uid,
          email,
          role,
          displayName: auth.currentUser?.displayName || email.split('@')[0],
          photoURL: auth.currentUser?.photoURL || ""
        });
        return role;
      }
    } catch (err) {
      console.error("Error fetching user role:", err);
      return email === "mixecultura25@gmail.com" ? "admin" : "user";
    }
  };

  const refreshUser = async () => {
    setLoading(true);
    const currentUser = auth.currentUser;
    if (currentUser) {
      const role = await fetchUserRole(currentUser.uid, currentUser.email || "");
      const userData: User = {
        id: currentUser.uid,
        email: currentUser.email || "",
        name: currentUser.displayName || currentUser.email?.split('@')[0] || "Usuario",
        photoUrl: currentUser.photoURL || undefined,
        role,
        isAdmin: role === "admin",
        isFirebase: true
      };
      setUser(userData);
      localStorage.setItem("broadcaster_user", JSON.stringify(userData));
    }
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const role = await fetchUserRole(firebaseUser.uid, firebaseUser.email || "");
        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "Usuario",
          photoUrl: firebaseUser.photoURL || undefined,
          role,
          isAdmin: role === "admin",
          isFirebase: true
        };
        setUser(userData);
        localStorage.setItem("broadcaster_user", JSON.stringify(userData));
      } else {
        // Only clear if the current user was a Firebase user
        setUser(prev => {
          if (prev?.isFirebase) {
            localStorage.removeItem("broadcaster_user");
            return null;
          }
          return prev;
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("broadcaster_user", JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await firebaseLogout();
      setUser(null);
      localStorage.removeItem("broadcaster_user");
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
