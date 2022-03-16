const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GameSchema = new Schema({
    title: String,
    developer: String,
    release: Number,
    platform: {
        type: String,
        enum: ['PC', 'Playstation', 'Xbox', 'Switch']
    },
    genre: {
        type: String,
        enum: ['Action', 'Adventure', 'Horror', 'Fighting', 'Survival', 'Story']
    },
    rating: Number,
    review: String,
});

module.exports = mongoose.model('Game', GameSchema);