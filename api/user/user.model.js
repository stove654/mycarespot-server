'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var authTypes = ['github', 'twitter', 'facebook', 'google'];

var UserSchema = new Schema({
    name: {
        type: String,
        default: ''
    },
    email: {type: String, lowercase: true},
    role: {
        type: String,
        default: 'user'
    },
    hashedPassword: String,
    provider: String,
    salt: String,
    facebook: {},
    twitter: {},
    google: {},
    github: {},
    phone: String,
    country: {},
    contacts: [],
    active: {
        type: Boolean,
        default: true
    },
    deleteAt: Date,
    timestamp: Number,
    avatar: String,
    code: String,
    pushToken: String,
    status: String,
    socketId: String,
    online: Boolean,
    countryCode: Number,
    block: [
        {
            userId: { type: Schema.Types.ObjectId, ref: 'User' },
            name: String,
            phone: String
        }
    ],
    notification: {
        type: Boolean,
        default: true
    },
    hideInfo: {
        type: Boolean,
        default: false
    },
    userPush: String,
    color: {
        type: String,
        default: getRandomColor()
    }
}, {
    timestamps: true
});

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Public profile information
UserSchema
    .virtual('profile')
    .get(function () {
        return {
            'name': this.name,
            'role': this.role
        };
    });

// Non-sensitive info we'll be putting in the token
UserSchema
    .virtual('token')
    .get(function () {
        return {
            '_id': this._id,
            'role': this.role
        };
    });

/**
 * Validations
 */

// Validate empty email
UserSchema
    .path('phone')
    .validate(function (email) {
        if (authTypes.indexOf(this.provider) !== -1) return true;
        return email.length;
    }, 'Phone cannot be blank');


/**
 * Methods
 */
UserSchema.methods = {
    /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} plainText
     * @return {Boolean}
     * @api public
     */
    authenticate: function (plainText) {
        return this.encryptPassword(plainText) === this.hashedPassword;
    },

    /**
     * Make salt
     *
     * @return {String}
     * @api public
     */
    makeSalt: function () {
        return crypto.randomBytes(16).toString('base64');
    },

    /**
     * Encrypt password
     *
     * @param {String} password
     * @return {String}
     * @api public
     */
    encryptPassword: function (password) {
        if (!password || !this.salt) return '';
        var salt = new Buffer(this.salt, 'base64');
        return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
    }
};

module.exports = mongoose.model('User', UserSchema);
