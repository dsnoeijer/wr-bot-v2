require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes, Collection } = require("discord.js");
const { BOT } = require('./modules/bot');
const { reconnect } = require('./modules/reconnect');
// const { settings } = require('./modules/settings');
const { options } = require('./modules/options');
// const answers = require('./modules/answers');

BOT.slashCommands = new Collection();
const slashCommands = [];
const slashCommandFiles = fs.readdirSync('./slashCommands').filter(file => file.endsWith('.js'));

// Add all commands from ./slashCommands
for (const slashFile of slashCommandFiles) {
    const slashCommand = require(`./slashCommands/${slashFile}`);
    BOT.slashCommands.set(slashCommand.data.name, slashCommand);
    slashCommands.push(slashCommand.data.toJSON())

    console.log(`${slashCommand.data.name}.js loaded.`);
}

// When the client is ready, run this code (only once)
BOT.once('ready', () => {

    BOT.user.setActivity("Loremaster", { type: "PLAYING" });
    const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);

    (async () => {
        try {
            console.log('Started refreshing slash commands');

            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: slashCommands }
            );

            console.log('Succesfully reloaded slash commands');
        } catch (e) {
            console.log('ERROR:', e);
        }
    })();

    console.log('Bot is ready!');
});

BOT.on("interactionCreate", async interaction => {
    if (interaction.isCommand()) {

        // if user has Admin status, set admin to true
        if (interaction.member.roles.cache.some(role => role.name === 'Admin')) {
            options.admin = true;
        }

        const slashCommand = BOT.slashCommands.get(interaction.commandName);

        if (!slashCommand) return;

        console.log(`IC: cmd name: ${interaction.commandName}`)

        if (interaction.commandName === "loremaster") {
            await interaction.deferReply();
        }

        try {
            await slashCommand.execute(BOT, interaction, options);
        } catch (e) {
            await interaction.followUp({ content: `Error executing command: ${e}`, ephemeral: true })
        }

    }
})

BOT.on("error", (error) => {
    console.log(error);
    reconnect();

});

BOT.on("disconnect", (error) => {
    console.log(error);
    reconnect();
});

// Login to Discord
BOT.login(process.env.BOT_TOKEN);