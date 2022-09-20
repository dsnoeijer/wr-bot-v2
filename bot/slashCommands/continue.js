const { SlashCommandBuilder } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('continue')
        .setDescription('Continue the current round'),
    async execute(BOT, interaction, options) {

        // check if user is allowed to use command
        if (options.admin) {

            // check if trivia is paused
            if (!options.trivia && options.paused) {
                options.trivia = true;
                options.paused = false;
                options.triviaChannel.startTyping();
                options.questionTimeout = setTimeout(askQuestion(interaction, options), 1000);
                await interaction.reply({ content: `**Continuing the trivia**` });
                console.log("Continuing the trivia");
            } else {
                await interaction.reply({ content: "There is no round to continue", ephemeral: true });
            }
        } else {
            await interaction.reply({ content: "Only Admins can continue the round", ephemeral: true });
        }
    }
}