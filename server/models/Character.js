const { Schema, model } = require('mongoose');

const characterSchema = new Schema({
    characterType: {
        type: String,
    },
    hasHair: {
        type: Boolean
    },
    hairColor: {
        type: String
    },
    topColor: {
        type: String
    },
    skinColor: {
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