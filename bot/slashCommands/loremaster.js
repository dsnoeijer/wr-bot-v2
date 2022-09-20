const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const trivia = require('../modules/trivia');
const { settings } = require('../modules/settings');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('loremaster')
        .setDescription('Starts the Loremaster Trivia Quiz'),
    async execute(BOT, interaction, options) {
        if (!settings.debug) {
            // rl.on('SIGINT', exitHandler.bind(null));
            // process.on('exit', trivia.exitHandler(interaction).bind(null));
            // process.on('SIGINT', trivia.exitHandler(interaction).bind(null));
        }

        const channel = interaction.channelId;

        // check if user is admin or anyoneStart is set to true
        if (options.admin || settings.anyoneStart) {

            // check if there isn't a game running already
            if (!options.trivia) {

                // check if we are in an allowed channel
                if (channel === process.env.CHANNEL_ID) {

                    // all checks are good, start the trivia!
                    trivia.startTrivia(interaction, options);

                } else {
                    interaction.reply({ content: "Loremaster can only be started in the Loremaster channel", ephemeral: true });
                }
            } else {
                interaction.reply({ content: "Please wait until the current round is over", ephemeral: true });
            }
        } else {
            interaction.reply({ content: "Only Admins can currently start a Loremaster round", ephemeral: true });
        }
    }
}