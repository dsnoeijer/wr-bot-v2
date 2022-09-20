const Discord = require('discord.js');
const { settings } = require('./settings');
const { reconnect } = require('./reconnect');
const { hint } = require('./hint');
const fs = require('fs');


function getLine(interaction, options) {
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
                    .setFooter("WoW Realms Trivia Bot", "https://cdn.discordapp.com/emojis/938941660333756498.png?v=1");

                interaction.followUp({ embed: embed }).then(questionMessage => {
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
                        reconnect();
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
            .setFooter("WoW Realms Trivia Bot", "https://cdn.discordapp.com/emojis/938941660333756498.png?v=1");

        interaction.followUp({ embed: embed }).then(questionMessage => {
            options.attempts = 0;
            options.questionTimestamp = questionMessage.createdTimestamp;
            options.answered = false;
        }).catch(err => {
            options.questionNum--;
            reconnect();
        });
    }
    options.hintTimeout = setInterval(hint(interaction, options), settings.hintTime, getNextQuestion);
}

exports.getLine = getLine;