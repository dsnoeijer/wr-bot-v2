require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes, Collection } = require("discord.js");
const { BOT } = require('./modules/bot');
const { reconnect } = require('./modules/reconnect');
const { settings } = require('./modules/settings');
const { options } = require('./modules/options');

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

BOT.on("message", (message) => {

    // if answer is correct
    // if (!options.answered && parseAnswer(message.content, options.answerArray)) {
    if (!options.answered && options.answerArray.some(word => message.content.includes(word))) {

        // check if we are in single or multi point mode
        // seperate into 2 modules
        if (options.mode === 'single') {

        } else {

            let correctUsers = [];
            correctUsers.push(message.author.username);
            console.log(options.answerArray)
            options.answered = true;
            const filter = (m) => {
                for (element of options.answerArray) {
                    if (m.content.toLowerCase().includes(element.toLowerCase())) {
                        return true;
                    }
                }
                return false;
            }

            const collector = message.channel.createMessageCollector(filter, { time: 2000 });

            collector.on('collect', m => {
                correctUsers.push(m.author.username);
            });

            collector.on('end', collected => {
                clearTimeout(options.hintTimeout);
                console.log(correctUsers);

                for (let correctUser of correctUsers) {
                    let timeTaken = message.createdTimestamp - options.questionTimestamp;
                    let winnerIndex = -1;
                    for (let i = 0; i < options.players.length; i++) {
                        if (options.players[i].id === message.author.id) {
                            winnerIndex = i;
                            break;
                        }
                    }

                    let oldRank;
                    if (winnerIndex === -1) { // if player hasn't won before
                        options.players.push({
                            id: message.author.id,
                            name: message.author.username,
                            score: 1,
                            streak: 1,
                            time: timeTaken,
                            bestTime: timeTaken,
                            strikes: 0
                        });
                        oldRank = players.length + 1; // rank + 1 to force message
                        options.roundWinnerScore = 1;
                        winnerIndex = options.players.length - 1;
                    } else { // if player has won before
                        options.players[winnerIndex].name = message.author.username;
                        options.players[winnerIndex].score++;
                        options.players[winnerIndex].time += timeTaken;
                        oldRank = winnerIndex + 1;
                        options.roundWinnerScore = options.players[winnerIndex].score;

                        if (timeTaken < options.players[winnerIndex].bestTime) { // if this is a better time than old best time
                            options.players[winnerIndex].bestTime = timeTaken;
                        }

                        options.players = options.players.map(function (a, b) {
                            return { player: a, pos: b };
                        }).sort(function (a, b) {
                            if (b.player.score - a.player.score === 0) {
                                return a.pos - b.pos;
                            } else {
                                return b.player.score - a.player.score;
                            }
                        }).map(function (a) {
                            return a.player;
                        });
                    }

                    // calculate player rank
                    let rank;
                    for (let i = 0; i < options.players.length; i++) {
                        if (options.players[i].id === message.author.id) {
                            rank = i + 1;
                            break;
                        }
                    }

                    // keep track of time record for current round
                    if (options.lastBestTimePlayer === "null") { // if there is no best time yet
                        options.lastBestTimePlayer = message.author.id;
                        options.lastBestTime = timeTaken;
                    } else if (timeTaken < lastBestTime) { // if the player beat the last best time
                        options.lastBestTimePlayer = message.author.id;
                        options.lastBestTime = timeTaken;
                    }
                }

                let winnersString = '';
                for (let newUser of correctUsers) {
                    winnersString += `${newUser}  `;
                }

                const winMessage = new Discord.MessageEmbed()
                    .setColor(0x3498DB)
                    .setTitle(`:tada: ${correctUsers.length} people answered in time and gain 1 point!`)
                    .setDescription(`**${winnersString}**`)
                    .setFooter("WoW Realms Trivia Bot", "https://cdn.discordapp.com/emojis/938941660333756498.png?v=1");
            }
        }

        if (options.answerImage !== "") { // answer attachments
            fs.readFile(options.answerImage, (err, data) => {
                if (err) {
                    console.log(`Attachment file ${filename} not found!`);
                } else {
                    message.channel.send(winMessage, new Discord.MessageAttachment(data, path.basename(options.answerImage))).catch(err => {
                        console.log(`Attachment file ${filename} not found!`);
                    });
                }
            });
        } else {
            message.channel.send({ embed: winMessage });
        }


        // update top ten information
        let place = 0;
        options.topTen = "Top ten" + ":";
        if (options.players.length === 0) {
            options.topTen = "Top ten:\nNo one yet.";
        }
        while ((place < 10) && (place < options.players.length)) {
            options.topTen = `${topTen}\n**"Place"**: ${options.players[place].name} <@${options.players[place].id}> **Points**: ${options.players[place].score} **Best streak**: ${options.players[place].streak} **Best time**: ${(options.players[place].bestTime / 1000).toFixed(3)} "sec" **Avg. time**: ${(options.players[place].time / options.players[place].score / 1000).toFixed(3)} "sec"`;
            place++;
        }

        options.answered = true;
        options.questionTimeout = setTimeout(askQuestion(interaction, options), settings.betweenTime);
        options.typeTimeout = setTimeout(function () {
            if (options.trivia) {
                options.triviaChannel.startTyping();
            }
        }, Math.max(settings.betweenTime - 5000, 0))
    }
});


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