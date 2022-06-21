/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.alterTable('users', table => {
    table.integer('balance').defaultTo(0).notNullable();
    table.date('last_daily').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.alterTable('users', table => {
    table.dropColumn('balance');
    table.dropColumn('last_daily');
  });
};
