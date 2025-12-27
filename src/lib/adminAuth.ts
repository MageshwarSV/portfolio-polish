// Admin authentication utilities with Firebase and JWT-style session
import { db } from './firebase';
import { ref, get, set, update } from 'firebase/database';
import emailjs from '@emailjs/browser';

// EmailJS Configuration (same as contact form)
const EMAILJS_SERVICE_ID = "service_aynrf47";
const EMAILJS_TEMPLATE_ID = "template_j53xky4";
const EMAILJS_PUBLIC_KEY = "xF9Mfy6lITPFqxzjc";
const ADMIN_EMAIL = "mageshwar.offic@gmail.com";

// Session expiry: 2 hours in milliseconds
const SESSION_EXPIRY_MS = 2 * 60 * 60 * 1000;

// OTP expiry: 5 minutes
const OTP_EXPIRY_MS = 5 * 60 * 1000;

// Session storage interface
interface AdminSession {
  isLoggedIn: boolean;
  username: string;
  loginTime: number;
  expiryTime: number;
}

// Simple hash function (for demo - in production use bcrypt)
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

// Initialize default admin user in Firebase if not exists
export const initializeAdminUser = async () => {
  try {
    const adminRef = ref(db, 'admin/user');
    const snapshot = await get(adminRef);

    if (!snapshot.exists()) {
      // Create default admin user
      await set(adminRef, {
        username: 'mageshwar',
        email: ADMIN_EMAIL,
        password: simpleHash('AvInAsH@2003'),
        createdAt: Date.now()
      });
      console.log('Default admin user created in Firebase');
    }
  } catch (error) {
    console.error('Error initializing admin user:', error);
  }
};

// Get admin user from Firebase
export const getAdminUser = async (): Promise<any> => {
  try {
    const adminRef = ref(db, 'admin/user');
    const snapshot = await get(adminRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
  } catch (error) {
    console.error('Error getting admin user:', error);
  }
  return null;
};

// Check if session is valid (not expired)
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;

  const sessionData = localStorage.getItem('admin_session');
  if (!sessionData) return false;

  try {
    const session: AdminSession = JSON.parse(sessionData);
    const now = Date.now();

    // Check if session has expired
    if (now > session.expiryTime) {
      // Session expired - auto logout
      logout();
      return false;
    }

    return session.isLoggedIn;
  } catch {
    return false;
  }
};

// Get session info
export const getSessionInfo = (): AdminSession | null => {
  if (typeof window === 'undefined') return null;

  const sessionData = localStorage.getItem('admin_session');
  if (!sessionData) return null;

  try {
    return JSON.parse(sessionData);
  } catch {
    return null;
  }
};

// Login with Firebase credentials
export const login = async (username: string, password: string): Promise<boolean> => {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      // Try initializing admin user first
      await initializeAdminUser();
      return false;
    }

    const hashedPassword = simpleHash(password);

    if (adminUser.username === username && adminUser.password === hashedPassword) {
      const now = Date.now();
      const session: AdminSession = {
        isLoggedIn: true,
        username: username,
        loginTime: now,
        expiryTime: now + SESSION_EXPIRY_MS
      };

      localStorage.setItem('admin_session', JSON.stringify(session));
      return true;
    }
  } catch (error) {
    console.error('Login error:', error);
  }

  return false;
};

// Logout
export const logout = (): void => {
  localStorage.removeItem('admin_session');
};

// Generate 6-digit OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP in Firebase temporarily
export const storeOTP = async (email: string, otp: string): Promise<boolean> => {
  try {
    const otpRef = ref(db, 'admin/otp');
    await set(otpRef, {
      otp: otp,
      email: email,
      createdAt: Date.now(),
      expiresAt: Date.now() + OTP_EXPIRY_MS,
      attempts: 0
    });
    return true;
  } catch (error) {
    console.error('Error storing OTP:', error);
    return false;
  }
};

// Verify OTP
export const verifyOTP = async (inputOTP: string): Promise<{ success: boolean; message: string }> => {
  try {
    const otpRef = ref(db, 'admin/otp');
    const snapshot = await get(otpRef);

    if (!snapshot.exists()) {
      return { success: false, message: 'No OTP found. Please request a new one.' };
    }

    const otpData = snapshot.val();
    const now = Date.now();

    // Check expiry
    if (now > otpData.expiresAt) {
      await set(otpRef, null); // Clear expired OTP
      return { success: false, message: 'OTP has expired. Please request a new one.' };
    }

    // Check attempts
    if (otpData.attempts >= 3) {
      await set(otpRef, null); // Clear after max attempts
      return { success: false, message: 'Too many attempts. Please request a new OTP.' };
    }

    // Verify OTP
    if (otpData.otp === inputOTP) {
      await set(otpRef, null); // Clear used OTP
      return { success: true, message: 'OTP verified successfully!' };
    } else {
      // Increment attempts
      await update(otpRef, { attempts: otpData.attempts + 1 });
      return { success: false, message: `Invalid OTP. ${2 - otpData.attempts} attempts remaining.` };
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { success: false, message: 'Error verifying OTP. Please try again.' };
  }
};

// Send OTP via EmailJS
export const sendOTPEmail = async (email: string, username: string, otp: string): Promise<boolean> => {
  try {
    const templateParams = {
      to_email: ADMIN_EMAIL,
      from_name: 'Portfolio Admin System',
      subject: 'Password Reset OTP',
      message: `Your OTP for password reset is: ${otp}\n\nUsername: ${username}\nRequested for email: ${email}\n\nThis OTP is valid for 5 minutes.\n\nIf you did not request this, please ignore this email.`
    };

    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
};

// Check if email exists (for forgot password)
export const checkEmailExists = async (email: string): Promise<{ exists: boolean; username: string | null }> => {
  try {
    const adminUser = await getAdminUser();
    if (adminUser && adminUser.email === email) {
      return { exists: true, username: adminUser.username };
    }
  } catch (error) {
    console.error('Error checking email:', error);
  }
  return { exists: false, username: null };
};

// Update password in Firebase
export const updatePassword = async (newPassword: string): Promise<boolean> => {
  try {
    const adminRef = ref(db, 'admin/user');
    await update(adminRef, {
      password: simpleHash(newPassword),
      updatedAt: Date.now()
    });
    return true;
  } catch (error) {
    console.error('Error updating password:', error);
    return false;
  }
};

// Session expiry checker - call this on app load
export const checkSessionExpiry = (): void => {
  if (typeof window === 'undefined') return;

  const session = getSessionInfo();
  if (session && Date.now() > session.expiryTime) {
    logout();
  }
};
