'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ChannelSchema = new Schema({
    users: [{
		userId: {type: Schema.Types.ObjectId, ref: 'User'},
		read: 0
	}],
    from: String,
    to: String,
    lastMessage: String,
    lastMessageTime: Date,
    isGroup: {
        type: Boolean,
        default: false
    },
    avatar: String,
    name: String,
	userPush: [
		{type: Schema.Types.ObjectId, ref: 'User'}
	]
}, {
    timestamps: true
});

module.exports = mongoose.model('Channel', ChannelSchema);