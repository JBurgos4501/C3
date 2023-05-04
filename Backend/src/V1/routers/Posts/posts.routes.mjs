import express from 'express';

import { authenticateJsonWebToken } from '../../services/auth.service.mjs';

import {
	httpCreatePost,
	httpDeletePost,
	httpGetAllPost,
	httpUpdatePost,
} from './posts.controller.mjs';

const router = express.Router();

router.get('/', authenticateJsonWebToken, httpGetAllPost);

router.post('/', authenticateJsonWebToken, httpCreatePost);

router.delete('/:postId', authenticateJsonWebToken, httpDeletePost);

router.put('/:postId', authenticateJsonWebToken, httpUpdatePost);

export default router;