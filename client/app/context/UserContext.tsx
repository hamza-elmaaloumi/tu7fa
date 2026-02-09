'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';

type UserType = {
  type: 'client' | 'maalem' | 'admin' | null;
  id: number | null;
}

type UserContextType = {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
  logout: () => void;
};

const UserContext = createContext<UserContextType | null>(null)

export default function UserProvider({ children }: { children: React.ReactNode }) {
  // Initialize with default 0
  const [user, setUser] = useState<UserType>({ type: null, id: null });
  const router = useRouter();

  // 1. On Mount: Check if there is data in localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // 2. On Change: Whenever 'user' changes, update localStorage
  useEffect(() => {
    // Only save if we have a valid user (id > 0)
    // You can adjust this logic based on how you handle logout
    if (user.id !== null) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  }, [user]);

  const logout = () => {
    setUser({ type: null, id: null });
    localStorage.removeItem('currentUser');
    router.push('/home');
  }

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) {
    throw new Error('useUser must be used inside UserProvider')
  }
  return ctx
}