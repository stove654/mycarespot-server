'use strict';

var User = require('./user.model');
var config = require('../../config/config.js');
var jwt = require('jsonwebtoken');
var _ = require('lodash');

var validationError = function (res, err) {
    return res.json(422, err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function (req, res) {
	var query = req.query || {};
    User.find(query, '-salt -hashedPassword')
        .sort({updatedAt:-1})
        .exec(function (err, users) {
            if(err) { return handleError(res, err); }
            return res.json(200, users);
        })
};

// Updates an existing thing in the DB.
exports.update = function(req, res) {
    if(req.body._id) { delete req.body._id; }
    User.findById(req.params.id, function (err, user) {
        if (err) { return handleError(res, err); }
        if(!user) { return res.send(404); }
        var updated = _.merge(user, req.body);
        updated.save(function (err) {
            if (err) { return handleError(res, err); }
            return res.json(200, user);
        });
    });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
	User.findOne({id: req.body.id}, function (err, user) {
		if (err) return next(err);
		if (!user) {
			var newUser = new User(req.body);
			newUser.provider = 'local';
			newUser.role = newUser.role|| 'user';
			newUser.save(function (err, user) {
				if (err) return validationError(res, err);
				res.json(200, user);
			});
		} else {
			User.findById(user._id, function (err, user) {
				if (err) { return handleError(res, err); }
				if(!user) { return res.send(404); }
				if (req.body.mycarespot) {
					user.mycarespot = null
				}
				var updated = _.merge(user, req.body);
				updated.save(function (err, user) {
					if (err) { return handleError(res, err); }
					return res.json(200, user);
				});
			});
		}
	});

};


/**
 * Get a single user
 */
exports.show = function (req, res, next) {
    var userId = req.params.id;

    User.findById(userId, function (err, user) {
        if (err) return next(err);
        if (!user) return res.send(401);
		res.json(200, user);
	});
};


/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function (req, res) {
    User.findByIdAndRemove(req.params.id, function (err, user) {
        if (err) return res.send(500, err);
        return res.send(204);
    });
};

/**
 * Change a users password
 */
exports.changePassword = function (req, res, next) {
    var userId = req.user._id;
    var oldPass = String(req.body.oldPassword);
    var newPass = String(req.body.newPassword);

    User.findById(userId, function (err, user) {
        if (user.authenticate(oldPass)) {
            user.password = newPass;
            user.save(function (err) {
                if (err) return validationError(res, err);
                res.send(200);
            });
        } else {
            res.send(403);
        }
    });
};

/**
 * Get my info
 */
exports.me = function (req, res, next) {
    var userId = req.user._id;
    User.findOne({
        _id: userId
    }, '-salt -hashedPassword', function (err, user) { // don't ever give out the password or salt
        if (err) return next(err);
        if (!user) return res.json(401);
        res.json(user);
    });
};

/**
 * Authentication callback
 */
exports.authCallback = function (req, res, next) {
    res.redirect('/');
};

function handleError(res, err) {
    return res.send(500, err);
}