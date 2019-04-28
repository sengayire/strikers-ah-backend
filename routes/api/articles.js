import express from 'express';
import articleController from '../../controllers/article';
import secureRoute from '../../middlewares/tokenValidation';

const router = express.Router();

router.post('/', articleController.createArticle);
router.post('/:slug/rate/:rate', secureRoute, articleController.rateArticle);
router.get('/');
router.delete('/:slug');
router.put('/:slug');


export default router;
