const { options } = require('./options');
const { outputScores } = require('./outputScore');
const { askQuestion } = require('./question');


function reconnect() {
    if (options.trivia) {
        if (options.attempts === 0) {
            clearTimeout(options.questionTimeout);
            clearTimeout(options.hintTimeout);
            clearTimeout(options.typeTimeout);
            outputScores(true);
            console.log("Connection lost. Existing score data has been dumped.");
            options.questionTimeout = setTimeout(askQuestion, 10000);
            console.log("Attempting to reconnect in 10 seconds...");
        } else {
            options.questionTimeout = setTimeout(askQuestion, 10000);
            console.log("Attempt failed. Attempting to reconnect in 10 seconds...");
        }
        options.attempts++;
    }
}

exports.reconnect = reconnect;