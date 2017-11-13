'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    User = require('../user/user.model');
var FeedbackSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    text: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Feedback', FeedbackSchema);