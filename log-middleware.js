'use strict';

const uuid = require('uuid');

const middleware = (winston) => {
    return (req, res, next) => {
        const rid = uuid.v4();
        const startTime = new Date();
        req.log = (data) => {
            winston.log({
                level: data.level,
                message: `[Request ${rid}] ${data.message}`,
            });
        };
        const _send = res.send;
        res.send = (data) => {
            const endTime = new Date();
            req.log({ level: 'info', message: `${res.statusCode} (took ${endTime - startTime} ms)` });
            req.log({ level: 'debug', message: JSON.stringify(data) });
            res.send = _send;
            res.send(data);
        };
        req.log({ level: 'info', message: `${req.method} ${req.originalUrl} arrived` });
        next();
    };
};

module.exports = middleware;
