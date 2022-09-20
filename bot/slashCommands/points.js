const { SlashCommandBuilder } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('points')
        .setDescription('Change whether points reset inbetween rounds or not')
        .addStringOption(option =>
            option.setName('setting')
                .setDescription('Choose which mode the game should use')
                .setRequired(true)
                .addChoices(
                    {
                        name: 'Reset points after each round', value: 'single'
                    },
                    {
                        name: 'Do not reset points after each round', value: 'multi'
                    },
                )),
    async execute(BOT, interaction, options) {

        // check if user is allowed to use command
        if (options.admin) {

            // check if trivia isn't running
            if (!options.trivia) {

                const choice = interaction.options.getString('setting');

                if (choice === 'multi') {
                    options.reload = true;
                } else {
                    options.reload = false;
                }

                if (options.reload) {
                    console.log("Data will be kept when a new round begins");
                    const multiRound = new Discord.MessageEmbed()
                        .setColor(0x3498DB)
                        .setTitle(`Settings Update`)
                        .setDescription(`Data will now be kept between rounds`)
                        .setTimestamp()
                        .setFooter("WoW Realms Trivia Bot", "https://cdn.discordapp.com/emojis/938941660333756498.png?v=1");

                    interaction.reply({ embeds: [multiRound] })

                } else {
                    console.log("Data will be cleared when a new round begins");
                    const singleRound = new Discord.MessageEmbed()
                        .setColor(0x3498DB)
                        .setTitle(`Settings Update`)
                        .setDescription(`Data will now reset between rounds`)
                        .setTimestamp()
                        .setFooter("WoW Realms Trivia Bot", "https://cdn.discordapp.com/emojis/938941660333756498.png?v=1");

                    interaction.reply({ embeds: [singleRound] })
                }
            } else {
                interaction.reply({ content: "Cannot change settings during a game", ephemeral: true });
            }
        } else {
            interaction.reply({ content: "Only Admings can change these settings", ephemeral: true });
        }
    }
}