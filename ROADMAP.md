# Roadmap (in no particular order).

- [ ] Clickable button to join the game.

- [ ] "Raffles", market place for items.

  - [x] `/raffle create title: string description: string tickets: int image-url: string` (Admin only)
  - [x] `/raffle delete item-id: int` (Admin only)
  - [ ] `/raffle buy item-id: int`
  - [x] `/raffle list`

- [ ] Roles that multiplies the amount of money you earn, same as Raffles.

- [ ] Market place for roles, eg. roles that multiply the amount of money you earn.

  - [ ] Buy the roles with a shop message, eg. a channel named `#buy-role`.

- [ ] And basic economy commands.

  - [x] `/balance member?: guild-member`
  - [x] `/transfer member: guild-member amount: int`
  - [x] `/set-balance member: guild-member amount: int` (Admin only)
  - [x] `/add-balance member: guild-member amount: int` (Admin only)
  - [x] `/remove-balance member: guild-member amount: int` (Admin only)
  - [ ] `/daily`

  - [ ] Gambling commands.

    - [x] `/work`
    - [ ] `/slut`
    - [x] `/coinflip`
    - [ ] `/russian-roullete`

- [x] Reward uses for:

  - [x] Message engagement, it should check hourly and give the rewards accordingly.
  - [x] Reaction egagement, when the user reacts a message in designated channels.
  - [x] Meme channel engagement, when some message of the user receives a certain amount of reactions in designated channels.
