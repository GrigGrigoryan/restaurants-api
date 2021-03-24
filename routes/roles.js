const tokenValidator = require('../middlewares/tokenValidator');
const {validateRoleData} = require('../middlewares/dataValidators');
const roleValidator = require('../middlewares/roleValidator');
const permissionsValidator = require('../middlewares/permissionsValidator');
const {Op} = require("sequelize");
const db = require('../models');
const AppError = require('../core/AppError');
const rolesInitialData = require('../assets/rolesData');

class Role {
    constructor() {}

    get public() {
        return {
            '/': {
                get: {
                    route: this.getRoles,
                    middleware: [ tokenValidator, roleValidator, permissionsValidator, validateRoleData]
                },
                post: {
                    route: this.initRoles,
                    middleware: [ tokenValidator, roleValidator, permissionsValidator, validateRoleData]
                }
            },
            '/:role_id': {
                get: {
                    route: this.getRoleById,
                    middleware: [tokenValidator, roleValidator, permissionsValidator, validateRoleData]
                },
                post: {
                    route: this.createRole,
                    middleware: [ tokenValidator, roleValidator, permissionsValidator, validateRoleData]
                },
                put: {
                    route: this.updateRoleById,
                    middleware: [tokenValidator, roleValidator, permissionsValidator, validateRoleData]
                },
                delete: {
                    route: this.deleteRoleById,
                    middleware: [tokenValidator, roleValidator, permissionsValidator, validateRoleData]
                }
            }
        };
    }

    async getRoles (req, res, next) {
        try {
            console.log('req', req);
            const query = req.query;
            const where = {};
            query.name_like && (where["name"] = {[Op.like]: name});

            const roles = await db.Role.findAll({where});
            if (!roles.length) {
                if (!Object.keys(where).length) {
                    await this.initRoles();
                }
                return next(new AppError(`Roles not found.`, 404));
            }
            return res.json({
                status: 'success',
                roles
            });
        } catch(e) {
            next(e);
        }
    }
    async initRoles (req, res, next) {
        try {
            const roles = await db.Role.bulkCreate(rolesInitialData, {returning: true});

            return res.json({
                status: 'success',
                message: 'roles initialized.',
                roles
            });
        } catch (e) {
            next(e);
        }
    }
    async createRole (req, res, next) {
        try {
            let {role_id, name, is_active} = req.body;
            if (role_id) {
                role_id = req.params.role_id;
            }

            if (is_active === 'true') {
                is_active = true;
            } else if (is_active === 'false') {
                is_active = false;
            }

            const create = await db.Role.create({role_id, name, is_active});
            const role = await create.get({plain: true});
            if (!role) {
                return next(new AppError(`Role not created.`, 404));
            }
            return res.json({
                status: 'success',
                role
            });
        } catch(e) {
            next(e);
        }
    }
    async getRoleById (req, res, next) {
        try {
            const {role_id} = req.params;
            const role = await db.Role.findByPk(role_id);
            if (!role) {
                return next(new AppError(`Role with id:${role_id} not found.`, 404));
            }
            return res.json({
                status: 'success',
                role
            });
        } catch(e) {
            next(e);
        }
    }
    async updateRoleById (req, res, next) {
        try {
            const {role_id} = req.params;
            let {name, is_active} = req.body;
            if (is_active === 'true') {
                is_active = true;
            } else if (is_active === 'false') {
                is_active = false;
            }

            let update = {};
            name && (update["name"] = name);
            is_active && (update["is_active"] = is_active);

            const role = await db.Role.update(update, {where: {role_id}, returning: true});

            return res.send({
                status: 'success',
                message: 'Role updated.'
            });
        } catch(e) {
            next(e);
        }
    }
    async deleteRoleById (req, res, next) {
        try {
            const {role_id} = req.params;
            const role = await db.Role.destroy({where: {role_id}});
            if (!role) {
                return next(new AppError(`Role with id:${role_id} not found.`, 404))
            }

            return res.send({
                status: 'success',
                message: 'Role deleted.'
            });
        } catch(e) {
            next(e);
        }
    }
}

module.exports = Role;