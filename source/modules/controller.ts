import { ArgsOf, Discord, On, Once } from 'discordx';
import { Client } from '../types';

@Discord()
export class ControllerModule {
  @Once('ready')
  async onceReady(_args: ArgsOf<'ready'>, client: Client<true>): Promise<void> {
    await client.initApplicationCommands();

    if (process.env.DEBUG) {
      console.debug(`[ControllerModule.onceReady/2] connected to ${client.user.tag}`);
    }
  }

  @On('interactionCreate')
  async onInteractionCreate(
    [interaction]: ArgsOf<'interactionCreate'>,
    client: Client<true>
  ): Promise<void> {
    if (process.env.DEBUG) {
      console.debug(`[ControllerModule.onInteractionCreate/2] ${interaction.id} created.`);
    }

    try {
      await client.executeInteraction(interaction);
    } catch (error) {
      if (process.env.DEBUG) {
        console.error(`[ControllerModule.onInteractionCreate/2] ${interaction.id} failed.`, error);
      }
    }
  }
}
