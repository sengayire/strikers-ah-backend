import models from '../models';
import Slug from '../helpers/slug';
import enumRate from '../helpers/enumeration';
import objKey from '../helpers/enumKeyFinder';

const { article: ArticleModel, rating: ratingModel, user: userModel } = models;
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
      title, body, taglist
    } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'title can not be null' });
    } if (!body) {
      return res.status(400).json({ error: 'body can not be null' });
    }
    const authorid = req.user;
    const slugInstance = new Slug(req.body.title);
    const descriptData = req.body.description || `${req.body.body.substring(0, 100)}...`;
    const slug = slugInstance.returnSlug(title);
    const newArticle = {
      title, body, description: descriptData, slug, authorid, taglist
    };
    const article = await ArticleModel.createArticle(newArticle);
    return res.status(201).json({ article });
  }
  
  /**
   *
   * @author Innocent Nkunzi
   * @param {object} req
   * @param {object} res
   * @returns {object} returns an object of one article
   */
  static async getArticle(req, res) {
    const { slug } = req.params;
    const article = await ArticleModel.getOneArticle(slug);
    if (!article) {
      res.status(404).json({
        error: 'No article found with the slug provided'
      });
    } else {
      res.status(200).json({ article });
    }
  }

  /**
  * @author Innocent Nkunzi
  * @param {*} req
  * @param {*} res
  * @returns {object} it returns an object of articles
  */
  static async getAllArticles(req, res) {
    try {
      const getAll = await ArticleModel.getAll();
      if (getAll.length === 0) {
        res.status(404).json({
          error: 'Not article found for now'
        });
      } else {
        res.status(200).json({
          article: getAll
        });
      }
    } catch (err) {
      return res.status(400).json({ message: err.errors[0].message });
    }
  }

  /**
   *@author: Clet Mwunguzi
   * @param {Object} req
   * @param {Object} res
   * @returns {Object} Rate
   */
  static async rateArticle(req, res) {
    const { rate, slug } = req.params;
    const rating = enumRate[`${rate}`];
    const userId = req.user;

    const user = await userModel.verifyUser(userId);
    if (!user) {
      return res.status(404).send({
        status: 404,
        error: 'User not found'
      });
    }
    const { id, username } = user.dataValues;

    if (typeof (rating) === 'undefined') {
      return res.status(400).send({
        status: 400,
        error: 'invalid rating'
      });
    }

    if (Number(slug)) {
      return res.status(400).send({
        status: 400,
        error: 'slug of an article can not be a number.'
      });
    }

    const results = await ArticleModel.verifyArticle(slug);
    if (!results) {
      return res.status(404).send({
        status: 404,
        error: 'Article can not be found.'
      });
    }
    const { title: articleTitle } = results.dataValues;

    const rateChecking = await ratingModel.addRate(rating, slug, userId);
    const [dataResult, returnValue] = rateChecking;

    if (returnValue) {
      return res.status(201).send({
        rated_article: {
          status: 201,
          id: dataResult.dataValues.id,
          user: {
            id,
            username
          },
          article: {
            title: articleTitle,
            slug: dataResult.dataValues.articleSlug
          },
          rating: rate
        }
      });
    }

    if (!returnValue && dataResult.dataValues.rating !== rating) {
      const updateRate = await ratingModel.rateUpdate(rateChecking[0].dataValues.id, rating);
      const { userId: userid } = updateRate[1][0].dataValues;
      return res.status(200).send({
        rated_article: {
          status: 200,
          id: updateRate[1][0].dataValues.id,
          user: {
            id: userid,
            username
          },
          article: {
            title: articleTitle,
            slug: updateRate[1][0].dataValues.articleSlug
          },
          rating: rate,
          previousRating: objKey(dataResult.dataValues.rating)
        }
      });
    }
    return res.status(403).send({
      status: 403,
      error: 'Article can only be rated once.'
    });
  }
}
export default Article;
