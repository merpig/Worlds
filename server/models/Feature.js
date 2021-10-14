const { Schema, model } = require('mongoose');

const featureSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    blocking: {
        type: Boolean,
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

const Feature = model('Feature', featureSchema);

module.exports = Feature;