'use strict';

const cluster = require('cluster');

const config = require('config');

const log = require('./logger');

if (cluster.isMaster) {
    const cpuCount = require('os').cpus().length * 2 + 1;
    for (let i = 0; i < cpuCount; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        const pid = worker.id;
        if (!signal) {
            const reason = code;
            log.error(`Worker ${pid} died (${reason}). Restarting...`);
            cluster.fork();
        } else {
            log.error(`Worker ${pid} killed with signal ${signal}`);
        }
    });
} else {
    const app = require('./app');

    app.listen(config.server.port, err => {
        if (err) {
            log.critical(`Failed to start server: ${err.message}`);
            process.exit(1000);
        }
        log.info(`Now listening on port ${config.server.port}`);
    });
}
