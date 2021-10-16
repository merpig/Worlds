const { Schema, model } = require('mongoose');

const worldSchema = new Schema({
    worldname: {
        type: String,
        required: true,
        trim: true,
    },
    ownedBy: {
        type: Schema.Types.ObjectId, ref: 'User',
        required: true,
    },
    privacySetting: {
        type: String,
        required: true,
    },
    visitSetting: {
        type: String,
        required: true
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