const { SlashCommandBuilder } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause the current round'),
    async execute(BOT, interaction, options) {

        // check if user is allowed to use command
        if (options.admin) {

            // check if trivia is actually running
            if (options.trivia) {
                options.trivia = false;
                options.paused = true;

                clearTimeout(options.hintTimeout);
                clearTimeout(options.questionTimeout);
                clearTimeout(options.typeTimeout);

                if (!options.answered) {
                    options.questionNum--;
                }

                options.answered = true;
                await interaction.reply(`**Trivia has been paused**`);
                console.log("Paused the trivia");

            } else {
                await interaction.reply({ content: "There is no Loremaster round running", ephemeral: true });
            }
        } else {
            await interaction.reply({ content: "Only Admins can pause the round", ephemeral: true });
        }
    }
}