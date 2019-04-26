import express from 'express';
import articleController from '../../controllers/article';

const router = express.Router();

router.post('/', articleController.createArticle);
router.post('/:articleId/:rate', articleController.rateArticle);
router.get('/');
router.delete('/:slug');
router.put('/:slug');


export default router;
