/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface) => {
    // Add new values to the existing enum type
    // We need to add each value separately and within a transaction
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_tasks_type" ADD VALUE IF NOT EXISTS 'console-log';
    `);

    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_tasks_type" ADD VALUE IF NOT EXISTS 'success-test';
    `);

    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_tasks_type" ADD VALUE IF NOT EXISTS 'failure-test';
    `);
  },

  down: async (queryInterface) => {
    // PostgreSQL doesn't support removing values from an enum type
    // For the down migration, hence ignoring it

    // Create a new enum type with only the original value
    await queryInterface.sequelize.query(`
      SELECT 1+1;
    `);
  },
};
