const db = require('../models');
const {validateMealData} = require('../middlewares/dataValidators');
const AppError = require('../core/AppError');
const tokenValidator = require('../middlewares/tokenValidator');
const roleValidator = require('../middlewares/roleValidator');
const permissionsValidator = require('../middlewares/permissionsValidator');
const {Op} = require("sequelize");

class Meal {
  constructor() {}

  get public() {
    return {
      '/': {
        get: {
          route: this.getMeals,
          middleware: [tokenValidator, roleValidator, permissionsValidator, validateMealData]
        },
        post: {
          route: this.createMeal,
          middleware: [tokenValidator, roleValidator, permissionsValidator, validateMealData]
        }
      },
      '/:meal_id': {
        get: {
          route: this.getMealById,
          middleware: [tokenValidator, roleValidator, permissionsValidator, validateMealData]
        },
        put: {
          route: this.updateMealById,
          middleware: [tokenValidator, roleValidator, permissionsValidator, validateMealData]
        },
        delete: {
          route: this.deleteMealById,
          middleware: [tokenValidator, roleValidator, permissionsValidator, validateMealData]
        }
      }
    };
  }

  async getMeals(req, res, next) {
    try {
      const query = req.query;
      let where = {};
      let order = [];

      query.type        && (where["type"]        = query.type);
      query.name        && (where["name"]        = query.name);
      query.description && (where["description"] = query.description);
      query.price       && (where["price"]       = query.price);

      query.type_sort        && (order.push(['type', query.type_sort.toUpperCase()]));
      query.name_sort        && (order.push(['name', query.name_sort.toUpperCase()]));
      query.description_sort && (order.push(['description', query.description_sort.toUpperCase()]));
      query.price_sort       && (order.push(['price', query.price_sort.toUpperCase()]));

      const meals = await db.Meal.findAll({where, order});
      if (!meals.length) {
        return next(new AppError('Meals not found.', 404));
      }

      return res.json({
        status: 'success',
        meals
      });
    } catch (e) {
      next(e);
    }
  }
  async createMeal(req, res, next) {
    try {
      const {type, name, description, price} = req.body;

      const create = await db.Meal.create({type, name, description, price});
      const meal = await create.get({plain: true});

      return res.json({
        status: 'success',
        meal
      });
    } catch (e) {
      next(e);
    }
  }
  async getMealById(req, res, next) {
    try {
      const {meal_id: id} = req.params;

      const meal = await db.Meal.findByPk(id);
      if (!meal) {
        return next(new AppError('Meal not found.', 404));
      }

      return res.json({
        status: 'success',
        meal
      });
    } catch (e) {
      next(e);
    }
  }
  async updateMealById(req, res, next) {
    try {
      const {meal_id: id} = req.params;
      const {type, name, description, price} = req.body;

      const updatedMeal = await db.Meal.update({type, name, description, price}, {
        where: {id},
        returning: true
      });

      return res.json({
        status: 'success',
        message: `Meal rows updated. ${JSON.stringify(updatedMeal[1])}`
      });
    } catch (e) {
      next(e);
    }
  }
  async deleteMealById(req, res, next) {
    try {
      const {meal_id: id} = req.params;

      await db.Meal.destroy({where: {id}});

      return res.json({
        status: 'success',
        message: `Meal with id:${id} deleted.`
      });
    } catch (e) {
      next(e);
    }
  }
}

module.exports = Meal;