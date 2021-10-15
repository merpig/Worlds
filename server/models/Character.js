const { Schema, model } = require('mongoose');

const characterSchema = new Schema({
    characterType: {
        type: String,
        default: "human"
    },
    hasHair: {
        type: Boolean,
        default: "true"
    },
    hairColor: {
        type: String,
        default: "brown"
    },
    shirtColor: {
        type: String,
        default: "blue"
    },
    skinColor: {
        type: String,
        default: "white"
    },
    pantsColor: {
        type: String,
        default: "black"
    },
    shoeColor: {
        type: String,
        default: "black"
    }
  });

const Character = model('Character', characterSchema);

module.exports = Character;