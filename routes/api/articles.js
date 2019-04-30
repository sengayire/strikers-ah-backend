import express from 'express';
import articleController from '../../controllers/article';
import secureRoute from '../../middlewares/tokenValidation';
import AuthToken from '../../middlewares/tokenValidation';
import errorHandler from '../../middlewares/errorHandler';

const router = express.Router();

router.get('/', articleController.getAllArticles);
router.post('/', AuthToken, errorHandler(articleController.createArticle));
router.get('/:slug', errorHandler(articleController.getArticle));
router.post('/:slug/rate/:rate', secureRoute, articleController.rateArticle);

export default router;
