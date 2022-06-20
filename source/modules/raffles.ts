import { CommandInteraction, MessageEmbed } from 'discord.js';
import { Discord, Guard, Slash, SlashGroup, SlashOption } from 'discordx';

import { InGuild } from '../guards/validators';
import { RafflesQueries } from '../queries/raffles';
import { UsersQueries } from '../queries/users';

const IMAGE_URL_REGEX = /(https?:\/\/.*\.(?:png|jpg))/i;

@Discord()
@SlashGroup({ name: 'raffles' })
@SlashGroup('raffles')
@Guard(InGuild())
export class RafflesModule {
  @Slash('create', { description: 'Create a new raffle.' })
  async handleCreate(
    @SlashOption('name', { description: 'The name of the raffle.' })
    title: string,

    @SlashOption('description', { description: 'The description of the raffle.' })
    description: string,

    @SlashOption('tickets', { description: 'Amount of tickets the raffle has.' })
    tickets: number,

    @SlashOption('image-url', { description: 'The image of the raffle.' })
    imageUrl: string,

    interaction: CommandInteraction<'cached' | 'raw'>
  ): Promise<void> {
    if (!interaction.deferred) {
      await interaction.deferReply({ ephemeral: true });
    }

    if (!IMAGE_URL_REGEX.test(imageUrl)) {
      await interaction.editReply('Invalid image url.');
      return;
    }

    const userData = await UsersQueries.createIfNotExists({
      discordId: interaction.member.user.id,
    });

    const raffleData = await RafflesQueries.create({
      name: title,
      description: description,
      ticketsCount: tickets,
      creatorId: userData.discord_id,
      imageUrl,
    });

    await interaction.editReply({
      embeds: [
        new MessageEmbed()
          .setTitle(raffleData.name)
          .setDescription(raffleData.description)
          .setThumbnail(raffleData.image_url),
      ],
    });
  }

  @Slash('delete', { description: 'Delete a raffle.' })
  async handleDelete(
    @SlashOption('id', { description: 'The id of the raffle.' })
    id: number,

    interaction: CommandInteraction
  ): Promise<void> {
    if (!interaction.deferred) {
      await interaction.deferReply({ ephemeral: true });
    }

    await RafflesQueries.deleteRaffle(id);
    await interaction.editReply('Raffle deleted.');
  }

  @Slash('buy', { description: 'Buy a raffle.' })
  async handleBuy(
    @SlashOption('id', { description: 'The id of the raffle.' })
    id: number,

    @SlashOption('count', { description: 'The amount of tickets you want to buy.' })
    count: number,

    interaction: CommandInteraction
  ): Promise<void> {
    if (!interaction.deferred) {
      await interaction.deferReply({ ephemeral: true });
    }

    await interaction.editReply('Not implemented yet.');
  }

  @Slash('list', { description: 'List all open raffles.' })
  async handleList(interaction: CommandInteraction): Promise<void> {
    if (!interaction.deferred) {
      await interaction.deferReply({ ephemeral: true });
    }

    const raffles = await RafflesQueries.list();

    if (raffles.length === 0) {
      await interaction.editReply('No raffles found.');
      return;
    }

    const raffleListEmbeds = raffles.map(raffle =>
      new MessageEmbed()
        .setTitle(`${raffle.name} (${raffle.tickets_count} tickets)`)
        .setDescription(raffle.description)
        .setImage(raffle.image_url)
        .setColor('BLURPLE')
    );

    await interaction.editReply({
      embeds: raffleListEmbeds,
    });
  }
}
