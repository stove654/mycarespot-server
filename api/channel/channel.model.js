'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ChannelSchema = new Schema({
    users: [],
    from: String,
    to: String,
    lastMessage: String,
    lastMessageTime: Date,
    isGroup: {
        type: Boolean,
        default: false
    },
    avatar: String,
    name: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Channel', ChannelSchema);