const { SlashCommandBuilder } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('results')
        .setDescription('Sends a DM with the latest results'),
    async execute(BOT, interaction, options) {
        const user = client.users.cache.get(interaction.member.user.id);

        if (options.resultsFilename === "") {
            fs.readdir('../', "utf8", function (err, files) {
                if (err || files.length === 0) {
                    interaction.reply({ content: "*No results yet*", ephemeral: true });
                } else {
                    files.sort();
                    files.forEach(function (item, index, array) {
                        if (item.substring(0, 7) === "results") {
                            options.resultsFilename = item;
                        }
                    });
                    if (options.resultsFilename === "") {
                        interaction.reply({ content: "*No results yet*", ephemeral: true });
                    } else {
                        interaction.reply({ content: "*A DM has been send with the latest results*", ephemeral: true });
                        user.send("", new Discord.MessageAttachment(options.resultsFilename)).catch(err => {
                            console.log(`Attachment file ${options.filename} not found!`);
                        });

                    }
                }
            });
        } else {
            interaction.reply({ content: "*A DM has been send with the latest results*", ephemeral: true });
            user.send("", new Discord.MessageAttachment(options.resultsFilename)).catch(err => {
                console.log(`Attachment file ${options.filename} not found!`);
            });

        }
        // interaction.reply({ content: "hi", ephemeral: true });
    }
}