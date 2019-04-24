import express from 'express';
import articleController from '../../controllers/article';
import AuthToken from '../../middlewares/validateToken';
import errorHandler from '../../middlewares/errorHandler';

const router = express.Router();

router.post('/', AuthToken.verifyToken, errorHandler(articleController.createArticle));
router.get('/:slug', errorHandler(articleController.getArticle));
router.delete('/:slug');
router.put('/:slug');
router.post('/:slug/bookmark', AuthToken.verifyToken, errorHandler(articleController.bookmarkArticle));

export default router;
