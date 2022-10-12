const Discord = require('discord.js');
const reconnect = require('./reconnect');
const { BOT } = require('./bot');
const { settings } = require('./settings');
const { hint } = require('./hint');
const fs = require('fs');


function askQuestion(interaction, options) {
    clearTimeout(options.questionTimeout);
    clearTimeout(options.hintTimeout);
    clearTimeout(options.skipTimeout);
    clearTimeout(options.typeTimeout);

    // check for a tie
    if (settings.tiebreaker && options.players.length > 1 && options.questionNum + options.tieQuestionNum < options.allQuestionNum && options.questionNum >= settings.maxQuestionNum && options.players[0].score === options.players[1].score) {
        if (options.tieQuestionNum === 0) {
            interaction.followUp("Attention. There's a tie for first place! The trivia will continue until there's a clear winner...");
        }
        options.tieQuestionNum++;
    }

    // continue unless we've reached maxQuestionNum
    if (options.questionNum < (settings.maxQuestionNum + options.tieQuestionNum) && options.trivia) {
        if (options.attempts > 0) {
            BOT.login(settings.token).then(() => {
                options.attempts = 0;
            }).catch(err => {
                console.log(`question.js 29`);
                reconnect.reconnect();
            });
            if (!options.answered) {
                interaction.followUp("The last question has been skipped due to connectivity issues. No points will be awarded for it.");
                options.answered = true;
            }
        }

        try {
            options.countHint = 1;
            options.answerArray = [];

            console.log(options.allQuestions[0][options.questionNum]);

            let getNextQuestion = options.allQuestions[0][options.questionNum];
            options.questionNum++;

            let questionText = getNextQuestion.title;

            let finalQuestion = questionText
                .replaceAll(/[mM]/g, 'ⅿ')
                .replaceAll(/[rR]/g, 'г')
                .replaceAll(/[lL]/g, 'ⅼ')
                .replaceAll(/[bB]/g, 'Ь')
                .replaceAll(/[wW]/g, 'ѡ')
                .replaceAll(/[uU]/g, 'υ')
                .replaceAll(/[gG]/g, 'ɡ')
                .replaceAll(/[kK]/g, 'κ')
            let getAnswers = getNextQuestion.answer.split(",");

            for (const answer in getAnswers) {
                options.answerArray.push(getAnswers[answer]);
            }

            options.answerText = getAnswers[0];

            let checkImage = getNextQuestion['imageUrl'];
            console.log(`checkImage: ${checkImage}`);

            if (checkImage !== "") { // if there's an image attachment
                let image = `site/${getNextQuestion.imageUrl}`;
                let getFilename = getNextQuestion.imageUrl.split('/');
                let filename = getFilename[1];

                fs.readFile(image, (err, data) => {
                    if (err) {
                        console.log(`Attachment failure: ${filename}`);
                    } else {

                        const attachment = new Discord.MessageAttachment(image);

                        const embed = new Discord.EmbedBuilder()
                            .setColor(0x3498DB)
                            .setTitle(`:question: Question ${(questionNum - startQuestionNum).toString()} of ${settings.maxQuestionNum}`)
                            .setURL('https://discord.com/')
                            .setDescription(`**${finalQuestion}**`)
                            .attachFiles(attachment)
                            .addFields({ name: '\u200b', value: '\u200b' })
                            .setImage(`attachment://${filename}`)
                            .setTimestamp()
                            .setFooter({ text: "WoW Realms Trivia Bot", iconURL: "https://cdn.discordapp.com/emojis/938941660333756498.png?v=1" });

                        interaction.followUp({ embeds: [embed] }).then(questionMessage => {
                            options.attempts = 0;
                            options.questionTimestamp = questionMessage.createdTimestamp;
                            console.log(options.questionTimestamp);
                            options.answered = false;

                        }).catch(err => {
                            console.log(`Attachment failure: ${filename}`);
                            interaction.followUp(`${(options.questionNum - options.startQuestionNum).toString()}. **${questionText}**`).then(questionMessage => {
                                options.attempts = 0;
                                options.questionTimestamp = questionMessage.createdTimestamp;
                                options.answered = false;

                            }).catch(err => {
                                options.questionNum--;
                                console.log(`question.js 107`);
                                reconnect.reconnect();
                            });
                        });


                    }
                });
            } else { // if there's no attachment
                const embed = new Discord.EmbedBuilder()
                    .setColor(0x3498DB)
                    .setTitle(`:question: Question ${(options.questionNum - options.startQuestionNum).toString()} of ${settings.maxQuestionNum}`)
                    .setURL('https://discord.com/')
                    .setDescription(`**${finalQuestion}**`)
                    .addFields({ name: '\u200b', value: '\u200b' })
                    .setTimestamp()
                    .setFooter({ text: "WoW Realms Trivia Bot", iconURL: "https://cdn.discordapp.com/emojis/938941660333756498.png?v=1" });

                interaction.followUp({ embeds: [embed] }).then(questionMessage => {
                    options.attempts = 0;
                    options.questionTimestamp = questionMessage.createdTimestamp;
                    options.answered = false;
                }).catch(err => {
                    console.log(`question.js AnswerEmbed error: ${err}`)
                    options.questionNum--;
                    reconnect.reconnect();
                });
            }
            options.hintTimeout = setInterval(hint, settings.hintTime, getNextQuestion, options, interaction);
        } catch (err) {
            console.log('question get error:', err);
        }

        options.skipTimeout = setTimeout(skipQuestion, settings.skipTime + 350, interaction, options);
    }
    else {
        endTrivia(true, options);
    }

    BOT.on("message", (message) => {
        console.log(options.answerArray[0]);
        // if answer is correct
        if (!options.answered && options.answerArray.some(word => message.content.toLowerCase().includes(word.toLowerCase()))) {

            // check if we are in single or multi point mode
            if (options.mode === 'single') {
                answers.single(interaction, options, message);
            } else {
                answers.multi(interaction, options, message);
            }
        }
    });
}

function skipQuestion(interaction, options) {
    clearTimeout(options.questionTimeout);
    clearTimeout(options.hintTimeout);
    clearTimeout(options.skipTimeout);
    clearTimeout(options.typeTimeout);

    if (options.answerImage !== "") { // answer attachments
        fs.readFile(options.answerImage, (err, data) => {
            if (err) {
                console.log(`Attachment file ${filename} not found!`);
            } else {
                interaction.followUp("The last question has been skipped due to connectivity issues. No points will be awarded for it.", new Discord.MessageAttachment(data, path.basename(options.answerImage))).catch(err => {
                    console.log(`Attachment file ${filename} not found!`);
                    interaction.followUp(`*Time's up!* The answer was: **${answerText}**`).catch(err => {
                        reconnect.reconnect();
                    });
                });
            }
        });
    } else {
        interaction.followUp(`*Time's up!* The answer was: **${options.answerText}**`).catch(err => {
            console.log(`question.js 166 Time up: ${err}`)
            reconnect.reconnect();
        });
    }

    if (options.roundWinnerStreak > 5) {
        interaction.followUp(`*<@${lastRoundWinner}>'s streak ended at ${roundWinnerStreak}!*`);
    }
    options.lastRoundWinner = "null";
    options.roundWinnerStreak = -1;
    options.answered = true;
    options.questionTimeout = setTimeout(askQuestion, settings.betweenTime);
    options.typeTimeout = setTimeout(function () {
    }, Math.max(settings.betweenTime - 5000, 0));
}

exports.askQuestion = askQuestion;
exports.skipQuestion = skipQuestion;