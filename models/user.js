import helper from '../helpers/helper';

const UserModel = (Sequelize, DataTypes) => {
  const User = Sequelize.define('user', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    firstname: { type: DataTypes.STRING, allowNull: true },
    lastname: { type: DataTypes.STRING, allowNull: true },
    username: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        validation() {
          if (!(this.provider)) {
            if (!(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(this.email))) { throw new Error('Please enter a valid email address'); }
          }
        }
      }
    },
    bio: { type: DataTypes.STRING, allowNull: true, },
    image: { type: DataTypes.TEXT, allowNull: true },
    password: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        validation() {
          if (!(this.provider)) {
            const result = helper.validatePassword(this.password);
            if (result !== true) {
              throw new Error(result);
            }
            this.password = helper.hashPassword(this.password);
          }
        }
      },
    },
    provider: { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
    provideruserid: { type: DataTypes.STRING, allowNull: true, },
    verified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  });
  User.socialUsers = async (userProfile) => {
    const result = await User.findOrCreate({
      where: { provideruserid: userProfile.provideruserid },
      defaults: userProfile
    });
    return result[0].dataValues;
  };
  User.associate = (models) => {
    User.hasMany(models.article, {
      foreignKey: 'authorid', onDelete: 'CASCADE'
    });
  };
  User.checkEmail = async email => User.findOne({ where: { email } });
  User.resetpassword = async (password, id) => User.update({ password }, { where: { id } });
  return User;
};
export default UserModel;
