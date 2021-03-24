const express = require('express');
const app = express();
const path = require('path');
const Router = require('./core/Router');
const AppError = require('./core/AppError');
const { sendErrorDev, sendErrorProd } = require('./modules/errorHandler');

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin",
      req.get('origin')
  );
  res.header("Access-Control-Allow-Methods",
      "GET,PUT,POST,DELETE"
  );
  res.header("Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Expose-Headers",
      "Authorization"
  );

  next();
});

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', new Router());


//list all available routes

// var route, routes = [];
// app._router.stack.forEach(function(middleware){
//   if(middleware.route){ // routes registered directly on the app
//     routes.push(middleware.route);
//   } else if(middleware.name === 'router'){ // router middleware
//     middleware.handle.stack.forEach(function(handler){
//       route = handler.route;
//       route && routes.push(route);
//     });
//   }
// });
// console.log('ROUTES', routes);


app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.method} ${req.originalUrl} on this server!`, 404));
});

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    sendErrorProd(err, res);
  }
});

module.exports = app;
