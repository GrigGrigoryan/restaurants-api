'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('User_Permissions', {
      user_id: {
        allowNull: false,
        type: Sequelize.UUID
      },
      permission_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('User_Permissions');
  }
};