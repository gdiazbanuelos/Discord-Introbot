const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-audio')
        .setDescription('Add new sound to your list')
        .addStringOption(option =>
            option
                .setName('link-to-file')
                .setDescription('Link to new sound file')
                .setRequired(true)),
    async execute(interaction) {
        const file_link = interaction.options.getString('link-to-file');
        addSoundFile('./db/users.json', interaction, file_link);
    },
};

function addSoundFile(path, interaction, file_link) {
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

            if(!file_link.startsWith("https://cdn.discordapp.com/attachments/")){
                await interaction.reply({ content: "Link must be an uploaded file to Discord.\nExample:\nhttps://cdn.discordapp.com/attachments/1054925672407109672/1055010480206393364/audio_ceb.m4a", ephemeral: true });
                return;
            }

            usersJSON[interaction.user.id]["servers"][interaction.guild.id]["sounds"].push(file_link);
            fs.writeFileSync(path, JSON.stringify(usersJSON, null, 2));

            let outText = '';
            for (let i = 0; i < usersJSON[interaction.user.id]["servers"][interaction.guild.id]["sounds"].length; i++) {
                outText += `${i}. ${usersJSON[interaction.user.id]["servers"][interaction.guild.id]["sounds"][i].match('(?<=\/)[^\/]*$')}` + "\n";
            }
            await interaction.reply({ content: `Added *${file_link.match('(?<=\/)[^\/]*$')}* to list:\n\`\`\`${outText}\`\`\``, ephemeral: true });
        }
        else {
            interaction.reply({
                content: "You are not registered silly goose 💃. Use /register first",
                ephemeral: true
            });
        }
    });
}