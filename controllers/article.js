// import debug from 'debug';
import select from 'lodash';
import models from '../models';
import Slug from '../helpers/slug';
import helper from '../helpers/helper';

// const logger = debug('app:*');

const {
  article: ArticleModel,
  ArticleLikesAndDislikes: ArticleLikesModel
} = models;
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
      title, body, taglist
    } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'title can not be null' });
    } if (!body) {
      return res.status(400).json({ error: 'body can not be null' });
    }
    try {
      const slugInstance = new Slug(req.body.title);
      const descriptData = req.body.description || `${req.body.body.substring(0, 100)}...`;
      const slug = slugInstance.returnSlug(title);
      const newArticle = {
        title,
        body,
        description: descriptData,
        slug,
        authorid,
        taglist
      };
      const article = await ArticleModel.createArticle(newArticle);
      return res.status(201).json({ article });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  /**
   * @author Mwibutsa Floribert
   * @param {object} req - request object
   * @param {object} res - response object
   * @returns {object} -
   */
  static async likeArticle(req, res) {
    const { slug, likeState } = req.params;
    if (`${likeState}` !== 'like' && `${likeState}` !== 'dislike') {
      return res.status(404).json({ error: 'Page not found' });
    }
    const { id: userId } = helper.decodeToken(req);

    // check if the article exists
    const article = await ArticleModel.findOne({ where: { slug } });
    if (article) {
      await ArticleLikesModel.saveLike({ user_id: userId, article_id: article.id }, `${likeState}`);
      // get article likes count
      const { count: likes } = await ArticleLikesModel.findAndCountAll({ where: { article_id: article.id, like_value: 'like' } });
      // get article dislikes count
      const { count: dislikes } = await ArticleLikesModel.findAndCountAll({ where: { article_id: article.id, like_value: 'dislike' } });
      res.json({ article: helper.combineWithArticle(article, { likes, dislikes }) });
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
}
export default Article;
