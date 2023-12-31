import crypto from 'crypto';
import prisma from '../../database/index.mjs';

import { getUserIdFromToken } from '../services/auth.service.mjs';

import { excludeFields } from '../util/helpers.mjs';
import { HttpError } from './http-error.mjs';

async function createUser(email, password, role) {
	try {
		const existingUser = await findUserByEmail(email);
		if (existingUser) {
			return new HttpError(
				'Email is already taken, please provide another email address.',
				400
			);
		}
		let salt = generateSalt(32);
		let hashedPassword = sha512(password.toString(), salt);

		const createdUser = await prisma.user.create({
			data: {
				email: email,
				password: hashedPassword,
				passwordSalt: salt,
				role: role
			}
		});
		return createdUser;
	} catch (error) {
		throw error;
	}
}

async function isUserAuthorized(email, password) {
	try {
		const user = await findUserByEmail(email);
		if (!user) {
			return new HttpError("A user with this email doesn't exist.", 401);
		}

		let hashedPasswordFromRequest = sha512(password, user.passwordSalt);
		if (hashedPasswordFromRequest !== user.password) {
			return new HttpError(
				'Provided password is incorrect for this user.',
				401
			);
		}

		const userWithoutPassord = excludeFields(user, [
			'password',
			'passwordSalt'
		]);
		return userWithoutPassord;
	} catch (error) {
		throw error;
	}
}

async function findUserById(userId) {
	try {
		const user = await prisma.user.findUnique({
			where: {
				id: userId
			}
		});

		return user;
	} catch (error) {
		throw error;
	}
}

async function updateUserPassword(user, newPassword) {
	try {
		let salt = generateSalt(32);
		let hashedPassword = sha512(newPassword, salt);

		const updatedUser = await prisma.user.update({
			where: {
				id: user.id
			},
			data: {
				password: hashedPassword,
				passwordSalt: salt,
				lastModified: new Date()
			}
		});

		const userToReturn = excludeFields(updatedUser, [
			'id',
			'password',
			'passwordSalt',
			'accessToken',
			'refreshToken'
		]);
		return userToReturn;
	} catch (error) {
		throw error;
	}
}

async function findUserByEmail(email) {
	try {
		const user = await prisma.user.findUnique({
			where: {
				email: email
			}
		});
		return user;
	} catch (error) {
		throw error;
	}
}

async function getUserTokens(token) {
	try {
		const userId = getUserIdFromToken(token);

		const user = await prisma.user.findUnique({
			where: {
				id: userId
			}
		});

		if (!user) return null;

		return user;
	} catch (error) {
		throw error;
	}
}

async function updateUserTokens(userId, accessToken, refreshToken) {
	try {
		const user = await prisma.user.update({
			where: {
				id: userId
			},
			data: {
				accessToken: accessToken,
				refreshToken: refreshToken
			}
		});

		const userFiltered = excludeFields(user, [
			'id',
			'password',
			'passwordSalt'
		]);
		return userFiltered;
	} catch (error) {
		throw error;
	}
}

// ---------- Utility Functions ----------

function generateSalt(length) {
	return crypto
		.randomBytes(Math.ceil(length / 2))
		.toString('hex')
		.slice(0.16);
}

function sha512(password, salt) {
	let HMAC = crypto.createHmac('sha256', salt);
	HMAC.update(password);
	let hashedPassword = HMAC.digest('hex');
	return hashedPassword;
}

export {
	createUser,
	findUserByEmail,
	findUserById,
	updateUserPassword,
	isUserAuthorized,
	getUserTokens,
	updateUserTokens
};
