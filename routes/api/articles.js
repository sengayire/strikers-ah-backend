import express from 'express';
import articleController from '../../controllers/article';
import AuthToken from '../../middlewares/validateToken';
import errorHandler from '../../helpers/errorHandler';


const router = express.Router();

router.post('/', AuthToken.verifyToken, errorHandler(articleController.createArticle));
// router.get('/:slug', articleController.getArticle);
router.get('/', errorHandler(articleController.getAllArticles));
router.delete('/:slug');
router.put('/:slug');


export default router;
