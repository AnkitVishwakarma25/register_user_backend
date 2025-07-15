
//Tokens Schema
const mongoose = require('mongoose');
const User = require('./User');

const TokenSchema = new mongoose.Schema({

    userID: {
        type: mongoose.Schema.Types.ObjectId,
        unique: true,
        ref: 'User'
    },

    refreshToken: {
        type: String,
        required: true,

    }


})

module.exports = mongoose.model('Token', TokenSchema);