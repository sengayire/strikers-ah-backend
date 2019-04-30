import models from '../models';
import Slug from '../helpers/slug';

const { article: ArticleModel, reportingcategory: articleReportingCategory } = models;
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
   *@author: Jacques Nyilinkindi
   * @param {Object} req
   * @param {Object} res
   * @returns {Object} Add reporting category
   */
  static async AddReportingCategory(req, res) {
    const { category } = req.body;
    if (!category) {
      return res.status(400).json({ message: 'Provide category name' });
    }
    try {
      const [categoryInfo, created] = await articleReportingCategory.findOrCreate({
        where: { name: category }
      });
      if (created) {
        return res.status(201).json({ category: categoryInfo });
      }
      return res.status(409).json({ message: 'Category already exists' });
    } catch (error) {
      return res.status(500).json({ error });
    }
  }

  /**
   *@author: Jacques Nyilinkindi
   * @param {Object} req
   * @param {Object} res
   * @returns {Object} Viw reporting categories
   */
  static async reportingCategories(req, res) {
    try {
      const categories = await articleReportingCategory.findAll({ attributes: ['id', 'name'] });
      if (categories) {
        return res.status(200).json({ categories });
      }
      return res.status(404).json({ message: 'No category found' });
    } catch (error) {
      return res.status(500).json({ error });
    }
  }

  /**
   *@author: Jacques Nyilinkindi
   * @param {Object} req
   * @param {Object} res
   * @returns {Object} Edit reporting category
   */
  static async editReportingCategory(req, res) {
    const { id } = req.params;
    const { category } = req.body;
    if (!category) {
      return res.status(400).json({ message: 'Provide new category name' });
    }
    const findCategory = await articleReportingCategory.findOne({ where: { name: category } });
    if (findCategory) {
      return res.status(409).json({ message: 'Category with same name exists' });
    }
    try {
      let reportingCategory = await articleReportingCategory.update(
        { name: category },
        { where: { id }, returning: true }
      );
      [, [reportingCategory]] = reportingCategory;
      if (!reportingCategory) {
        return res.status(200).json({ message: 'Category not found' });
      }
      return res.status(200).json({ category: reportingCategory });
    } catch (error) {
      return res.status(500).json({ error });
    }
  }

  /**
   *@author: Jacques Nyilinkindi
   * @param {Object} req
   * @param {Object} res
   * @returns {Object} Edit reporting category
   */
  static async deleteReportingCategory(req, res) {
    const { id } = req.params;
    try {
      await articleReportingCategory.destroy({ where: { id } });
      return res.status(200).json({ message: 'Category deleted' });
    } catch (error) {
      return res.status(500).json({ error });
    }
  }
}
export default Article;
