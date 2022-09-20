const { SlashCommandBuilder } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('questions')
        .setDescription('Change the number of questions')
        .addNumberOption(option =>
            option.setName('numquestions')
                .setDescription('Set the new number of questions')
                .setRequired(true)),
    async execute(BOT, interaction, options) {

        // check if user is allowed to use command
        if (options.admin) {

            // check if trivia isn't running / paused
            if (!options.trivia && !options.paused) {
                let newQuestions = interaction.options.getNumber('numquestions');

                if (isNaN(newQuestions)) {
                    newQuestions = settings.maxQuestionNum;
                }

                settings.maxQuestionNum = newQuestions;
                const questionEmbed = new Discord.MessageEmbed()
                    .setColor(0x3498DB)
                    .setTitle(`Settings Update`)
                    .setDescription(`Number of questions changed to ${newQuestions}`)
                    .setTimestamp()
                    .setFooter("WoW Realms Trivia Bot", "https://cdn.discordapp.com/emojis/938941660333756498.png?v=1");

                interaction.reply({ embeds: [questionEmbed] })
                console.log(`Trivia set to ask ${settings.maxQuestionNum} questions`);
            } else {
                interaction.reply({ content: "Number of questions can only be changed when there is no game running/paused" })
            }
        } else {
            await interaction.reply({ content: "Only Admins can change the number of questions", ephemeral: true });
        }
    }
}