import 'dotenv/config';
import type { Knex } from 'knex';
import { resolve } from 'path';

module.exports = <NodeJS.Dict<Knex.Config>>{
  development: {
    client: 'better-sqlite3',
    useNullAsDefault: true,
    connection: {
      filename: resolve(__dirname, 'data', 'plank-development.sqlite3'),
      debug: true,
    },
    migrations: {
      directory: resolve(__dirname, 'migrations'),
    },
  },

  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: resolve(__dirname, 'migrations'),
    },
  },
};
