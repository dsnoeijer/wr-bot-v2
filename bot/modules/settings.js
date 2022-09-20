let settings = {};

try {
    settings = JSON.parse(`{${fs.readFileSync("../settings.txt", "utf8").replace(/^\uFEFF/, '')}}`);
    console.log("settings.txt loaded");
} catch (err) {
    console.log("settings.txt error! Loading default settings...");
    settings = {
        local: {},
        lang: "en",
        anyoneStart: false,
        anyoneStop: false,
        anyoneAnswer: true,
        autoDownload: false,
        tiebreaker: false,
        containsAnswer: false,
        tts: false,
        startTime: 15000,
        hintTime: 12000,
        skipTime: 60000,
        betweenTime: 14000,
        triviaChannel: "964259808402358285",
        downloadUrl: "null",
        maxQuestionNum: 75,
        allowedChannels: [],
        schedule: [],
        debug: false,
        token: ""
    }
}

exports.settings = settings;