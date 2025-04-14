/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create the enum type for task types
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_tasks_type" AS ENUM ('sample-task');
    `);

    // Add the type column to the tasks table
    await queryInterface.addColumn('tasks', 'type', {
      type: Sequelize.ENUM('sample-task'),
      allowNull: false,
      defaultValue: 'sample-task',
      after: 'task_name'
    });

    // Add an index on the type column
    await queryInterface.addIndex('tasks', ['type'], { name: 'idx_tasks_type' });
  },

  down: async (queryInterface) => {
    // Remove the index
    await queryInterface.removeIndex('tasks', 'idx_tasks_type');

    // Remove the type column
    await queryInterface.removeColumn('tasks', 'type');

    // Drop the enum type
    await queryInterface.sequelize.query(`
      DROP TYPE "enum_tasks_type";
    `);
  },
};
