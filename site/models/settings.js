const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    lang: {
        type: String,
        required: true,
        default: "en"
    },
    anyoneStart: {
        type: Boolean,
        required: true,
        default: false
    },
    anyoneStop: {
        type: Boolean,
        required: true,
        default: false
    },
    anyoneAnswer: {
        type: Boolean,
        required: true,
        default: true
    },
    autoDownload: {
        type: Boolean,
        required: true,
        default: false
    },
    tiebreaker: {
        type: Boolean,
        required: true,
        default: true
    },
    containsAnswer: {
        type: Boolean,
        required: true,
        default: false
    },
    startTime: {
        type: Number,
        required: true,
        default: 15000
    },
    hintTime: {
        type: Number,
        required: true,
        default: 12000
    },
    skipTime: {
        type: Number,
        required: true,
        default: 60000
    },
    betweenTime: {
        type: Number,
        required: true,
        default: 14000
    },
    downloadUrl: {
        type: String,
        required: false,
        default: ""
    },
    maxQuestionNum: {
        type: Number,
        required: true,
        default: 75
    },
    triviaChannel: {
        type: String,
        required: true,
        default: "964259808402358285"
    },
    token: {
        type: String,
        required: true,
        default: "OTY3MDQ0ODA4NjQyMjkzNzkw.GqH1pp.piIt8HngEUrlXT70Ye1_DTNMW1F8bMmGiQn-Fg"
    }
})

module.exports = mongoose.model('settings', settingsSchema)