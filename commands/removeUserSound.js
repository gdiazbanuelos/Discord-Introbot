const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-audio')
        .setDescription('Remove the n^th position sound from your list. Use -1 to remove all sounds.')
        .addIntegerOption(option =>
            option
                .setName('list-position')
                .setDescription('List in position')
                .setRequired(true)),
    async execute(interaction) {
        const list_position = interaction.options.getInteger('list-position');
        deleteSoundFile('./db/users.json', interaction, list_position);
    },
};

async function deleteSoundFile(path, interaction, list_position) {
    fs.readFile(path, 'utf8', async (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        let usersJSON = JSON.parse(data);
        const hasUser = interaction.user.id in usersJSON;
        if (hasUser) {

            if(!usersJSON[interaction.user.id]["servers"][interaction.guild.id]){
                await interaction.reply({ content: "Not registered in this server yet! Use /register first!", ephemeral: true });
                return;
            }

            if (list_position == -1) {
                usersJSON[interaction.user.id]["servers"][interaction.guild.id]["sounds"] = [];
                fs.writeFileSync(path, JSON.stringify(usersJSON, null, 2));
                await interaction.reply({ content: `Removed all sounds from sounds lists`, ephemeral: true });
                return;
            }

            if(list_position > usersJSON[interaction.user.id]["servers"][interaction.guild.id]["sounds"].length){
                let outText = '';
                for (let i = 0; i < usersJSON[interaction.user.id]["servers"][interaction.guild.id]["sounds"].length; i++) {
                    outText += `${i}. ${usersJSON[interaction.user.id]["servers"][interaction.guild.id]["sounds"][i].match('(?<=\/)[^\/]*$')}` + "\n";
                }

                await interaction.reply({ content: `Position ${list_position} is outside of list:\n\`\`\`${outText}\`\`\``, ephemeral: true });
                return;
            }
            const removedSound = usersJSON[interaction.user.id]["servers"][interaction.guild.id]["sounds"][list_position].match('(?<=\/)[^\/]*$');
            usersJSON[interaction.user.id]["servers"][interaction.guild.id]["sounds"].splice(list_position, 1);
            fs.writeFileSync(path, JSON.stringify(usersJSON, null, 2));

            let outText = '';
            for (let i = 0; i < usersJSON[interaction.user.id]["servers"][interaction.guild.id]["sounds"].length; i++) {
                outText += `${i}. ${usersJSON[interaction.user.id]["servers"][interaction.guild.id]["sounds"][i].match('(?<=\/)[^\/]*$')}` + "\n";
            }

            await interaction.reply({ content: `Removed *${removedSound}* from **position ${list_position}**\n\`\`\`${outText}\`\`\``, ephemeral: true });

        }
        else {
            interaction.reply({
                content: "You are not registered silly goose 💃. Use /register-myself first then this command",
                ephemeral: true
            });
        }
    });
}