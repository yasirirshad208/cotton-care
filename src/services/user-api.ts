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


// Mock database of users
const MOCK_USERS: User[] = [
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

export async function login(email: string, password // Simulate password check (in real app, this is hashed)
: string): Promise<User | null> {
  await delay(500);
  const user = MOCK_USERS.find(u => u.email === email);
  // In a real app, you'd verify the password against a hash
  if (user && password === 'password') { // For mock purposes, 'password' is the valid password for existing users
    return user;
  }
  return null;
}

export async function getUserById(userId: string): Promise<User | null> {
  await delay(200);
  const user = MOCK_USERS.find(u => u.id === userId);
  return user || null;
}

export async function signup(signupData: SignupData): Promise<User | null> {
  await delay(700);
  const existingUser = MOCK_USERS.find(u => u.email === signupData.email);
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

  MOCK_USERS.push(newUser);
  console.log("Mock API: Signed up new user", newUser);
  return newUser;
}
