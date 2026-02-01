import bcrypt from 'bcryptjs';
import * as repo from './repository.js';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import type * as schema from './db/schema.js';

type DB = DrizzleD1Database<typeof schema>;

const SALT_ROUNDS = 10;
const SESSION_DURATION_DAYS = 30;

// Password hashing
export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return bcrypt.compare(password, hash);
}

// Session management
export async function createUserSession(db: DB, userId: number): Promise<string> {
	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);
	return repo.createSession(db, userId, expiresAt);
}

export async function validateSession(db: DB, sessionId: string) {
	const session = await repo.getSession(db, sessionId);

	if (!session) {
		return null;
	}

	// Check if session is expired
	if (new Date(session.expiresAt) < new Date()) {
		await repo.deleteSession(db, sessionId);
		return null;
	}

	return session;
}

export async function invalidateSession(db: DB, sessionId: string) {
	return repo.deleteSession(db, sessionId);
}

// User registration with first-user-is-admin logic
export async function registerUser(db: DB, username: string, password: string) {
	// Check if this is the first user
	const isFirstUser = await repo.isUsersTableEmpty(db);

	// Hash password
	const passwordHash = await hashPassword(password);

	// Create user (first user becomes admin)
	const user = await repo.createUser(db, username, passwordHash, isFirstUser);

	return user;
}

// User authentication
export async function authenticateUser(db: DB, username: string, password: string) {
	const user = await repo.getUserByUsername(db, username);

	if (!user) {
		return null;
	}

	const isValid = await verifyPassword(password, user.passwordHash);

	if (!isValid) {
		return null;
	}

	return user;
}

// Cookie helpers
export const SESSION_COOKIE_NAME = 'session';
export const CSRF_COOKIE_NAME = 'CSRF-TOKEN';

export function generateCsrfToken(): string {
	return crypto.randomUUID();
}

export function getSessionCookieOptions(expiresInDays: number = SESSION_DURATION_DAYS) {
	return {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax' as const,
		maxAge: 60 * 60 * 24 * expiresInDays
	};
}

export function getCsrfCookieOptions() {
	return {
		path: '/',
		httpOnly: false, // Needs to be readable by JavaScript
		secure: true,
		sameSite: 'lax' as const,
		maxAge: 60 * 60 * 24 * SESSION_DURATION_DAYS
	};
}
