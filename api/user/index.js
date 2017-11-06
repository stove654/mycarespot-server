'use strict';

var express = require('express');
var controller = require('./user.controller');
var auth = require('../../auth/auth.service');
var router = express.Router();

router.post('/', controller.create);
router.put('/:id',  auth.isAuthenticated(),controller.update);
router.get('/:id', controller.show);
router.get('/', auth.isAuthenticated(), controller.index);

module.exports = router;
