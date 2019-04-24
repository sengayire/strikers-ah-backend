import models from '../models';
import Slug from '../helpers/slug';
import Description from '../helpers/makeDescription';

const { article: ArticleModel } = models;
const { bookmark: bookmarkModel } = models;
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
      title, body, taglist, description
    } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'title can not be null' });
    } if (!body) {
      return res.status(400).json({ error: 'body can not be null' });
    }
    const authorid = req.user.id;
    const slugInstance = new Slug(title);
    const descriptionInstance = new Description(description, body);
    const descriptData = descriptionInstance.makeDescription();
    const slug = slugInstance.returnSlug();
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
   *@author: Innocent Nkunzi
   * @param {Object} req
   * @param {Object} res
   * @returns {Object} return a bookmarked article
   */
  static async bookmarkArticle(req, res) {
    const { slug } = req.params;
    const userid = req.user.id;
    const checkSlug = await ArticleModel.getOneArticle(slug);
    if (!checkSlug) {
      return res.status(404).json({
        error: 'No article found with the specified slug'
      });
    }
    const articleId = checkSlug.id;
    const checkBookmark = await bookmarkModel.checkuser(userid, articleId);
    if (!checkBookmark) {
      const bookmark = await bookmarkModel.bookmark(userid, articleId);
      res.status(201).json({
        message: 'Bookmarked',
        article: bookmark
      });
    } else {
      res.status(403).json({
        error: 'Already bookmarked'
      });
    }
  }
}
export default Article;
