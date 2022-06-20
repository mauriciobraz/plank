import knex from 'knex';
import { Dotenv } from './utils/dotenv';
const config = require('../knexfile');

const ENV = Dotenv.getString('NODE_ENV');
const KNEX_ENV = ENV in ['development', 'production'] ? ENV : 'development';

export default knex(config[KNEX_ENV]);
