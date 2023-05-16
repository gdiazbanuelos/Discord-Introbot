const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('change-name')
        .setDescription('Change name in this server')
        .addStringOption(option =>
            option
                .setName('new-name')
                .setDescription('Name')
                .setRequired(true)),
    async execute(interaction) {
        const new_name = interaction.options.getString('new-name');
        changeName('./db/users.json', interaction, new_name);
    },
};

function changeName(path, interaction, new_name) {
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

            let old_name = usersJSON[interaction.user.id]["servers"][interaction.guild.id]["name"];
            
            usersJSON[interaction.user.id]["servers"][interaction.guild.id]["name"] = new_name;
            fs.writeFileSync(path, JSON.stringify(usersJSON, null, 2));

            await interaction.reply({ content: `Changed name from ${old_name} to ${new_name}`, ephemeral: true });
        }
        else {
            interaction.reply({
                content: "You are not registered silly goose 💃. Use /register first",
                ephemeral: true
            });
        }
    });
}