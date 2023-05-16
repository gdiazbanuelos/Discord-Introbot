const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Add youself to the users list for audio bot.')
		.addStringOption(option =>
			option
				.setName('name')
				.setDescription('Your name for registering with the bot')
				.setRequired(true)),
	async execute(interaction) {
		const name = interaction.options.getString('name');
		registerUsers('./db/users.json', interaction, name);
	},
};

function registerUsers(path, interaction, name) {
	fs.readFile(path, 'utf8', (err, data) => {
		if (err) {
			console.error(err);
			return;
		}

		let usersJSON = JSON.parse(data);
		if (usersJSON.hasOwnProperty(interaction.user.id)) {
			
			if (usersJSON[interaction.user.id]["servers"][interaction.guild.id]){
				interaction.reply({ content: "Already registered in this server! 💃", ephemeral: true });
				return;
			} else {
				usersJSON[interaction.user.id]["servers"][interaction.guild.id] = {};
				usersJSON[interaction.user.id]["servers"][interaction.guild.id]["name"] = name;
				usersJSON[interaction.user.id]["servers"][interaction.guild.id]["sounds"] = [];
				fs.writeFileSync(path, JSON.stringify(usersJSON, null, 2));
	
				interaction.reply({ content: "Registed in this server now! 💃", ephemeral: true });
				return;
			}

		}
		else {
			usersJSON[interaction.user.id] = {
				"servers": {}
			}
			usersJSON[interaction.user.id]["servers"][interaction.guild.id] = {};
			usersJSON[interaction.user.id]["servers"][interaction.guild.id]["name"] = name;
			usersJSON[interaction.user.id]["servers"][interaction.guild.id]["sounds"] = [];


			fs.writeFileSync(path, JSON.stringify(usersJSON, null, 2));
			interaction.reply({ content: `Added ${name} with ID: ${interaction.user.id}`, ephemeral: true });
		}
	});
}