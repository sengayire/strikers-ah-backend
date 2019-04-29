import models from '../models';
import Slug from '../helpers/slug';

const { article: ArticleModel } = models;
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
 * @param {*} req
 * @param {*} res
 * @returns {object} it returns an object of articles
 */
  static async getAllArticles(req, res) {
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
  }

  /**
 *
 * @author Innocent Nkunzi
 * @param {*} req
 * @param {*} res
 * @returns {object} it returns an object of articles
 */
  static async articlePagination(req, res) {
    const pageNumber = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);
    if (pageNumber <= 0) {
      return res.status(403).json({
        error: 'Invalid page number'
      });
    } if (limit <= 0) {
      return res.status(403).json({
        error: 'Invalid page limit'
      });
    }
    const offset = limit * (pageNumber - 1);
    const getAll = await ArticleModel.getAll(limit, offset);
    if (getAll.length) {
      res.status(200).json({
        article: getAll,
        articlesCount: getAll.length
      });
    } else {
      res.status(404).json({
        error: 'No article found for now'
      });
    }
  }
}
export default Article;
