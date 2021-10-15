const { Schema, model } = require('mongoose');

const messageSchema = new Schema({
    message: {
        type: String,
    },
    status: {
        type: Number,
        min: 0,
        max: 2
    },
}, {timestamps: true});

const Message = model('Message', messageSchema);

module.exports = Message;