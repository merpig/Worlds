const { Schema, model } = require('mongoose');

const sectionSchema = new Schema({
    belongsTo: {
        type: Schema.Types.ObjectId, ref: 'World',
        required: true
    },
    features: [{
       type: Schema.Types.ObjectId, ref: 'Feature'
    }],
    players: [{
        type: Schema.Types.ObjectId, ref: 'User'
    }],
    nodes: {
        type: Schema.Types.ObjectId, ref: 'SectionNode'
    }
}, {timestamps: true});

const Section = model('Section', sectionSchema);

module.exports = Section;