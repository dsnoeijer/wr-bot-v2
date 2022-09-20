const { SlashCommandBuilder } = require('discord.js');
const { endTrivia } = require('../modules/trivia');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stops the current round'),
    async execute(BOT, interaction, options) {

        // check if user is allowed to use command
        if (options.admin) {

            // check if trivia is actually running
            if (options.trivia) {
                await interaction.reply({ content: "Loremaster round has been stopped." });
                endTrivia(false, options);
            } else {
                await interaction.reply({ content: "There is no Loremaster round running", ephemeral: true });
            }
        } else {
            await interaction.reply({ content: "Only Admins are allowed to stop a round", ephemeral: true });
        }
    }
}
