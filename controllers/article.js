import models from '../models';
import Slug from '../helpers/slug';
import Description from '../helpers/makeDescription';

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
      title, body, taglist, description
    } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'title can not be null' });
    } if (!body) {
      return res.status(400).json({ error: 'body can not be null' });
    }
    const authorid = req.user.id;
    const slugInstance = new Slug(req.body.title);
    const descripIns = new Description(description, body);
    const descriptData = descripIns.makeDescription();
    const slug = slugInstance.returnSlug(title);
    const newArticle = {
      title, body, description: descriptData, slug, authorid, taglist
    };
    const article = await ArticleModel.createArticle(newArticle);
    return res.status(201).json({ article });
  }

  /**
   *@author: Innocent Nkunzi
   * @param {Object} req
   * @param {Object} res
   * @returns {Object} updted Article
   */
  static async updateArticle(req, res) {
    const { slug } = req.params;
    const {
      title, body, taglist, description
    } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'title can not be null' });
    } if (!body) {
      return res.status(400).json({ error: 'body can not be null' });
    }
    const authorid = req.user.id;
    const searchArticle = await ArticleModel.getOneArticle(authorid, slug);
    if (!searchArticle) {
      res.status(404).json({
        error: 'No article found for you to edit'
      });
    } else {
      const { id } = searchArticle;
      const slugInstance = new Slug(title);
      const descripInstance = new Description(description, body);
      const descriptData = descripInstance.makeDescription();
      const newSlug = slugInstance.returnSlug();
      const updatedArticle = {
        title, body, description: descriptData, slug: newSlug, authorid, taglist
      };
      const updateArticle = await ArticleModel.updateFoundArticle(id, updatedArticle);
      res.status(200).json({
        message: 'Article updated',
        article: updateArticle
      });
    }
  }
}
export default Article;
