/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable('raffles', table => {
    table.increments('id').unsigned().primary();
    table.timestamps(true, true);

    table.string('name').notNullable();
    table.string('description').notNullable();
    table.string('image_url').notNullable();
    table.integer('tickets_count').unsigned().notNullable();

    table.integer('creator_id').notNullable();
    table.foreign('creator_id').references('id').inTable('users');
  });

  await knex.schema.createTable('users_raffles', table => {
    table.increments('id').primary();
    table.timestamps(true, true);

    table.integer('user_id').notNullable();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');

    table.integer('raffle_id').unsigned().notNullable();
    table.foreign('raffle_id').references('id').inTable('raffles').onDelete('CASCADE');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTable('users_raffles');
  await knex.schema.dropTable('raffles');
};
