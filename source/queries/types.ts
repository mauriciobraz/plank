export type Increment = number;
export type SignedInteger = number;

export namespace RawTypes {
  export type User = {
    id: Increment;

    discord_id: string;

    created_at: string;
    updated_at: string;
  };

  export type UserRaffleJoin = {
    id: Increment;

    user_id: Increment;
    raffle_id: Increment;

    created_at: string;
    updated_at: string;
  };

  export type Raffle = {
    id: Increment;

    name: string;
    description: string;
    tickets_count: SignedInteger;
    image_url: string;
    creator_id: Increment;

    created_at: string;
    updated_at: string;
  };
}
