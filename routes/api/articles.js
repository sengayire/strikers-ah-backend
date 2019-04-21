import express from 'express';
import articleController from '../../controllers/article';
import AuthToken from '../../middlewares/validateToken';
import errorHandler from '../../middlewares/errorHandler';

const router = express.Router();

router.post('/', AuthToken.verifyToken, errorHandler(articleController.createArticle));
router.get('/');
router.delete('/:slug');
router.put('/:slug', AuthToken.verifyToken, errorHandler(articleController.updateArticle));


export default router;
