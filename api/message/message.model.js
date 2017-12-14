'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
	Channel = require('../channel/channel.model')

var MessageSchema = new Schema({
	from: {},
	text: String,
	channel: { type: Schema.Types.ObjectId, ref: 'Channel' },
	image: String,
	voiceMessage: String,
	sticker: String,
	video: String,
	contact: {},
	location: {},
	fileType: String,
	audio: String,
	pdf: String
}, {
	timestamps: true
});

module.exports = mongoose.model('Message', MessageSchema);