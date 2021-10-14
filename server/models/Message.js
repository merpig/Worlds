const { Schema, model } = require('mongoose');

const messageSchema = new Schema({
    message: {
        type: String,
    },
    status: {
        type: Number,
        enums: [
            0,    // sent
            1,    // read
        ]
    },
}, {timestamps: true});

const Message = model('Message', messageSchema);

module.exports = Message;