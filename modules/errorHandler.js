const AppError = require('../core/AppError');

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        // Operational, trusted error: send message to client
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } else {
        // Programming or other unknown error
        console.error('ERROR 💥: ', err);

        res.status(500).send({
            status: 'error',
            message: 'Something went very wrong!'
        });
    }
};

module.exports = { sendErrorDev, sendErrorProd };