const Discord = require('discord.js');
const { settings } = require('./settings');

function hint(getNextQuestion, options, interaction) {
    console.log('Here is a hint!');
    // clearTimeout(hintTimeout);
    clearTimeout(options.questionTimeout);
    clearTimeout(options.typeTimeout);

    let roundHint = '';

    if (options.countHint % 2 !== 0) {
        roundHint = getNextQuestion.firstHint;
        const embed = new Discord.EmbedBuilder()
            .setColor(0x3498DB)
            .setTitle(`**First Hint: Scrambled Letters**`)
            .setDescription(`:alarm_clock: ${roundHint}`)
            .addFields({ name: '\u200b', value: '\u200b' })
            .setTimestamp()
            .setFooter({ text: "WoW Realms Trivia Bot", iconURL: "https://cdn.discordapp.com/emojis/938941660333756498.png?v=1" });
        interaction.followUp({ embeds: [embed] })
    } else {
        roundHint = getNextQuestion.secondHint;
        const embed = new Discord.EmbedBuilder()
            .setColor(0x3498DB)
            .setTitle(`**Second Hint: Fill in the Blanks**`)
            .setDescription(`:alarm_clock: ${roundHint}`)
            .addFields({ name: '\u200b', value: '\u200b' })
            .setTimestamp()
            .setFooter({ text: "WoW Realms Trivia Bot", iconURL: "https://cdn.discordapp.com/emojis/938941660333756498.png?v=1" });
        interaction.followUp({ embeds: [embed] })
        options.countHint = 0;
        clearInterval(options.hintTimeout);
    }

    options.countHint += 1;
}

exports.hint = hint;