/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /Storys              ->  index
 * POST    /Storys              ->  create
 * GET     /Storys/:id          ->  show
 * PUT     /Storys/:id          ->  update
 * DELETE  /Storys/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Story = require('./story.model');
var moment = require('moment');

// Get list of Storys
exports.index = function (req, res) {
    var today = new Date();
    var yesterday = new Date(new Date().setDate(new Date().getDate()-1));
    console.log(today, yesterday)
    Story.find({
        createdAt: {
            $gte: yesterday,
            $lt: today
        }
    })
        .populate('user')
        .exec(function (err, Storys) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, Storys);
        })
};

// Get a single Story
exports.show = function (req, res) {
    Story.findById(req.params.id)
        .populate('user')
        .exec(function (err, story) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(story);
        })
};

// Creates a new Story in the DB.
exports.create = function (req, res) {
    Story.create(req.body, function (err, Story) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, Story);
    });
};

// Updates an existing Story in the DB.
exports.update = function (req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Story.findById(req.params.id, function (err, Story) {
        if (err) {
            return handleError(res, err);
        }
        if (!Story) {
            return res.send(404);
        }
        var updated = _.merge(Story, req.body);
        updated.save(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, Story);
        });
    });
};

// Deletes a Story from the DB.
exports.destroy = function (req, res) {
    Story.findById(req.params.id, function (err, Story) {
        if (err) {
            return handleError(res, err);
        }
        if (!Story) {
            return res.send(404);
        }
        Story.remove(function (err) {
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