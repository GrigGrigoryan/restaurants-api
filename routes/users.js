const tokenValidator = require('../middlewares/tokenValidator');
const {validateUserData, validateUserRolesData, validateUserPermissionsData} = require('../middlewares/dataValidators');
const roleValidator = require('../middlewares/roleValidator');
const permissionsValidator = require('../middlewares/permissionsValidator');
const {Op} = require("sequelize");
const jwt = require("jsonwebtoken");
const jwt_key = process.env.JWT_SECRET;
const bcrypt = require('bcrypt');
const saltRounds = 10;
const db = require('../models');
const AppError = require('../core/AppError');
const permissionsData = require('../assets/permissionsData');

class User {
  constructor() {}

  get public() {
    return {
      '/': {
        get: {
          route: this.getUsers,
          middleware: [ tokenValidator, roleValidator, permissionsValidator, validateUserData]
        },
        post: {
          route: this.createUser,
          middleware: [ tokenValidator, roleValidator, permissionsValidator, validateUserData]
        }
      },
      '/:user_id': {
        get: {
          route: this.getUserById,
          middleware: [tokenValidator, roleValidator, permissionsValidator, validateUserData]
        },
        put: {
          route: this.updateUserById,
          middleware: [tokenValidator, roleValidator, permissionsValidator, validateUserData]
        },
        delete: {
          route: this.deleteUserById,
          middleware: [tokenValidator, roleValidator, permissionsValidator, validateUserData]
        }
      },
      '/:user_id/roles': {
        get: {
          route: this.getUserRoles,
          middleware: [tokenValidator, roleValidator, permissionsValidator]
        }
      },
      '/:user_id/roles/:role_id': {
        get: {
          route: this.getUserRoleById,
          middleware: [tokenValidator, roleValidator, permissionsValidator]
        },
        post: {
          route: this.createUserRole,
          middleware: [tokenValidator, roleValidator, permissionsValidator]
        },
        delete: {
          route: this.deleteUserRoleById,
          middleware: [tokenValidator, roleValidator, permissionsValidator]
        }
      },
      '/:user_id/permissions': {
        get: {
          route: this.getUserPermissions,
          middleware: [tokenValidator, roleValidator, permissionsValidator]
        },
        post: {
          route: this.createUserPermission,
          middleware: [tokenValidator, roleValidator, permissionsValidator]
        }
      },
      '/:user_id/permissions/:permission_id': {
        get: {
          route: this.getUserPermissionById,
          middleware: [tokenValidator, roleValidator, permissionsValidator]
        },
        delete: {
          route: this.deleteUserPermissionById,
          middleware: [tokenValidator, roleValidator, permissionsValidator]
        }
      }
    };
  }

  // users
  async getUsers (req, res, next) {
    try {
      const query = req.query;
      let where = {};
      query.first_name && (where["first_name"] = query.first_name);
      query.last_name  && (where["last_name"]  = query.last_name);
      query.email      && (where["email"]      = query.email);

      const users = await db.User.findAll({where});

      return res.json({
        status: 'success',
        users
      });
    } catch(e) {
      next(e);
    }
  }

  async createUser (req, res, next) {
    try {
      const transaction = await db.sequelize.transaction();
      const { first_name, last_name, email, password, role_id, permissions_ids } = req.body;
      let isUserSuperAdmin = res.locals.isUserSuperAdmin || false;

      if (!isUserSuperAdmin) {
        let userSecret = req.headers.user_secret;
        if (userSecret && userSecret === process.env.SUPER_ADMIN_SECRET) {
          res.locals.isUserSuperAdmin = true;
        }
      }
      try {
        const HashedPassword = await bcrypt.hash(password, saltRounds);
        const userCreate = await db.User.create({
          first_name, last_name, email, password: HashedPassword,
        }, {transaction});

        const user = userCreate.get({plain: true});
        if (!user) {
          next(new AppError('User not found', 404));
        }

        const token = jwt.sign({data: user.user_id}, jwt_key, {expiresIn: '1h'});
        await db.User.update({token}, {where: {user_id: user.user_id}, transaction});

        console.log(isUserSuperAdmin);
        // Initializing user roles and permissions
        if (isUserSuperAdmin) {
          const createRole = await db.User_Role.create({
            user_id: user.user_id, role_id: 1
          }, {transaction});

          const role = createRole.get({plain: true});
          if (!role) {
            next(new AppError('User created role not found', 404));
          }
          let allUserPermissions = [];
          for (const permission of permissionsData) {
            if (permission.permission_id === '13') {
              continue;
            }
            allUserPermissions.push({user_id: user.user_id, permission_id: permission.permission_id});
          }
          // Initializing user permissions to read restaurants and meals
          const permissions = await db.User_Permission.bulkCreate(allUserPermissions, {transaction});
          if (!permissions) {
            next(new AppError('User created permissions not found', 404));
          }
        } else if (role_id && parseInt(role_id) !== 1) {
          const createRole = await db.User_Role.create({
            user_id: user.user_id, role_id
          }, {transaction});

          const role = createRole.get({plain: true});
          if (!role) {
            next(new AppError('User created role not found', 404));
          }

          const userPermissionsData = [];
          let permissionsIdsArr = permissions_ids.split(',');
          permissionsIdsArr.forEach(permission_id => {
            userPermissionsData.push({user_id: user.user_id, permission_id});
          });

          const permissions = await db.User_Permission.bulkCreate(userPermissionsData, {transaction});
          if (!permissions) {
            next(new AppError('User created permissions not found', 404));
          }
        }

        res.set('authorization', token);

        await transaction.commit();

        return res.json({
          status: 'success',
          message: 'User created.',
          user
        })
      } catch(e) {
        console.log(e);
        await transaction.rollback();
        next(e);
      }
    } catch(e) {
      next(e);
    }
  }
  async getUserById (req, res, next) {
    try {
      const {user_id} = req.params;
      const user = await db.User.findByPk(user_id);
      if (!user) {
        next(new AppError(`User with id:${user_id} not found`,404))
      }
      return res.json({
        status: 'success',
        user
      });
    } catch(e) {
      next(e);
    }
  }
  async updateUserById (req, res, next) {
    try {
      const {user_id} = req.params;
      const {first_name, last_name, token} = req.body;
      let update = {};
      first_name && (update["first_name"] = first_name);
      last_name  && (update["last_name"] = last_name);
      token      && (update["token"] = token);

      await db.User.update(update, {where: {user_id}});

      return res.json({
        status: 'success',
        message: 'User updated.'
      });
    } catch(e) {
      next(e);
    }
  }
  async deleteUserById (req, res, next) {
    try {
      const {user_id} = req.params;
      await db.User.destroy({where: {user_id}});

      return res.json({
        status: 'success',
        message: 'User deleted.'
      })
    } catch(e) {
      next(e);
    }
  }

  // /roles
  async getUserRoles (req, res, next) {
    try {
      const {user_id} = req.params;

      const user = await db.User.findOne({
        where: {user_id},
        include: [{model: db.Role}]
      });

      if (!user || !user.Roles.length) {
        next(new AppError(`User with id:${user_id} has no roles.`,404))
      }

      return res.json({
        status: 'success',
        roles: user.Roles
      });
    } catch(e) {
      next(e);
    }
  }
  async createUserRole (req, res, next) {
    try {
      const {user_id, role_id} = req.params;

      await db.User_Role.create({
        user_id, role_id
      });

      return res.json({
        status: 'success',
        message: `User role with id:${role_id} created.`
      });
    } catch(e) {
      next(e);
    }
  }
  async getUserRoleById (req, res, next) {
    try {
      const {user_id, role_id} = req.params;

      const user = await db.User.findOne({
        where: {user_id},
        include: [{
          model: db.Role,
          where: {role_id}
        }]
      });

      if (!user || !user.Roles.length) {
        next(new AppError(`User with id:${user_id} has no role with id:${role_id}`,404))
      }

      return res.json({
        status: 'success',
        roles: user.Roles
      });
    } catch(e) {
      next(e);
    }
  }
  async deleteUserRoleById (req, res, next) {
    try {
      const {user_id, role_id} = req.params;

      await db.User_Role.destroy({where: {user_id, role_id}});

      return res.json({
        status: 'success',
        message: `User role with id:${role_id} deleted.`
      });
    } catch(e) {
      next(e);
    }
  }

  // /permissions
  async createUserPermission (req, res, next) {
    try {
      const {user_id, permission_id} = req.params;

      if (parseInt(permission_id) === 13 && res.locals.isUserSuperAdmin) {
        return next(new AppError('You cannot block super_admin', 400));
      }
      await db.User_Permission.create({user_id, permission_id});

      return res.json({
        status: 'success',
        message: `User permission with id:${permission_id} created.`
      });
    } catch(e) {
      next(e);
    }
  }
  async getUserPermissions (req, res, next) {
    try {
      const {user_id} = req.params;

      const user = await db.User.findOne({
        where: {user_id},
        include: [{
          model: db.Permission
        }]
      });

      if (!user.Permissions.length) {
        next(new AppError(`User has no permissions`,404))
      }

      return res.json({
        status: 'success',
        permissions: user.Permissions
      });
    } catch(e) {
      next(e);
    }
  }
  async getUserPermissionById (req, res, next) {
    try {
      const {user_id, permission_id} = req.params;

      const user = await db.User.findOne({
        where: {user_id},
        include: [{
          model: db.Permission,
          where: {permission_id}
        }]
      });

      if (!user || !user.Permissions.length) {
        next(new AppError(`User with id:${user_id} has no permission with id:${permission_id}`,404))
      }

      return res.json({
        status: 'success',
        permission: user.Permissions
      });
    } catch(e) {
      next(e);
    }
  }
  async deleteUserPermissionById (req, res, next) {
    try {
      const {user_id, permission_id} = req.params;

      await db.User_Permission.destroy({
        where: {user_id, permission_id}
      });

      return res.json({
        status: 'success',
        message: `User permission with id:${permission_id} deleted.`
      });
    } catch(e) {
      next(e);
    }
  }
}

module.exports = User;