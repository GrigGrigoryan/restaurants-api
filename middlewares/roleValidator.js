const AppError = require('../core/AppError');

const roleValidator = async (req, res, next) => {
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

    let roles = user.Roles || [];
    if (!roles.length) {
        return next(new AppError('You dont have any roles. Please contact restaurant owner.'));
    } else {
        roles = roles.map(role => role.name);
    }
    let urlPaths = url.replace(/\//g,' ').split(' ');
    urlPaths.shift();
    if (url === '/' || url === '/login' || res.locals.isUserSuperAdmin) {
        return next();
    }

    roles.forEach(role => {
        switch(role) {
            case 'super_admin':
                res.locals.isUserSuperAdmin = true;
                return next();
            case 'admin':
                return next();
            case 'owner':
                if (urlPaths[0] === 'restaurants' || urlPaths[0] === 'meals') {
                    return next();
                } else if ((urlPaths[2] && urlPaths[2] === 'permissions') && (method === 'get' || method === 'post' || method === 'delete')) {
                    return next();
                } else {
                    return next(new AppError("You don't have privileges", 400));
                }
            case 'client':
                if ((urlPaths[0] === 'restaurants' || urlPaths[0] === 'meals') && method === 'get') {
                    return next();
                } else {
                    return next(new AppError("You don't have privileges", 400));
                }
            default:
                return next(new AppError('You dont have any roles'));
        }
    });
};

module.exports = roleValidator;
