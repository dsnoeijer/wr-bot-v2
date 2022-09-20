const fs = require('fs');
const { options } = require('./options');


function outputScores(debug) {
    let outputFilename = `results${Date.now()}.html`;
    options.resultsFilename = "";

    fs.writeFileSync(`results${Date.now()}.json`, `{
	"timestamp": "${(new Date()).toUTCString()}",
	"aborted": ${debug},
	"reload": true,
	"questionNum": ${options.questionNum},
	"lastRoundWinner": "${options.lastRoundWinner}",
	"roundWinnerScore": ${options.roundWinnerScore},
	"roundWinnerStreak": ${options.roundWinnerStreak},
	"lastBestTimePlayer": "${options.lastBestTimePlayer}",
	"lastBestTime": ${options.lastBestTime},
	"lastBestStreakPlayer": "${options.lastBestStreakPlayer}",
	"lastBestStreak": ${options.lastBestStreak},
	"players": ${JSON.stringify(options.players)}
	}`);

    fs.writeFileSync(outputFilename, "<!DOCTYPE html><html><head><title>Discord Trivia Bot Results</title><meta charset=\"UTF-8\"></head>\n<body>\n<h1>Winners of round</h1>\n<p");
    if (debug) {
        fs.appendFileSync(outputFilename, " style=\"color: red\">(aborted");
    } else {
        fs.appendFileSync(outputFilename, ">(ended");
    }
    fs.appendFileSync(outputFilename, ` at ${(new Date()).toUTCString()})</p>\n<table border=\"1\">\n<tr><th>Rank</th><th>Name</th><th>User ID</th><th>Score</th><th>Best Streak</th><th>Best Time</th><th>Avg. Time</th></tr>`);
    for (let i = 0; i < options.players.length; i++) {
        fs.appendFileSync(outputFilename, `\n<tr><td>${getOrdinal(i + 1)}</td><td>${options.players[i].name}</td><td>&lt;@${options.players[i].id}&gt;</td><td>${options.players[i].score}</td><td>${options.players[i].streak}</td><td>${(options.players[i].bestTime / 1000).toFixed(3)}</td><td>${(options.players[i].time / options.players[i].score / 1000).toFixed(3)}</td></tr>`);
    }
    fs.appendFileSync(outputFilename, "\n</table>\n<p>Discord Trivia Bot </p>");
    if (debug) {
        fs.appendFileSync(outputFilename, `\n<h2>Error info:</h2><ul>\n<li>let reload = true;</li>\n<li>let questionNum = ${options.questionNum};</li>\n<li>let lastRoundWinner = "${options.lastRoundWinner}";</li>\n<li>let roundWinnerScore = ${options.roundWinnerScore};</li>\n<li>let roundWinnerStreak = ${options.roundWinnerStreak};</li>\n<li>let lastBestTimePlayer = "${options.lastBestTimePlayer}";</li>\n<li>let lastBestTime = ${options.lastBestTime};</li>\n<li>let lastBestStreakPlayer = "${options.lastBestStreakPlayer}";</li>\n<li>let lastBestStreak = ${options.lastBestStreak};</li>\n<li>let players = ${JSON.stringify(options.players)};</li>`);
    }
    fs.appendFileSync(outputFilename, "\n</body>\n</html>");
}

exports.outputScores = outputScores;