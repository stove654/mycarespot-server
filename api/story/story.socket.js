/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var story = require('./story.model');

exports.register = function(socket) {
  story.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  story.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('story:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('story:remove', doc);
}