
import { User } from '../types';

// Using localStorage to simulate a database
const USERS_KEY = 'studyeasier_users';
const SESSION_KEY = 'studyeasier_session';

// Temporary store for OTPs (In a real app, this is server-side)
let tempOtpStore: Record<string, { otp: string; data: any }> = {};

export const sendVerificationOtp = async (name: string, email: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  if (users.find((u: any) => u.email === email)) {
    throw new Error('An account with this email already exists.');
  }

  // Generate a random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store it temporarily for verification
  tempOtpStore[email] = { otp, data: { name, email } };
  
  // Simulate sending email
  console.log(`[SIMULATED EMAIL] To: ${email} | Subject: Your Verification Code | Body: ${otp}`);
  alert(`SIMULATED EMAIL SENT TO ${email}\nYour OTP is: ${otp}`);
  
  return otp;
};

export const verifyOtpAndSignup = async (email: string, otp: string, password: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 800));

  const storedData = tempOtpStore[email];
  
  if (!storedData || storedData.otp !== otp) {
    throw new Error('Invalid verification code. Please try again.');
  }

  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  
  const newUser = {
    id: Math.random().toString(36).substr(2, 9),
    name: storedData.data.name,
    email: storedData.data.email,
    password, 
    preferences: {
      theme: 'dark' as const,
      defaultMode: 'study' as const,
    },
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  // Clear the used OTP
  delete tempOtpStore[email];

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
