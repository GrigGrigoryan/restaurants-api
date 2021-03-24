const db = require('../models');
const jwt = require('jsonwebtoken');
const jwt_key = process.env.JWT_SECRET;
const bcrypt = require('bcrypt');
const saltRounds = 10;
const tokenValidator = require('../middlewares/tokenValidator');
const roleValidator = require('../middlewares/roleValidator');
const permissionsValidator = require('../middlewares/permissionsValidator');
const { validateLoginData, validateRegisterData } = require('../middlewares/dataValidators');

class Index {
  constructor() {}

  get public() {
    return {
      '/': {
        get: {
          route: this.index,
          middleware: [tokenValidator, permissionsValidator]
        }
      },
      '/login': {
        post: {
          route: this.login,
          middleware: [permissionsValidator, validateLoginData]
        }
      },
      '/register': {
        post: {
          route: this.register,
          middleware: [validateRegisterData]
        }
      },
      '/logout': {
        post: {
          route: this.logout,
          middleware: [tokenValidator]
        }
      },
    };
  }

  async index(req, res, next) {
    try {
      const user = await res.locals.getUser;

      return res.json({
        status: 'success',
        message: `Hello ${user.first_name} jan.`
      });
    } catch(e) {
      next(e);
    }
  }

  async loginUser(res, user) {
    const token = jwt.sign({data: user.user_id}, jwt_key, {expiresIn: '1h'});
    user.token = token;
    await user.save();
    res.set('authorization', token);
  }
  async logoutUser(res, user) {
    user.token = '';
    await user.save();
    res.set('authorization', '');
  }

  async register(req, res, next) {
    try {
      const transaction = await db.sequelize.transaction();
      const { first_name, last_name, email, password } = req.body;

      try {
        const HashedPassword = await bcrypt.hash(password, saltRounds);

        const createUser = await db.User.create({
          first_name,
          last_name,
          email,
          password: HashedPassword
        }, {transaction});

        const user = createUser.get({plain: true});
        console.log('user', user);

        const token = jwt.sign({data: user.user_id}, jwt_key, {expiresIn: '1h'});
        await db.User.update({token}, {where: {user_id: user.user_id}, transaction});

        // Initializing user role as client
        const createRole = await db.User_Role.create({
          user_id: user.user_id, role_id: 4
        }, {transaction});
        const role = createRole.get({plain: true});

        if (!role) {
          next(new AppError(`User role not created.`, 404));
        }

        // Initializing user permissions to read restaurants and meals
        await db.User_Permission.bulkCreate([{
          user_id: user.user_id, permission_id: 10
        }, {
          user_id: user.user_id, permission_id: 11
        }, {
          user_id: user.user_id, permission_id: 31
        }, {
          user_id: user.user_id, permission_id: 51
        }], {transaction});

        res.set('authorization', token);

        await transaction.commit();

        return res.json({
          status: 'success',
          message: `User registered successfully.`,
          token: `Bearer ${token}`
        });
      } catch(e) {
        await transaction.rollback();
        next(e);
      }
    } catch(e) {
      next(e);
    }
  }
  async login(req, res, next) {
    try {
      const user = await res.locals.getUser;

      await this.loginUser(res, user);

      return res.send({
        status: 'success',
        message: `User logged in successfully.`,
        token: `Bearer ${user.token}`
      });
    } catch (e) {
      next(e);
    }
  }
  async logout(req, res, next) {
    try {
      const user = await req.getUser();

      await this.logoutUser(res, user);

      return res.json({
        status: 'success',
        message: `User logged out successfully.`,
      });
    } catch (e) {
      next(e);
    }
  }
}

module.exports = Index;