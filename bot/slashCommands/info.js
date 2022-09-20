const { SlashCommandBuilder } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Sends a DM with your current stars during a Loremaster round'),
    async execute(BOT, interaction, options) {

        if (options.trivia) {
            let score = "";
            let streak = 0;
            let place = "";
            let bestTime = "";
            let avgTime = "";


            let authorIndex;
            for (let i = 0; i < options.players.length; i++) {
                if (options.players[i].id === message.author.id) {
                    authorIndex = i;
                    break;
                }
            }
            if (typeof options.players[authorIndex] === "undefined") { // if the user hasn't played
                score = "0";
                streak = 0;
                place = "—";
                bestTime = "—";
                avgTime = "—";
            } else {
                score = options.players[authorIndex].score;
                streak = options.players[authorIndex].streak;
                place = authorIndex + 1;
                bestTime = (options.players[authorIndex].bestTime / 1000).toFixed(3);
                time = options.players[authorIndex].time;
                avgTime = (time / score / 1000).toFixed(3);
            }

            interaction.reply({ content: `Your info:\n**Points**: ${score} **"Place"**: ${place} **Best streak**: ${streak} **Best time**: ${bestTime} "sec" **Avg. time**: ${avgTime} "sec"`, ephemeral: true });
            // deleteAfter = true;
        } else {
            interaction.reply({ content: `There is currently no Loremaster round in progress.`, ephemeral: true });
        }
    }
}
