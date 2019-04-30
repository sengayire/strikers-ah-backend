import express from 'express';
import articleController from '../../controllers/article';
import AuthToken from '../../middlewares/tokenValidation';
import errorHandler from '../../middlewares/errorHandler';

const router = express.Router();

router.get('/', articleController.getAllArticles);
router.post('/', AuthToken, errorHandler(articleController.createArticle));
router.post('/report/category', AuthToken, articleController.AddReportingCategory);
router.get('/report/category', AuthToken, articleController.reportingCategories);
router.put('/report/category/:id', AuthToken, articleController.editReportingCategories);
router.get('/:slug', errorHandler(articleController.getArticle));

router.delete('/:slug');
router.put('/:slug');

export default router;
