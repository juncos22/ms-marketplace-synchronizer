import express from 'express';
import CategoryController from '../controllers/category.controller';

const router = express.Router();

router.get('/categories_ml', CategoryController.synchronizeCategories);
// router.get('/attributes_ml', CategoryController.synchronizeAttributes);

export default router;
