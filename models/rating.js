
module.exports = (sequelize, DataTypes) => {
  const rating = sequelize.define('rating', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    articleSlug: {
      type: DataTypes.STRING,
      allowNull: false
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

  }, {});

  rating.addRate = (rate, article, id) => rating.findOrCreate({ where: { userId: id, articleSlug: article }, defaults: { rating: rate } });
  rating.rateUpdate = (rateId, rate) => rating.update({ rating: rate }, { returning: true, where: { id: rateId } });
  rating.avgFind = id => rating.findAll({ where: { articleId: id }, attributes: ['articleId', [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']], group: 'rating.articleId' });
  rating.associate = (models) => {
    rating.belongsTo(models.user, { foreignKey: 'userId', onDelete: 'CASCADE' });
    rating.belongsTo(models.article, { foreignKey: 'articleSlug', onDelete: 'CASCADE' });
  };

  return rating;
};
