import express from 'express';
import UserController from '../controllers/user.controller';
const router = express.Router();

router.get('/user/:id', UserController.getUser);
router.post('/users', UserController.postUser);

export default router;
