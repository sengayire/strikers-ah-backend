import models from '../models';
import Slug from '../helpers/slug';
import enumRate from '../helpers/enumeration';

const { article: ArticleModel, rating: ratingModel } = models;
/**
 * @description  CRUD for article Class
 */
class Article {
  /**
   *@author: Innocent Nkunzi
   * @param {Object} req
   * @param {Object} res
   * @returns {Object} Article
   */
  static async createArticle(req, res) {
    const {
      title, body, taglist, authorid
    } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'title can not be null' });
    }
    if (!body) {
      return res.status(400).json({ error: 'body can not be null' });
    }
    try {
      const slugInstance = new Slug(req.body.title);
      const descriptData = req.body.description || `${req.body.body.substring(0, 100)}...`;
      const slug = slugInstance.returnSlug(title);
      const newArticle = {
        title, body, description: descriptData, slug, authorid, taglist
      };
      const article = await ArticleModel.createArticle(newArticle);
      return res.status(201).json({ article });
    } catch (error) { return res.status(400).json({ message: error }); }
  }

  /**
   *@author: Clet Mwunguzi
   * @param {Object} req
   * @param {Object} res
   * @returns {Object} Rate
   */
  static async rateArticle(req, res) {
    const { rate, articleId } = req.params;
    const rating = enumRate[`${rate}`];
    const userId = 2;
    if (typeof (rating) === 'undefined') {
      return res.status(400).send({
        status: 400,
        error: 'invalid rating'
      });
    }

    if (!Number(articleId)) {
      return res.status(400).send({
        status: 400,
        error: 'Id of the article is not a number'
      });
    }
    const results = await ArticleModel.verifyArticle(articleId);
    if (!results) {
      return res.status(400).send({
        status: 400,
        error: 'Article can not be found.'
      });
    }

    const rateChecking = await ratingModel.rateCheck(rating, articleId, userId);
    const [dataResult, returnValue] = rateChecking;

    if (returnValue) {
      return res.status(201).send({
        status: 201,
        message: dataResult.dataValues
      });
    }

    if (!rateChecking[1] && rateChecking[0].dataValues.rating !== rating) {
      const updateRate = await ratingModel.rateUpdate(rateChecking[0].dataValues.id, rating);
      return res.status(201).send({
        status: 201,
        message: updateRate[1][0].dataValues
      });
    }
    return res.status(403).send({
      status: 403,
      error: 'Article is only rated once.'
    });
  }
}
export default Article;
