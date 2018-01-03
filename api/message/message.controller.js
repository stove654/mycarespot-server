/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /Messages              ->  index
 * POST    /Messages              ->  create
 * GET     /Messages/:id          ->  show
 * PUT     /Messages/:id          ->  update
 * DELETE  /Messages/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Message = require('./message.model');
var Channel = require('../channel/channel.model');
var config = require('../../config/config.js');

var sendNotification = function(data) {
	var headers = {
		"Content-Type": "application/json; charset=utf-8",
		"Authorization": "Basic " + config.oneSignalKey
	};

	var options = {
		host: "onesignal.com",
		port: 443,
		path: "/api/v1/notifications",
		method: "POST",
		headers: headers
	};

	var https = require('https');
	var req = https.request(options, function(res) {
		res.on('data', function(data) {
		});
	});

	req.on('error', function(e) {
		console.log("ERROR:");
		console.log(e);
	});
    req.on('success', function(e) {
        console.log("done:");
    });
	req.write(JSON.stringify(data));
	req.end();
};


// Get list of Messages
exports.index = function (req, res) {
	var query = {
		channel: req.query.channel
	};
	if (req.query.deletedAt) {
		query.createdAt = {
			$gte: req.query.deletedAt,
			$lt: new Date()
		}
	}
	Message.find(query)
		.limit(100)
		.sort({'created_at' : -1})
		.exec(function (err, Messages) {
			if (err) {
				return handleError(res, err);
			}
            return res.status(200).json(Messages);
		});
};

// Get a single Message
exports.show = function (req, res) {
	Message.findById(req.params.id, function (err, Message) {
		if (err) {
			return handleError(res, err);
		}
		if (!Message) {
			return res.send(404);
		}
		return res.json(Message);
	});
};

// Creates a new Message in the DB.
exports.create = function (req, res) {
	Message.create(req.body, function (err, Message) {
		if (err) {
			return handleError(res, err);
		}

		Channel.findById(req.body.channel)
			.populate('userPush')
			.exec(function (err, Channel) {
				var users = JSON.parse(JSON.stringify(Channel.users));
				var datas = JSON.parse(JSON.stringify(Channel.userPush));

				for (var i = 0; i < users.length; i++) {
					if (users[i].userId == req.body.from.userId) {
						users[i].read = 0;
					} else {
						users[i].read += 1;
					}
				}

				Channel.users = null;
				var lastMessage = req.body.text;

				if (!lastMessage) {
					if (req.body.image) {
						lastMessage = 'Sent image'
					}
					if (req.body.voiceMessage) {
						lastMessage = 'Sent voice message'
					}

					if (req.body.sticker) {
						lastMessage = 'Sent sticker'
					}
					if (req.body.video) {
						lastMessage = 'Sent video'
					}
					if (req.body.contact) {
						lastMessage = 'Sent contact'
					}
					if (req.body.location) {
						lastMessage = 'Sent location'
					}
				}
				var updated = _.merge(Channel, {lastMessage: lastMessage, lastMessageTime: new Date(), users: users});
				updated.save();
				var usersPush = [];
				for (var j = 0; j < datas.length; j++) {
					if (datas[j] && datas[j]._id != req.body.from._id) {
						usersPush.push(datas[j].userPush)
					}
				}
				if (usersPush.length) {
					var message = {
						app_id: config.oneSignalAppId,
						contents: {"en": lastMessage, "es": lastMessage},
						headings: {"en": req.body.from.name, "es": req.body.from.name},
						include_player_ids: usersPush,
						data: {
							"channel": Channel._id
						}
					};
					sendNotification(message);
				}

			});

        return res.status(201).json(Message);
	});
};

// Updates an existing Message in the DB.
exports.update = function (req, res) {
	if (req.body._id) {
		delete req.body._id;
	}
	Message.findById(req.params.id, function (err, Message) {
		if (err) {
			return handleError(res, err);
		}
		if (!Message) {
			return res.send(404);
		}
		var updated = _.merge(Message, req.body);
		updated.save(function (err) {
			if (err) {
				return handleError(res, err);
			}
			return res.json(200, Message);
		});
	});
};

// Deletes a Message from the DB.
exports.destroy = function (req, res) {
	Message.findById(req.params.id, function (err, Message) {
		if (err) {
			return handleError(res, err);
		}
		if (!Message) {
			return res.send(404);
		}
		Message.remove(function (err) {
			if (err) {
				return handleError(res, err);
			}
			return res.send(204);
		});
	});
};

function handleError(res, err) {
	return res.send(500, err);
}