'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User_Role extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  User_Role.init({
    user_id: DataTypes.UUID,
    role_id: DataTypes.INTEGER
  }, {
    timestamps: false,
    createdAt: false,
    updatedAt: false,
    sequelize,
    modelName: 'User_Role',
  });
  return User_Role;
};