const { Schema, model } = require('mongoose');

const characterSchema = new Schema({
    characterType: {
        type: String,
        required: true
    },
    hasHair: {
        type: Boolean
    },
    hairColor: {
        type: String
    },
    skinColor: {
        type: String
    },
    shirtColor: {
        type: String
    },
    pantsColor: {
        type: String
    },
    shoeColor: {
        type: String
    }
  });

const Character = model('Character', characterSchema);

module.exports = Character;