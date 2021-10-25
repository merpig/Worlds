const { Schema, model } = require('mongoose');

const groupFriendsSchema = new Schema({
    friends: [
        {type: Schema.Types.ObjectId, ref: 'User'}
    ],
    status: {
        type: Number,
        min: 0,
        max: 2
    },
    messages: [{
        type: Schema.Types.ObjectId, ref: 'Message'
    }]
}, {timestamps: true});

const GroupFriend = model('GroupFriend', groupFriendsSchema);

module.exports = GroupFriend;