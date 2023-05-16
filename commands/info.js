const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('List my sounds for this server'),
    async execute(interaction) {
        listSoundFiles('./db/users.json', interaction);
    },
};

function listSoundFiles(path, interaction) {
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

            let outText = '';
            for (let i = 0; i < usersJSON[interaction.user.id]["servers"][interaction.guild.id]["sounds"].length; i++) {
                outText += `${i}. ${usersJSON[interaction.user.id]["servers"][interaction.guild.id]["sounds"][i].match('(?<=\/)[^\/]*$')}`+"\n";
            }
            let user_name = usersJSON[interaction.user.id]["servers"][interaction.guild.id]["name"];
            
            await interaction.reply({ content: `Name: ${user_name}\nYour sounds in this server:\n\`\`\`${outText}\`\`\``, ephemeral: true });
        }
        else {
            interaction.reply({
                content: "You are not registered silly goose 💃. Use /register-myself first then this command",
                ephemeral: true
            });
        }
    });
}