
import { User } from '../types';

// Using localStorage to simulate a database for the purpose of this demonstration
const USERS_KEY = 'studyeasier_users';
const SESSION_KEY = 'studyeasier_session';

export const signup = async (name: string, email: string, password: string): Promise<User> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  
  if (users.find((u: any) => u.email === email)) {
    throw new Error('User already exists with this email.');
  }

  // FIX: Set defaultMode to 'study' as 'general' is not a valid AIMode value
  const newUser = {
    id: Math.random().toString(36).substr(2, 9),
    name,
    email,
    password, // In a real app, this would be hashed on the server
    preferences: {
      theme: 'dark' as const,
      defaultMode: 'study' as const,
    },
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword as User;
};

export const login = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  await new Promise(resolve => setTimeout(resolve, 800));

  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const user = users.find((u: any) => u.email === email && u.password === password);

  if (!user) {
    throw new Error('Invalid email or password.');
  }

  const token = btoa(JSON.stringify({ id: user.id, email: user.email, exp: Date.now() + 86400000 }));
  const { password: _, ...userWithoutPassword } = user;

  localStorage.setItem(SESSION_KEY, JSON.stringify({ user: userWithoutPassword, token }));
  
  return { user: userWithoutPassword as User, token };
};

export const logout = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentSession = (): { user: User; token: string } | null => {
  const session = localStorage.getItem(SESSION_KEY);
  if (!session) return null;
  return JSON.parse(session);
};
