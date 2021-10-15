const { Schema, model } = require('mongoose');

const friendsSchema = new Schema({
    requesting: {type: Schema.Types.ObjectId, ref: 'User'},
    receiving: {type: Schema.Types.ObjectId, ref: 'User'},
    status: {
        type: Number,
        min: 0,
        max: 2
    },
    messages: [{
        type: Schema.Types.ObjectId, ref: 'Message'
    }]
}, {timestamps: true});

const Friend = model('Friend', friendsSchema);

module.exports = Friend;