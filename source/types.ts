import { Client as ClientX } from 'discordx';
import { Client as ClientJS } from 'discord.js';

export type Client<T extends boolean = false> = T extends true
  ? ClientX & ClientJS<true>
  : ClientX & ClientJS<false>;
