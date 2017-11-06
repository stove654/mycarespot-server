/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /Channels              ->  index
 * POST    /Channels              ->  create
 * GET     /Channels/:id          ->  show
 * PUT     /Channels/:id          ->  update
 * DELETE  /Channels/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Channel = require('./channel.model');

// Get list of Channels
exports.index = function(req, res) {
	Channel.find({'users': {$elemMatch: {user: req.query.userId}}})
		.populate('users.user')
		.exec(function (err, channels) {
			if(err) { return handleError(res, err); }
			_.each(channels, function (value) {
			    if (value.to) {
			        var user = {
			            name: value.to.name,
                        _id: value.to.id,
                        color: value.to.color,
                        avatar: value.to.avatar,
                        phone: value.to.phone
                    };
			        value.to = user;
                }

                _.each(value.users, function (data) {
                	if (data.user) {
						data.user.contacts = null;
						data.user.country = null;
					}

				})
            });
			return res.json(200, channels);
        })

};

// Get a single Channel
exports.show = function(req, res) {
	Channel.findById(req.params.id)
		.populate('to')
		.populate('users.user')
		.exec(function (err, channel) {
			if(err) { return handleError(res, err); }
			if (channel.to) {
				var user = {
					name: channel.to.name,
					_id: channel.to.id,
					color: channel.to.color,
					avatar: channel.to.avatar,
					phone: channel.to.phone
				};
				channel.to = user;
			}

			_.each(channel.users, function (data) {
				data.user.contacts = null;
				data.user.country = null;
			})
			return res.json(channel);
		})

};

// Creates a new Channel in the DB.
exports.create = function(req, res) {
    if (req.body.isGroup) {
		Channel.create(req.body, function(err, channel) {
			if(err) { return handleError(res, err); }
            return res.status(201).json(channel);
		});
    } else {
        Channel.findOne({
            from: req.body.from,
            to: req.body.to
        }, function (err,  channel) {
            if (channel) {
                return res.status(201).json(channel);
			}
			Channel.findOne({
                from: req.body.to,
                to: req.body.from
            }, function (err, channel) {
				if (channel) {
                    return res.status(201).json(channel);
				}
				Channel.create(req.body, function(err, channel) {
					if(err) { return handleError(res, err); }
                    return res.status(201).json(channel);
				});
            })
        })
    }
};

// Updates an existing Channel in the DB.
exports.update = function(req, res) {
	if(req.body._id) { delete req.body._id; }
	Channel.findById(req.params.id, function (err, Channel) {
		if (err) { return handleError(res, err); }
		if(!Channel) { return res.send(404); }
		if (req.body.users) {
			Channel.users = null;
		}
		var updated = _.merge(Channel, req.body);
		updated.save(function (err) {
			if (err) { return handleError(res, err); }
			return res.json(200, Channel);
		});
	});
};

// Updates an existing Channel in the DB.
exports.updateDelete = function(req, res) {
	if(req.body._id) { delete req.body._id; }
	Channel.findById(req.params.id, function (err, Channel) {
		if (err) { return handleError(res, err); }
		if(!Channel) { return res.send(404); }
		var updated = _.merge(Channel, req.body);
		for (var i = 0; i < Channel.users.length; i++) {
			if (Channel.users[i].user == req.body.userId) {
				Channel.users[i].deletedAt = new Date();
			}
		}
		updated.save(function (err) {
			if (err) { return handleError(res, err); }
			return res.json(200, Channel);
		});
	});
};

// Deletes a Channel from the DB.
exports.destroy = function(req, res) {
	Channel.findById(req.params.id, function (err, Channel) {
		if(err) { return handleError(res, err); }
		if(!Channel) { return res.send(404); }
		Channel.remove(function(err) {
			if(err) { return handleError(res, err); }
			return res.send(204);
		});
	});
};

function handleError(res, err) {
	return res.send(500, err);
}