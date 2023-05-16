const { Events } = require('discord.js');
const fs = require('fs');
const {
    AudioPlayerStatus,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    NoSubscriberBehavior,
} = require('@discordjs/voice');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    name: Events.VoiceStateUpdate,
    execute(oldState, newState) {

        if (oldState.channelId === null && newState.channelId !== null ) {
            botJoinVoiceChannel(newState);
        }
    },
};

async function botJoinVoiceChannel(newState) {
    await wait(750);
    const player = createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Pause,
        },
    });


    let usersJSON;
    let currSound;
    fs.readFile("./db/users.json", 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        usersJSON = JSON.parse(data);
        const hasKey = newState.id in usersJSON;
        if (hasKey) {

            if(!usersJSON[newState.id]["servers"][newState.guild.id]){
                return;
            }

            const randomSound = usersJSON[newState.id]["servers"][newState.guild.id]['sounds'][Math.floor(Math.random() * usersJSON[newState.id]["servers"][newState.guild.id]['sounds'].length)];
            const resource = createAudioResource(randomSound);

            const connection = joinVoiceChannel({
                channelId: newState.channelId,
                guildId: newState.guild.id,
                adapterCreator: newState.guild.voiceAdapterCreator
            });

            player.play(resource);
            connection.subscribe(player);

            player.on(AudioPlayerStatus.Idle, () => {
                connection.destroy();
            });

            player.on('error', error => {
                console.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
            });
        }

    });
}

