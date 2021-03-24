'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.belongsToMany(models.Role, {
        through: 'User_Role',
        foreignKey: 'user_id'
      });
      User.belongsToMany(models.Permission, {
        through: 'User_Permission',
        foreignKey: 'user_id'
      });
    }
  };
  User.init({
    user_id: {
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV1,
      type: DataTypes.UUID
    },
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    token: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};