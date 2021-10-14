const { Schema, model } = require('mongoose');

const placementSchema = new Schema({
    world: {
        type: Schema.Types.ObjectId, ref: 'World',
        required: true
    },
    section: {
        type: Schema.Types.ObjectId, ref: 'Section',
        required: true
    },
    x: {
        type: Number,
        required: true
    },
    y: {
        type: Number,
        required: true
    }
});

const Placement = model('Placement', placementSchema);

module.exports = Placement;