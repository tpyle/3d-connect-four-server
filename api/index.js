'use strict';

const express = require('express');

const router = express.Router();

router.use('*', (_, res) => {
    res.sendStatus(404);
});

module.exports = router;
