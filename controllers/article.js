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
      title, body, taglist, authorid
    } = req.body;
    if (!req.body.title) {
      return res.status(400).json({ error: 'title can not be null' });
    } if (!req.body.body) {
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
    } catch (error) { return res.status(400).json({ message: error.errors[0].message }); }
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
    try {
      const article = await ArticleModel.getOneArticle(slug);
      if (!article) {
        res.status(404).json({
          error: 'No article found with the slug provided'
        });
      } else {
        res.status(200).json({ article });
      }
    } catch (err) {
      return res.status(400).json({ message: err.errors[0].message });
    }
  }
}
export default Article;
