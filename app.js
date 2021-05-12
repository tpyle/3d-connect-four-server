'use strict';

const express = require('express');
const cors = require('cors');
const config = require('config');

const api = require('./api');
const logger = require('./logger');
const logMiddleware = require('./log-middleware');

const app = express();

if (process.env.NODE_ENV === 'production') {
    app.enable('trust proxy');
}

app.use(logMiddleware(logger));

app.use(cors({
    origin: (origin, cb) => {
        if (origin === undefined
            || config.client.hostnames.indexOf(origin) >= 0
            || process.env.NODE_ENV === 'development'
            || process.env.NODE_ENV === undefined) {
            cb(null, origin || true);
        } else {
            cb(new Error('Not Allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200,
}));

app.use('/api', api);

app.use((err, req, res, next) => {
    if (err) {
        req.log.error(JSON.stringify(err.message));
        res.status(409).json({ message: err.message });
    } else {
        next();
    }
});

module.exports = app;
