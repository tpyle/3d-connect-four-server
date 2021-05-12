'use strict';

const cluster = require('cluster');
const path = require('path');

const config = require('config');
const winston = require('winston');
require('winston-daily-rotate-file');


const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.label({ label: cluster.worker ? `Worker ${cluster.worker.id}` : 'Master'}),
        winston.format.json(),
    ),
    transports: [],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.printf(({ level, message, label, timestamp }) =>
            `[${timestamp}] ${level} {${label}} : ${message}`,
        ),
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
    }));
} else {
    logger.add(new winston.transports.DailyRotateFile({
        level: config.logging.level,
        zippedArchive: true,
        filename: `${path.join(config.logging.path, '3dc4')}.%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        maxFiles: '30d',
    }));
}

module.exports = logger;
