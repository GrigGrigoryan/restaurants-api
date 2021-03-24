const bcrypt = require('bcrypt');
const db = require('../models');
const AppError = require('../core/AppError');
const emailRegexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const validateRegisterData = async (req, res, next) => {
    const {first_name, last_name, email, password, repeat_password} = req.body;
    const errors = [];

    if (!first_name.length || !last_name.length || !password.length || !repeat_password.length || !email.length) {
        errors.push({"fields": "fields are required."});
    } else {
        if (first_name.length < 3) {
            errors.push({"first_name": "first_name must be greater than 3."});
        }
        if (last_name.length < 3) {
            errors.push({"last_name": "last_name must be greater than 3."});
        }
        if (password.length < 3) {
            errors.push({"password": "password must be greater than 3."});
        }
        if (password !== repeat_password) {
            errors.push({"password": "wrong password"});
        }
        if (!emailRegexp.test(email)) {
            errors.push({"email": "wrong email."});
        }

        const user = await db.User.findOne({where: {email}});
        if (user) {
            errors.push({"email": "Email already exist."});
        }
    }

    if (errors.length) {
        return next(new AppError(JSON.stringify(errors)));
    }
    next();
};
const validateLoginData = async (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    if (!email.length || !password.length) {
        errors.push({"fields": "Fields are required."});
    } else {
        if (password.length < 3) {
            errors.push({"password": "password must be greater than 3."});
        }
        if (!emailRegexp.test(email)) {
            errors.push({"email": "wrong email."});
        }

        const user = await db.User.findOne({where: {email}});
        if (!user) {
            errors.push({"email": `User with email: ${email} not found`});
        } else {
            const compareResult = await bcrypt.compare(password, user.password);
            if (!compareResult) {
                errors.push({"email/password": "Wrong email and/or password."});
            } else {
                res.locals.getUser = user;
            }
        }
    }

    if (Object.keys(errors).length) {
        return next(new AppError(JSON.stringify(errors), 400))
    }

    next();
};

const validateRestaurantData = (req, res, next) => {
    const { name, meals_type } = req.body;
    const errors = [];

    if (req.method === 'POST') {
        if (!name.length || !meals_type.length) {
            errors.push({"fields": "Fields are required."});
        } else {
            if (name.length < 3) {
                errors.push({"name": "name must be greater than 3."});
            }
            if (meals_type.length < 3) {
                errors.push({"meals_type": "meals_type must be greater than 3."});
            }
        }
    }

    if (Object.keys(errors).length) {
        return next(new AppError(JSON.stringify(errors), 400))
    }
    next();
};
const validateMealData = async (req, res, next) => {
    const { type, name, description, price } = req.body;
    const errors = [];

    if (req.method === 'POST') {
        if (!type && !name && !description && !price) {
            errors.push({"fields": "Fields are required."});
        } else {
            if (type.length < 3) {
                errors.push({"type": "type must be greater than 3."});
            }
            if (name.length < 3) {
                errors.push({"name": "name must be greater than 3."});
            }
            if (description.length < 3) {
                errors.push({"meals_type": "meals_type must be greater than 3."});
            }
            if (parseInt(price) < 0) {
                errors.push({"price": "price must be 0 and above."});
            }
        }
    } else if (req.method === 'PUT') {
        if (price) {
            if (parseInt(price) < 0) {
                errors.push({"price": "price must be 0 and above."});
            }
        }
    }

    if (Object.keys(errors).length) {
        return next(new AppError(JSON.stringify(errors), 400));
    }
    next();
};

const validateUserData = async (req, res, next) => {
    const { first_name, last_name, email, password, repeat_password, token} = req.body;
    const errors = [];

    if (req.method === 'POST') {
        if (!first_name.length || !last_name.length || !password.length || !repeat_password.length || !email.length) {
            errors.push({"fields": "fields are required."});
        } else {
            // validations
            if (first_name.length < 3) {
                errors.push({"first_name": "first_name must be greater than 3."});
            }
            if (last_name.length < 3) {
                errors.push({"last_name": "last_name must be greater than 3."});
            }
            if (password.length < 3) {
                errors.push({"password": "password must be greater than 3."});
            }
            if (password !== repeat_password) {
                errors.push({"password": "wrong password"});
            }
            if (!emailRegexp.test(email)) {
                errors.push({"email": "wrong email."});
            }

            const user = await db.User.findOne({where: {email}});
            if (user) {
                errors.push({"email": "Email already exist."});
            }
        }
    } else if (req.method === 'PUT') {
        if (first_name && first_name.length < 3) {
            errors.push({"first_name": "first_name must be greater than 3."});
        }
        if (last_name && last_name.length < 3) {
            errors.push({"last_name": "last_name must be greater than 3."});
        }
    }

    if (errors.length) {
        return next(new AppError(JSON.stringify(errors)));
    }
    next();
};

const validateRoleData = (req, res, next) => {
    let {role_id, name, is_active} = req.body;
    if (!role_id) {
        role_id = req.params.role_id;
    }

    const errors = [];

    if (req.method === 'POST' && req.url !== '/roles') {
        if (!role_id || !name || !is_active) {
            errors.push({"fields": "Fields are required"});
        } else {
            if (name && name.length < 3) {
                errors.push({"name": "name must be greater than 3."});
            }
            if (is_active && (is_active !== 'true' || is_active !== 'false')) {
                errors.push({"is_active": "is_active must be true or false"});
            }
        }
    } else if (req.method === 'PUT') {
        if (name && name.length < 3) {
            errors.push({"name": "name must be greater than 3."});
        }
        if (is_active && (is_active !== 'true' || is_active !== 'false')) {
            errors.push({"is_active": "is_active must be true or false"});
        }
    } else if (req.method === 'DELETE') {
        if (!role_id) {
            errors.push({"permission_id": "permission_id is required"})
        }
    }

    if (Object.keys(errors).length) {
        return next(new AppError(JSON.stringify(errors), 400))
    }
    return next();
};
const validatePermissionData = (req, res, next) => {
    let {permission_id, name, is_active} = req.body;
    if (!permission_id) {
        permission_id = req.params;
    }

    const errors = [];

    if (req.method === 'POST' && req.url !== '/permissions') {
        if (!permission_id || !name || !is_active) {
            errors.push({"fields": "Fields are required"});
        } else {
            if (name && name.length < 3) {
                errors.push({"name": "name must be greater than 3."});
            }
            if (is_active && (is_active !== 'true' || is_active !== 'false')) {
                errors.push({"is_active": "is_active must be true or false"});
            }
        }
    } else if (req.method === 'PUT') {
        if (name && name.length < 3) {
            errors.push({"name": "name must be greater than 3."});
        }
        if (is_active && (is_active !== 'true' || is_active !== 'false')) {
            errors.push({"is_active": "is_active must be true or false"});
        }
    } else if (req.method === 'DELETE') {
        if (!permission_id) {
            errors.push({"permission_id": "permission_id is required"})
        }
    }

    if (Object.keys(errors).length) {
        return next(new AppError(JSON.stringify(errors), 400))
    }
    next();
};

module.exports = {
    validateRegisterData,
    validateLoginData,
    validateRestaurantData,
    validateMealData,
    validateUserData,
    validateRoleData,
    validatePermissionData
};
