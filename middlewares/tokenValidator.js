const jwt = require('jsonwebtoken');
const db = require('../models');
const jwt_key = process.env.JWT_SECRET;
const AppError = require('../core/AppError');

const tokenValidator = async (req, res, next) => {
    let userToken = req.headers.authorization;
    let userSecret = req.headers.user_secret;

    if (userSecret && userSecret === process.env.SUPER_ADMIN_SECRET) {
        res.locals.isUserSuperAdmin = true;
        return next();
    }

    if (!userToken) {
        return next(new AppError('No Token provided.', 400));
    }

    // removing 'Bearer ' from authorization token
    userToken = userToken.slice(7);

    const user = await db.User.findOne({ where: { token: userToken }, include: [{
        model: db.Role
    }, {
        model: db.Permission
    }]});

    if (!user) {
        return next(new AppError(`User with token:${userToken} not found`, 404));
    }
    res.locals.getUser = user;

    jwt.verify(userToken, jwt_key, function (err, decoded) {
        if (err) {
            return next(new AppError(err));
        }

        req.tokenDecodedData = decoded;
        req.isAuthenticated = true;

        return next();
    });
};

module.exports = tokenValidator;
