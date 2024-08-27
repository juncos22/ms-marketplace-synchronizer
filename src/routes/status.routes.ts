import express from 'express';
import StatusController from '../controllers/status.controller';
const router = express.Router();

router.get('/statusServer', StatusController.statusServer);

export default router;
