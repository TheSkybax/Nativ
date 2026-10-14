import { compare, hash } from "bcryptjs";

export type AuthUser = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  passwordHash: string;
  verified: boolean;
  bio: string;
  createdAt: string;
};

const userStore = new Map<string, AuthUser>();

const toSafeUser = (user: AuthUser) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  displayName: user.displayName,
  verified: user.verified,
  bio: user.bio,
  createdAt: user.createdAt
});

export async function registerUser(input: {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}) {
  const username = input.username.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password.trim();

  if (!username || !email || !password) {
    throw new Error("Username, email, and password are required.");
  }

  if (username.length < 3) {
    throw new Error("Username must be at least 3 characters.");
  }

  if (userStore.has(username.toLowerCase())) {
    throw new Error("That username is already taken.");
  }

  const passwordHash = await hash(password, 12);
  const user: AuthUser = {
    id: `user-${Date.now()}`,
    username: username.toLowerCase(),
    email,
    displayName: input.displayName?.trim() || username,
    passwordHash,
    verified: false,
    bio: "New to Nativ.",
    createdAt: new Date().toISOString()
  };

  userStore.set(user.username, user);
  return toSafeUser(user);
}

export async function authenticateUser(input: {
  username: string;
  password: string;
}) {
  const username = input.username.trim().toLowerCase();
  const password = input.password.trim();

  const user = userStore.get(username);
  if (!user) {
    throw new Error("Invalid username or password.");
  }

  const valid = await compare(password, user.passwordHash);
  if (!valid) {
    throw new Error("Invalid username or password.");
  }

  return toSafeUser(user);
}

export function getUserSnapshot(username: string) {
  const user = userStore.get(username.trim().toLowerCase());
  return user ? toSafeUser(user) : null;
}
