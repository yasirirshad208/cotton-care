// src/services/user-api.ts

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  isAdmin: boolean;
}

// Mock database of users
const MOCK_USERS: User[] = [
  {
    id: 'admin001',
    email: 'admin@example.com',
    name: 'Admin User',
    avatarUrl: 'https://picsum.photos/100/100?random=admin',
    isAdmin: true,
  },
  {
    id: 'user002',
    email: 'user@example.com',
    name: 'Regular User',
    avatarUrl: 'https://picsum.photos/100/100?random=user',
    isAdmin: false,
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function login(email: string, password // Simulate password check (in real app, this is hashed)
: string): Promise<User | null> {
  await delay(500);
  const user = MOCK_USERS.find(u => u.email === email);
  // In a real app, you'd verify the password against a hash
  if (user && password === 'password') { // For mock purposes, 'password' is the valid password
    return user;
  }
  return null;
}

export async function getUserById(userId: string): Promise<User | null> {
  await delay(200);
  const user = MOCK_USERS.find(u => u.id === userId);
  return user || null;
}
