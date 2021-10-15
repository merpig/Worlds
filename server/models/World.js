const { Schema, model } = require('mongoose');

const worldSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    ownedBy: {
        type: Schema.Types.ObjectId, ref: 'User',
        required: true,
    },
    privacySetting: {
        type: Number,
        required: true,
        min: 0,
        max: 2,
    },
    canVisitOffline: {
        type: Boolean,
        default: true
    },
    mainSection: {
        type: Schema.Types.ObjectId, ref: 'Section'
    },
    players: [{
        type: Schema.Types.ObjectId, ref: 'User'
    }]
}, {timestamps: true});

const World = model('World', worldSchema);

module.exports = World;