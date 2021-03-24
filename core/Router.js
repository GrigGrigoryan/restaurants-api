const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

class Router {
    constructor() {
        this.addRoutes();
        return router;
    }

    addRoutes() {
        const routeFilesPath = path.join(__dirname, '../routes');
        const routeFiles = fs.readdirSync(routeFilesPath);

        routeFiles.forEach(routeFile => {
            const routeFilePath = path.join(routeFilesPath, routeFile);
            const routeName = routeFile.replace(/\.js$/, '').toLowerCase();

            const RouteClass = require(routeFilePath);
            const routeInst = new RouteClass();
            const publicRoutes = routeInst.public;

            for (const route in publicRoutes) {
                for (const method in publicRoutes[route]) {
                    const currentRouteObj = publicRoutes[route][method];
                    const currentRouteMiddleware = currentRouteObj.middleware || [];

                    let endpoint = '';
                    if (routeName === 'index') {
                        endpoint = `${route}`;
                    } else {
                        endpoint = `/${routeName}${route === '/' ? '' : route}`;
                    }

                    router[method](endpoint, currentRouteMiddleware, currentRouteObj.route.bind(routeInst));
                }
            }
        });
    }
}

module.exports = Router;
