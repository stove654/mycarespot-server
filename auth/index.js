'use strict';

var express = require('express');
var User = require('../api/user/user.model');

var router = express.Router();
router.use('/local', require('./local'));
router.use('/phone', require('./phone'));


module.exports = router;