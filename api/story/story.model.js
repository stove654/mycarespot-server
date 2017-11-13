'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    User = require('../user/user.model');

var StorySchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    caption: String,
    image: String,
    video: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Story', StorySchema);