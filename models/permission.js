'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Permission.belongsToMany(models.User, {
        through: 'User_Permission',
        as: 'Permissions',
        foreignKey: 'permission_id'
      });
    }
  }
  Permission.init({
    permission_id: {
      primaryKey: true,
      allowNull: false,
      type: DataTypes.INTEGER
    },
    name: DataTypes.STRING,
    is_active: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Permission',
  });
  return Permission;
};