

'use strict';

var _ = require('lodash');
var config = require('../../config/config.js');
var client = require('twilio')(config.accountSid, config.authToken);

// Get list of things
exports.index = function(req, res) {
    client.tokens.create({}, function(err, token) {
        res.json(200, token.iceServers);
    });
};


function handleError(res, err) {
  return res.send(500, err);
}