const { BOT } = require('./bot');
const { askQuestion } = require('./question');


const multi = (interaction, options, message) => {
    let correctUsers = [];

    // push the first user in, since collector starts after
    correctUsers.push(message.author.username);

    console.log(answerArray)
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
                oldRank = options.players.length + 1; // rank + 1 to force message
                options.roundWinnerScore = 1;
                winnerIndex = players.length - 1;
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
            } else if (timeTaken < options.lastBestTime) { // if the player beat the last best time
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

        if (options.answerImage !== "") { // answer attachments
            fs.readFile(options.answerImage, (err, data) => {
                if (err) {
                    console.log(localize("c_attachmentFailure", "${filename}", options.answerImage));
                } else {
                    message.channel.send(winMessage, new Discord.MessageAttachment(data, path.basename(options.answerImage))).catch(err => {
                        console.log(localize("c_attachmentFailure", "${filename}", options.answerImage));
                    });
                }
            });
        } else {
            message.channel.send({ embeds: [winMessage] });
        }
    });
    updateTopTen(options);
}

const single = (interaction, options, message) => {
    let timeTaken = message.createdTimestamp - options.questionTimestamp;
    let winnerIndex = -1;

    for (let i = 0; i < options.players.length; i++) {
        if (options.players[i].id === message.author.id) {
            winnerIndex = i;
            break;
        }
    }

    clearTimeout(options.hintTimeout);
    clearTimeout(options.skipTimeout);
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
        oldRank = options.players.length + 1; // rank + 1 to force message
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

    // keep track of current streak
    if (options.lastRoundWinner === message.author.id) {
        options.roundWinnerStreak++;
        if (options.roundWinnerStreak > options.players[winnerIndex].streak) {
            options.players[winnerIndex].streak = options.roundWinnerStreak;
        }
        if (options.roundWinnerStreak > 5) {
            message.channel.send(localize("d_streakContinue", "${message.author.toString()}", message.author.toString()));
        }
    } else {
        if (options.roundWinnerStreak > 5) {
            message.channel.send(localize("d_streakBroken", "${message.author.toString()}", message.author.toString()));
        }
        options.roundWinnerStreak = 1;
    }

    // sends message if they moved up in rank
    if (rank < oldRank && oldRank === options.players.length + 1) {
        message.channel.send(localize("d_rankUp", "${getOrdinal(rank)}", getOrdinal(rank), "${message.author.toString()}", message.author.toString(), "${rank}", rank, "${getOrdinal(oldRank)}", "—"));
    } else if (rank < oldRank) {
        message.channel.send(localize("d_rankUp", "${getOrdinal(rank)}", getOrdinal(rank), "${message.author.toString()}", message.author.toString(), "${rank}", rank, "${getOrdinal(oldRank)}", getOrdinal(oldRank)));
    }

    // keep track of time record for current round
    if (options.lastBestTimePlayer === "null") { // if there is no best time yet
        options.lastBestTimePlayer = message.author.id;
        options.lastBestTime = timeTaken;
    } else if (timeTaken < options.lastBestTime) { // if the player beat the last best time
        message.channel.send(localize("d_timeNewRecord", "timeTaken", timeTaken, "${message.author.toString()}", message.author.toString()));
        options.lastBestTimePlayer = message.author.id;
        options.lastBestTime = timeTaken;
    }

    // keep track of streak record for current round
    if (options.lastBestStreakPlayer === "null") { // if there is no best streak yet
        options.lastBestStreakPlayer = message.author.id;
        options.lastBestStreak = options.roundWinnerStreak;
    } else if (roundWinnerStreak > lastBestStreak) { // if the player beat the last best streak
        if (options.lastBestStreakPlayer !== message.author.id) {
            message.channel.send(localize("d_streakNewRecord", "${message.author.toString()}", message.author.toString()));
        }
        options.lastBestStreakPlayer = message.author.id;
        options.lastBestStreak = options.roundWinnerStreak;
    }

    // sends message based on streak
    for (const element of local.streakMsg) {
        if (element[0] === options.roundWinnerStreak) {
            message.channel.send(element[1].replace(new RegExp("\\$\\{BOT\\.user\\.toString\\(\\)\\}", "g"),
                BOT.user.toString()).replace(new RegExp("\\$\\{message\\.author\\.toString\\(\\)\\}", "g"), message.author.toString()));
            break;
        }
    }

    // sends message based on points
    for (const element of local.scoreMsg) {
        if (element[0] === roundWinnerScore) {
            message.channel.send(element[1].replace(new RegExp("\\$\\{BOT\\.user\\.toString\\(\\)\\}", "g"),
                BOT.user.toString()).replace(new RegExp("\\$\\{message\\.author\\.toString\\(\\)\\}", "g"), message.author.toString()));
            break;
        }
    }

    // say correct answer and who entered it
    let winMessage = `**${localize("t_roundWinner")}**: ${message.author.toString()} **${localize("t_answer")}**: ${options.answerText} **${localize("t_points")}**: ${options.roundWinnerScore} **${localize("t_place")}**: ${getOrdinal(rank)} **${localize("t_streak")}**: ${options.roundWinnerStreak} **${localize("t_time")}**: ${(timeTaken / 1000).toFixed(3)} ${localize("t_sec")}`;
    if (options.answerImage !== "") { // answer attachments
        fs.readFile(options.answerImage, (err, data) => {
            if (err) {
                console.log(localize("c_attachmentFailure", "${filename}", options.answerImage));
            } else {
                message.channel.send(winMessage, new Discord.MessageAttachment(data, path.basename(options.answerImage))).catch(err => {
                    console.log(localize("c_attachmentFailure", "${filename}", options.answerImage));
                    message.channel.send(winMessage);
                });
            }
        });
    } else {
        message.channel.send(winMessage);
    }
    console.log(`${localize("t_roundWinner")}: ${message.author.username} ${message.author.toString()} ${localize("t_answer")}: ${message.content} ${localize("t_points")}: ${options.roundWinnerScore} ${localize("t_place")}: ${getOrdinal(rank)} ${localize("t_streak")}: ${options.roundWinnerStreak} ${localize("t_time")}: ${(timeTaken / 1000).toFixed(3)} ${localize("t_sec")}`);

    options.lastRoundWinner = message.author.id;

    updateTopTen(options);
}

const updateTopTen = (options) => {
    let place = 0;
    options.topTen = localize("t_topTen") + ":";
    if (options.players.length === 0) {
        options.topTen = localize("d_topTenDefault");
    }
    while ((place < 10) && (place < options.players.length)) {
        options.topTen = `${topTen}\n**${getOrdinal(place + 1)} ${localize("t_place")}**: ${options.players[place].name} <@${options.players[place].id}> **${localize("t_points")}**: ${options.players[place].score} **${localize("t_bestStreak")}**: ${options.players[place].streak} **${localize("t_bestTime")}**: ${(options.players[place].bestTime / 1000).toFixed(3)} ${localize("t_sec")} **${localize("t_avgTime")}**: ${(options.players[place].time / options.players[place].score / 1000).toFixed(3)} ${localize("t_sec")}`;
        place++;
    }

    options.answered = true;
    options.questionTimeout = setTimeout(askQuestion, settings.betweenTime, interaction, options);
    options.typeTimeout = setTimeout(function () {
    }, Math.max(settings.betweenTime - 5000, 0))
}

exports.single = single;
exports.multi = multi;