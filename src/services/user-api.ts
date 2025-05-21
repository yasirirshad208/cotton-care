// src/services/user-api.ts

export interface UserAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
}
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  isAdmin: boolean;
  phone?: string;
  address?: UserAddress;
}

export interface SignupData {
  name: string;
  email: string;
  password?: string; // Password won't be stored directly in mock, but needed for API call
}

const LOCAL_STORAGE_USERS_KEY = 'cottonCareUsers';

// Initial seed data if local storage is empty
const MOCK_USERS_SEED_DATA: User[] = [
  {
    id: 'admin001',
    email: 'admin@example.com',
    name: 'Admin User',
    avatarUrl: 'https://picsum.photos/100/100?random=admin',
    isAdmin: true,
    phone: '555-0101',
    address: {
      line1: '456 Admin Lane',
      city: 'ControlCity',
      state: 'SYS',
      zip: '00001',
    },
  },
  {
    id: 'user002',
    email: 'user@example.com',
    name: 'Regular User',
    avatarUrl: 'https://picsum.photos/100/100?random=user',
    isAdmin: false,
    phone: '555-0102',
    address: {
      line1: '123 Cotton Row',
      city: 'Farmville',
      state: 'TX',
      zip: '75001',
    },
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function getUsersFromLocalStorage(): User[] {
  if (typeof window === 'undefined') return [...MOCK_USERS_SEED_DATA]; // Fallback for SSR
  try {
    const storedUsers = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    if (storedUsers) {
      return JSON.parse(storedUsers);
    } else {
      // Initialize local storage with seed data if it's empty
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(MOCK_USERS_SEED_DATA));
      return [...MOCK_USERS_SEED_DATA];
    }
  } catch (error) {
    console.error("Error accessing localStorage for users:", error);
    // Fallback to seed data on error and try to re-initialize localStorage
    try {
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(MOCK_USERS_SEED_DATA));
    } catch (initError) {
      console.error("Failed to re-initialize localStorage for users:", initError);
    }
    return [...MOCK_USERS_SEED_DATA];
  }
}

function saveUsersToLocalStorage(users: User[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("Error saving users to localStorage:", error);
  }
}

export async function login(email: string, password // Simulate password check (in real app, this is hashed)
: string): Promise<User | null> {
  await delay(500);
  const users = getUsersFromLocalStorage();
  const user = users.find(u => u.email === email);
  // In a real app, you'd verify the password against a hash
  if (user && password === 'password') { // For mock purposes, 'password' is the valid password for existing users
    return user;
  }
  return null;
}

export async function getUserById(userId: string): Promise<User | null> {
  await delay(200);
  const users = getUsersFromLocalStorage();
  const user = users.find(u => u.id === userId);
  return user || null;
}

export async function signup(signupData: SignupData): Promise<User | null> {
  await delay(700);
  let users = getUsersFromLocalStorage();
  const existingUser = users.find(u => u.email === signupData.email);
  if (existingUser) {
    // In a real API, this would likely be a 409 Conflict or similar error
    console.warn(`Signup attempt for existing email: ${signupData.email}`);
    return null; 
  }

  const newUser: User = {
    id: `user${Math.random().toString(36).substring(2, 8)}`,
    email: signupData.email,
    name: signupData.name,
    isAdmin: false, // New users are not admins by default
    avatarUrl: `https://picsum.photos/seed/${signupData.email}/100/100`, // Generate consistent avatar based on email
    // phone and address can be added later via profile edit
  };

  users.push(newUser);
  saveUsersToLocalStorage(users);
  console.log("Local Storage: Signed up new user", newUser);
  return newUser;
}
