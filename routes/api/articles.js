import express from 'express';
import articleController from '../../controllers/article';
import AuthToken from '../../middlewares/tokenValidation';
import errorHandler from '../../middlewares/errorHandler';


const router = express.Router();

router.post('/', AuthToken, errorHandler(articleController.createArticle));
// router.get('/:slug', articleController.getArticle);
router.get('/all', errorHandler(articleController.getAllArticles));
router.get('/', errorHandler(articleController.articlePagination));
router.delete('/:slug');
router.put('/:slug');


export default router;
