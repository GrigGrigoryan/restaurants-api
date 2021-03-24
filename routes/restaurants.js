const db = require('../models');
const bcrypt = require('bcrypt');
const { validateRestaurantData } = require('../middlewares/dataValidators');
const tokenValidator = require('../middlewares/tokenValidator');
const roleValidator = require('../middlewares/roleValidator');
const permissionsValidator = require('../middlewares/permissionsValidator');
const AppError = require('../core/AppError');

const {Op} = require("sequelize");

class User {
  constructor() {
  }

  get public() {
    return {
      '/': {
        get: {
          route: this.getRestaurants,
          middleware: [tokenValidator, roleValidator, permissionsValidator, validateRestaurantData]
        },
        post: {
          route: this.createRestaurant,
          middleware: [tokenValidator, roleValidator, permissionsValidator, validateRestaurantData]
        }
      },
      '/:restaurant_id': {
        get: {
          route: this.getRestaurantById,
          middleware: [tokenValidator, roleValidator, permissionsValidator, validateRestaurantData]
        },
        put: {
          route: this.updateRestaurantById,
          middleware: [tokenValidator, roleValidator, permissionsValidator, validateRestaurantData]
        },
        delete: {
          route: this.deleteRestaurantById,
          middleware: [tokenValidator, roleValidator, permissionsValidator, validateRestaurantData]
        }
      },
    };
  }

  async getRestaurants(req, res, next) {
    try {
      const query = req.query;
      let where = {};
      let order = [];
      query.meals_type  && (where["meals_type"] = query.meals_type);
      query.name        && (where["name"]       = query.name);

      query.meals_type_sort && (order.push(['meals_type', query.meals_type_sort.toUpperCase()]));
      query.name_sort       && (order.push(['name', query.name_sort.toUpperCase()]));

      const restaurants = await db.Restaurant.findAll({where, order});
      if (!restaurants.length) {
        return next(new AppError('Restaurants not found.', 404));
      }

      return res.json({
        status: 'success',
        restaurants
      });
    } catch (e) {
      next(e);
    }
  }

  async createRestaurant(req, res, next) {
    try {
      const { name, meals_type } = req.body;

      const create = await db.Restaurant.create({name, meals_type});
      const restaurant = await create.get({plain: true});
      if (!restaurant) {
        next(new AppError('Created Restaurant not found.', 404));
      }

      return res.json({
        status: 'success',
        restaurant
      });
    } catch (e) {
      next(e);
    }
  }

  async getRestaurantById(req, res, next) {
    try {
      const {restaurant_id: id} = req.params;

      const restaurant = await db.Restaurant.findByPk(id);

      if (!restaurant) {
        return next(new AppError('Restaurant not found.', 404));
      }

      return res.json({
        status: 'success',
        restaurant
      });
    } catch (e) {
      next(e);
    }
  }

  async updateRestaurantById(req, res, next) {
    try {
      const {restaurant_id: id} = req.params;
      const {name, meals_type} = req.body;

      const updatedRestaurant = await db.Restaurant.update({name, meals_type}, {
        where: {id},
        returning: true
      });

      return res.send(`Restaurant rows updated. ${JSON.stringify(updatedRestaurant[1])}`);
    } catch (e) {
      next(e);
    }
  }

  async deleteRestaurantById(req, res, next) {
    try {
      const {restaurant_id: id} = req.params;

      await db.Restaurant.destroy({where: {id}});
      return res.json({
        status: 'success',
        message: `Restaurant with id:${id} deleted.`
      });
    } catch (e) {
      next(e);
    }
  }
}

module.exports = User;