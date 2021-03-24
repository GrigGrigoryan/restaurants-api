const tokenValidator = require('../middlewares/tokenValidator');
const {validatePermissionData} = require('../middlewares/dataValidators');
const roleValidator = require('../middlewares/roleValidator');
const permissionsValidator = require('../middlewares/permissionsValidator');
const {Op} = require("sequelize");
const db = require('../models');
const AppError = require('../core/AppError');
const PermissionsInitialData = require('../assets/permissionsData');

class Permission {
    constructor() {}

    get public() {
        return {
            '/': {
                get: {
                    route: this.getPermissions,
                    middleware: [ tokenValidator, roleValidator, permissionsValidator, validatePermissionData]
                },
                post: {
                    route: this.initPermissions,
                    middleware: [ tokenValidator, roleValidator, permissionsValidator, validatePermissionData]
                }
            },
            '/:permission_id': {
                get: {
                    route: this.getPermissionById,
                    middleware: [tokenValidator, roleValidator, permissionsValidator, validatePermissionData]
                },
                post: {
                    route: this.createPermission,
                    middleware: [tokenValidator, roleValidator, permissionsValidator, validatePermissionData]
                },
                put: {
                    route: this.updatePermissionById,
                    middleware: [tokenValidator, roleValidator, permissionsValidator, validatePermissionData]
                },
                delete: {
                    route: this.deletePermissionById,
                    middleware: [tokenValidator, roleValidator, permissionsValidator, validatePermissionData]
                }
            }
        };
    }

    async initPermissions (req, res, next) {
        try {
            const permissions = await db.Permission.bulkCreate(PermissionsInitialData, {returning: true});

            return res.json({
                status: 'success',
                message: 'permissions initialized.',
                permissions
            });
        } catch (e) {
            next(e);
        }
    }

    async getPermissions (req, res, next) {
        try {
            const query = req.query;
            const where = {};
            query.name_like ? where["name"] = {[Op.like]: name} : null;

            const permissions = await db.Permission.findAll({where});
            if (!permissions.length) {
                if (!Object.keys(where).length) {
                    await this.initPermissions();
                }
                return next(new AppError(`Permissions not found.`, 404));
            }

            return res.json({
                status: 'success',
                permissions
            });
        } catch(e) {
            next(e);
        }
    }
    async createPermission (req, res, next) {
        try {
            let {permission_id, name, is_active} = req.body;
            if (!permission_id) {
                permission_id = req.params.permission_id;
            }
            if (is_active === 'true') {
                is_active = true;
            } else if (is_active === 'false') {
                is_active = false;
            }
            const create = await db.Permission.create({permission_id, name, is_active});
            const permission = await create.get({plain: true});
            if (!permission) {
                return next(new AppError(`Permission not created.`, 400));
            }
            return res.json({
                status: 'success',
                permission
            });
        } catch(e) {
            next(e);
        }
    }
    async getPermissionById (req, res, next) {
        try {
            const {permission_id} = req.params;
            const permission = await db.Permission.findByPk(permission_id);
            if (!permission) {
                return next(new AppError(`Permission with id:${permission_id} not found.`, 404));
            }
            return res.json({
                status: 'success',
                permission
            });
        } catch(e) {
            next(e);
        }
    }
    async updatePermissionById (req, res, next) {
        try {
            const {permission_id} = req.params;
            let {name, is_active} = req.body;
            if (is_active === 'true') {
                is_active = true;
            } else if (is_active === 'false') {
                is_active = false;
            }

            let update = {};
            name && (update["name"] = name);
            is_active && (update["is_active"] = is_active);

            const permission = await db.Permission.update(update, {
                where: {permission_id},
                returning: true
            });

            return res.send({
                status: 'success',
                message: 'Permission updated.'
            });
        } catch(e) {
            next(e);
        }
    }
    async deletePermissionById (req, res, next) {
        try {
            const {permission_id} = req.params;
            const permission = await db.Permission.destroy({where: {permission_id}});
            if (!permission) {
                return next(new AppError(`Permission with id:${permission_id} not found.`, 404))
            }

            return res.send({
                status: 'success',
                message: 'Permission deleted.'
            });
        } catch(e) {
            next(e);
        }
    }
}

module.exports = Permission;