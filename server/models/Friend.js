const { Schema, model } = require('mongoose');

const friendsSchema = new Schema({
    requesting: {type: Schema.Types.ObjectId, ref: 'User'},
    receiving: {type: Schema.Types.ObjectId, ref: 'User'},
    status: {
        type: Number,
        enums: [
            0,    // pending
            1,    // friends
            2,    // blocked
        ]
    },
    messages: [{
        type: Schema.Types.ObjectId, ref: 'Message'
    }]
}, {timestamps: true});

const Friend = model('Friend', friendsSchema);

module.exports = Friend;