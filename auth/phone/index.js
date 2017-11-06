'use strict';

var express = require('express');
var auth = require('../auth.service');
var User = require('../../api/user/user.model');
var request = require('request');
var config = require('../../config/config');
var router = express.Router();
var jwt = require('jsonwebtoken');
var _ = require('lodash');

router.post('/', function(req, res, next) {
    var url = "https://graph.accountkit.com/v1.1/access_token?grant_type=authorization_code&code=" + req.body.code + "&access_token=AA|892199504260210|6f963fe06ebc888cdd74d55fd159f6ab";
    console.log('url', url);
    request(url, function (error, response, body) {
        if (!error) {
            var data = JSON.parse(body);
            var accessToken = data.access_token;
            console.log(accessToken)
            var urlGetInfo = 'https://graph.accountkit.com/v1.1/me/?access_token=' + accessToken;

            request(urlGetInfo, function (error, response, body) {
                if (!error) {
                    var info = JSON.parse(body);
                    var phone = info.phone.number;
                    var countryCode = info.phone.country_prefix
                    User.findOne({
                        phone: phone
                    }, function (err, user) {
                        if (err) return res.send(500, err);

                        if (user) {
                            var token = auth.signToken(user._id, user.role);

                            res.json(200, {
                                token: token,
                                user: user
                            });
                        } else {
                            var newUser = new User();
                            newUser.provider = 'local';
                            newUser.role = 'user';
                            newUser.phone = phone;
                            newUser.countryCode = countryCode;
                            newUser.save(function (err, user) {
                                if (err) return validationError(res, err);
                                var token = auth.signToken(user._id, user.role);
                                res.json({
                                    user: user,
                                    token: token
                                });
                            });
                        }
                    });
                }
            })
        }
    });
});

module.exports = router;