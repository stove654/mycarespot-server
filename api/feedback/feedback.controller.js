/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /Feedbacks              ->  index
 * POST    /Feedbacks              ->  create
 * GET     /Feedbacks/:id          ->  show
 * PUT     /Feedbacks/:id          ->  update
 * DELETE  /Feedbacks/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Feedback = require('./feedback.model');

// Get list of Feedbacks
exports.index = function(req, res) {
  Feedback.find(function (err, Feedbacks) {
    if(err) { return handleError(res, err); }
    return res.json(200, Feedbacks);
  });
};

// Get a single Feedback
exports.show = function(req, res) {
  Feedback.findById(req.params.id, function (err, Feedback) {
    if(err) { return handleError(res, err); }
    if(!Feedback) { return res.send(404); }
    return res.json(Feedback);
  });
};

// Creates a new Feedback in the DB.
exports.create = function(req, res) {
  Feedback.create(req.body, function(err, Feedback) {
    if(err) { return handleError(res, err); }
    return res.json(201, Feedback);
  });
};

// Updates an existing Feedback in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Feedback.findById(req.params.id, function (err, Feedback) {
    if (err) { return handleError(res, err); }
    if(!Feedback) { return res.send(404); }
    var updated = _.merge(Feedback, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, Feedback);
    });
  });
};

// Deletes a Feedback from the DB.
exports.destroy = function(req, res) {
  Feedback.findById(req.params.id, function (err, Feedback) {
    if(err) { return handleError(res, err); }
    if(!Feedback) { return res.send(404); }
    Feedback.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}