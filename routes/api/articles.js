import express from 'express';
import articleController from '../../controllers/article';
import Strategy from '../../middlewares/auth';
import helper from '../../helpers/helper';
import AuthToken from '../../middlewares/tokenValidation';
import errorHandler from '../../middlewares/errorHandler';

const router = express.Router();

router.get('/', articleController.getAllArticles);
router.post('/', AuthToken, errorHandler(articleController.createArticle));
router.get('/:slug', errorHandler(articleController.getArticle));

router.delete('/:slug');
router.put('/:slug');
router.patch('/:slug/:likeState', Strategy.verifyToken, helper.asyncHandler(articleController.likeArticle));

export default router;
