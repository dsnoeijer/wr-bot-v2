const fs = require("fs");
const axios = require('axios');
const { outputScores } = require('./outputScore');
const { reconnect } = require('./reconnect');
const { BOT } = require('./bot');
const { askQuestion } = require('./question');
const { settings } = require('./settings');

let versionString = "1.0";
console.log("The trivia BOT has been launched. (v" + versionString + ")");

function deleteMessage(message) {
    if (message.channel.type === "text" && message.channel.permissionsFor(BOT.user).has("MANAGE_MESSAGES")) {
        message.delete();
    }
}

const startTrivia = async (interaction, options) => {
    options.allQuestions = [];

    clearTimeout(options.scheduleTimeout);
    clearTimeout(options.triviaTimeout);
    console.log("Started the trivia");

    await axios.get("http://localhost:3000/questionlist")
        .then((data) => {
            options.allQuestions.push(data.data);
        });

    options.questionNum = 0;
    options.startQuestionNum = 0;
    options.tieQuestionNum = 0;
    if (!options.reload) {
        options.lastRoundWinner = "null";
        options.roundWinnerScore = 0;
        options.roundWinnerStreak = 0;
        options.lastBestTimePlayer = "null";
        options.lastBestTime = 0;
        options.lastBestStreakPlayer = "null";
        options.lastBestStreak = 0;
        options.players = [];
        options.topTen = "Top ten:\nNo one yet.";
    }

    BOT.user.setPresence({ status: "online", activity: { type: "PLAYING", name: "Loremaster" } });
    interaction.followUp(`:bangbang: **Attention. Loremaster trivia will start in 15 seconds!. There will be ${settings.maxQuestionNum} questions.** :bangbang:`, { tts: settings.tts });

    setTimeout(() => {
        interaction.followUp("**5 seconds remaining... GET READY!**");
    }, 10000);

    options.trivia = true;
    options.questionTimeout = setTimeout(askQuestion, settings.startTime, interaction, options);
    // options.typeTimeout = setTimeout(function () {
    //     if (options.trivia) {
    //         triviaChannel.sendTyping();
    //     }
    // }, Math.max(settings.startTime - 5000, 0));

}

function endTrivia(finished, options) {
    options.answerArray = [];
    clearTimeout(options.questionTimeout);
    clearTimeout(options.hintTimeout);
    clearTimeout(options.skipTimeout);
    clearTimeout(options.typeTimeout);
    clearTimeout(options.scheduleTimeout);
    outputScores(true);

    if (options.trivia) {
        if (finished) {
            triviaChannel.send(`Attention. ${settings.maxQuestionNum + tieQuestionNum} questions have been reached. The trivia round is ending.`, { tts: settings.tts });
        }

        let streaks = options.players.map(function (a) {
            return a.streak;
        });

        let bestTimes = options.players.map(function (a) {
            return a.bestTime;
        });

        let avgTimes = options.players.map(function (a) {
            return a.time / a.score;
        });

        let bestStreak = streaks.indexOf(Math.max.apply(Math, streaks)); // get index of player with best streak
        let bestBestTime = bestTimes.indexOf(Math.min.apply(Math, bestTimes)); // get index of player with best best time
        let bestAvgTime = avgTimes.indexOf(Math.min.apply(Math, avgTimes)); // get index of player with best average time

        if (options.players.length > 0) {
            triviaChannel.send(((typeof options.players[0] !== "undefined") ? `**:first_place: 1st Place**: <@${options.players[0].id}> **Points**: ${options.players[0].score} **Best streak**: ${options.players[0].streak} **Avg. time**: ${(options.players[0].time / players[0].score / 1000).toFixed(3)} sec **Best time**: ${(options.players[0].bestTime / 1000).toFixed(3)} sec\n` + ((typeof options.players[1] !== "undefined") ? `**:second_place: 2nd Place**: <@${options.players[1].id}> **Points**: ${options.players[1].score} **Best streak**: ${options.players[1].streak} **Avg. time**: ${(options.players[1].time / options.players[1].score / 1000).toFixed(3)} sec **Best time**: ${(options.players[1].bestTime / 1000).toFixed(3)} sec\n` : "") + ((typeof options.players[2] !== "undefined") ? `**:third_place: 3rd Place**: <@${options.players[2].id}> **Points**: ${options.players[2].score} **Best streak**: ${options.players[2].streak} **Avg. time**: ${(options.players[2].time / options.players[2].score / 1000).toFixed(3)} sec **Best time**: ${(options.players[2].bestTime / 1000).toFixed(3)} sec\n` : "") + `\n**BBest streak**: <@${options.players[bestStreak].id}> with ${options.players[bestStreak].streak}\n**Best time**: <@${options.players[bestBestTime].id}> with ${(options.players[bestBestTime].bestTime / 1000).toFixed(3)} sec\n**Best avg. time**: <@${options.players[bestAvgTime].id}> with ${(options.players[bestAvgTime].time / options.players[bestAvgTime].score / 1000).toFixed(3)} sec` : ""));
            BOT.users.fetch(options.players[0].id).then((user) => {
                user.send("Congratulations on winning this round of trivia!");
            });
        }
    }

    options.trivia = false;
    BOT.user.setPresence({ status: "idle", activity: { type: 0, name: "" } });
    console.log("Stopped the trivia");

    console.log(":first_place: 1st Place: " + ((typeof options.players[0] !== "undefined") ? `${options.players[0].name} <@${options.players[0].id}> Points: ${options.players[0].score} Best time: ${options.players[0].bestTime / 1000}` : "None"));
    console.log(":second_place: 2nd Place: " + ((typeof options.players[1] !== "undefined") ? `${options.players[1].name} <@${options.players[1].id}> Points: ${options.players[1].score} Best time: ${options.players[1].bestTime / 1000}` : "None"));
    console.log(":third_place: 3rd Place: " + ((typeof options.players[2] !== "undefined") ? `${options.players[2].name} <@${options.players[2].id}> Points: ${options.players[2].score} Best time: ${options.players[2].bestTime / 1000}` : "None"));
}

// options.questionNum--;

// exit handling stuff
process.stdin.resume();
process.on('unhandledRejection', r => console.log(r));
process.on('uncaughtException', e => console.log(e));

function exitHandler(interaction, options) {
    if (!options.exit) {
        options.exit = true;
        if (options.trivia) {
            interaction.followUp("Attention. The trivia BOT has been terminated.", { tts: settings.tts });
        }
        console.log("The trivia BOT has been terminated.");
        BOT.destroy();
        if (options.trivia && options.players.length > 0) {
            outputScores(true);
        }
        process.exit();
    }
}

exports.deleteMessage = deleteMessage;
exports.startTrivia = startTrivia;
exports.endTrivia = endTrivia;
exports.reconnect = reconnect;
exports.exitHandler = exitHandler;
