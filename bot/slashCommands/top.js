const { SlashCommandBuilder } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('top')
        .setDescription('Sends a message with the current top 10 during a Loremaster round'),
    async execute(BOT, interaction, options) {

        if (options.trivia) {
            interaction.reply({ content: options.topTen, ephemeral: true });
        } else {
            interaction.reply({ content: `There is currently no Loremaster round in progress.`, ephemeral: true });
        }
    }
}