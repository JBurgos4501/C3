import prisma from '../../database/index.mjs';

import { excludeFields } from '../util/helpers.mjs';
import { HttpError } from './http-error.mjs';

async function StartupsWithPosts(investorId) {
	try {
		const startups = await prisma.startup.findMany({
			where: {
				investors: {
					some: {
						id: investorId
					}
				},
				blog: {
					some: {}
				}
			},
			include: {
				blog: {
					select: {
						id: true,
						lastModified: true,
						title: true,
						description: true
					}
				}
			},
			orderBy: {
				lastModified: 'desc'
			}
		});

		if (!startups.length) {
			return null;
		}

		const filteredStartups = startups.map((s) =>
			excludeFields(s, [
				'investorIds',
				'userId',
				'createdDate',
				'lastModified',
				'email',
				'codatId',
				'redirectLink',
				'captable'
			])
		);
		return filteredStartups;
	} catch (error) {
		throw error;
	}
}

async function CreatePost(startupId, postInfo) {
	try {
		const createdPost = await prisma.post.create({
			data: {
				title: postInfo.title,
				description: postInfo.description,
				creator: {
					connect: {
						id: startupId
					}
				}
			}
		});

		return createdPost;
	} catch (error) {
		throw error;
	}
}

async function DeletePost(startupId, postId) {
	try {
		const postToDelete = await validatePostExistence(postId);

		if (!postToDelete) {
			return new HttpError('Could not find a post for this id', 404);
		}

		if (postToDelete.creatorId !== startupId) {
			return new HttpError('You are not authorized to delete this post', 401);
		}

		const deletedPost = await prisma.post.delete({
			where: {
				id: postId
			}
		});

		return deletedPost;
	} catch (error) {
		throw error;
	}
}

async function getPosts(startupId) {
	try {
		const posts = await prisma.post.findMany({
			where: {
				creatorId: startupId
			},
			select: {
				id: true,
				title: true,
				description: true,
				lastModified: true,
				creator: {
					select: {
						companyName: true
					}
				}
			},
			orderBy: {
				lastModified: 'desc'
			}
		});

		if (!posts.length) {
			return null;
		}

		return posts;
	} catch (error) {
		console.log(error);
		throw error;
	}
}

// ---------- Utility Functions ----------
async function validatePostExistence(postId) {
	const post = await prisma.post.findUnique({
		where: {
			id: postId
		},
		select: {
			creatorId: true
		}
	});
	return post;
}

export { StartupsWithPosts, CreatePost, DeletePost, getPosts };
