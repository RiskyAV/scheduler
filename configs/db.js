const currentEnv = (process.env.NODE_ENV != null)? process.env.NODE_ENV : 'local';

const envs = {};
// eslint-disable-next-line import/no-dynamic-require, @typescript-eslint/no-var-requires,@typescript-eslint/no-require-imports
envs[currentEnv] = require(`./${currentEnv}.json`).db;
envs[currentEnv].dialect = 'postgres';

module.exports = envs;
