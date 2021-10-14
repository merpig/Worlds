const { Schema, model } = require('mongoose');

const sectionNodeSchema = new Schema({
    north: {
        type: Schema.Types.ObjectId, ref: 'Section'
    },
    east: {
        type: Schema.Types.ObjectId, ref: 'Section'
    },
    south: {
        type: Schema.Types.ObjectId, ref: 'Section'
    },
    west: {
        type: Schema.Types.ObjectId, ref: 'Section'
    }
});

const SectionNode = model('SectionNode', sectionNodeSchema);

module.exports = SectionNode;