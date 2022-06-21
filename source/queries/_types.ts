export type Increment = number;

export type SignedInteger = number;

export type KnexDate = string | number | Date;

export type Timestamps = {
  created_at: KnexDate;
  updated_at: KnexDate;
};

export type PrepareRawTypeForInput<T> = Omit<T, 'id' | keyof Timestamps>;

export namespace RawTypes {
  export type User = Timestamps & {
    id: Increment;
    discord_id: string;
    balance: number;
    last_daily: KnexDate | null;
  };

  export type UserRaffleJoin = Timestamps & {
    id: Increment;
    user_id: Increment;
    raffle_id: Increment;
  };

  export type Raffle = Timestamps & {
    id: Increment;
    name: string;
    description: string;
    tickets_count: SignedInteger;
    image_url: string;
    creator_id: Increment;
  };

  export type GuildConfig = Timestamps & {
    id: Increment;
    guild_id: string;
  };
}
