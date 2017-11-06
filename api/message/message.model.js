'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
	User = require('../user/user.model'),
	Channel = require('../channel/channel.model')

var MessageSchema = new Schema({
	from: {
		userId: { type: Schema.Types.ObjectId, ref: 'User' },
		color: String,
		name: String,
		phone: String,
		avatar: String
	},
	to: { type: Schema.Types.ObjectId, ref: 'User' },
	text: String,
	channel: { type: Schema.Types.ObjectId, ref: 'Channel' },
	image: String,
	voiceMessage: String,
	sticker: String,
	video: String,
	contact: {},
	location: {}
}, {
	timestamps: true
});

module.exports = mongoose.model('Message', MessageSchema);