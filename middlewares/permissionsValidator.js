const AppError = require('../core/AppError');

const permissionsValidator = async (req, res, next) => {
    const user = res.locals.getUser;
    const url = req.url;
    const method = req.method.toLowerCase();
    let isUserSuperAdmin = res.locals.isUserSuperAdmin || false;

    if (!isUserSuperAdmin) {
        let userSecret = req.headers.user_secret;
        if (userSecret && userSecret === process.env.SUPER_ADMIN_SECRET) {
            res.locals.isUserSuperAdmin = true;
            return next();
        }
    } else {
        return next();
    }

    let permissions = user.Permissions || [];
    if (permissions.length) {
        permissions = permissions.map(permission => permission.name);
    } else {
        return next(new AppError('You dont have any permissions. Please contact restaurant owner.'));
    }

    if (permissions.includes('block')) {
        return next(new AppError('You have been blocked. Please contact restaurant owner.'));
    }
    if (url === '/' && permissions.includes('index')) {
        return next();
    } else if (url === '/login' && permissions.includes('login')) {
        return next();
    } else {
        let urlPaths = url.replace(/\//g,' ').split(' ');
        urlPaths.shift();

        if (permissions.includes(`${method}_${urlPaths[0]}${urlPaths[2] ? ('_' + urlPaths[2]) : ''}`)) {
            return next();
        } else {
            return next(new AppError('You dont have permissions', 400));
        }
    }
};

module.exports = permissionsValidator;
