import express from 'express';
import articleController from '../../controllers/article';
import AuthToken from '../../middlewares/validateToken';

const router = express.Router();

router.post('/', AuthToken.verifyToken, articleController.createArticle);
// router.get('/:slug', articleController.getArticle);
router.get('/', articleController.getAllArticles);
router.delete('/:slug');
router.put('/:slug');


export default router;
