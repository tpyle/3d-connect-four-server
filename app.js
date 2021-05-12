'use strict';

const express = require('express');
const cors = require('cors');
const config = require('config');
const session = require('express-session');
const redis = require('redis');
const RedisStore = require('connect-redis')(session);
const redisClient = redis.createClient();

const api = require('./api');
const logger = require('./logger');
const logMiddleware = require('./log-middleware');


const HOUR = 60 * 60 * 1000;


const app = express();

if (process.env.NODE_ENV === 'production') {
    app.enable('trust proxy');
}

app.use(logMiddleware(logger));

app.use(session({
    cookie: {
        maxAge: 6 * HOUR,
    },
    name: 'sid',
    store: new RedisStore({ client: redisClient }),
    secret: config.server.sessionSecrets,
    resave: false,
    saveUninitialized: false,
}));

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
