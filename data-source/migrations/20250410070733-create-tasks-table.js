/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tasks', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      task_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      payload: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM(
          'pending',
          'processing',
          'completed',
          'failed',
          'cancelled',
        ),
        allowNull: false,
        defaultValue: 'pending',
      },
      priority: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      scheduled_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      max_retries: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 3,
      },
      retry_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      last_error: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      next_retry_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      locked_by: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      locked_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Indexes
    await queryInterface.addIndex('tasks', ['status'], { name: 'idx_tasks_status', });
    await queryInterface.addIndex('tasks', ['scheduled_at'], { name: 'idx_tasks_scheduled_at', });
    await queryInterface.addIndex('tasks', ['priority'], { name: 'idx_tasks_priority', });
    await queryInterface.addIndex('tasks', ['next_retry_at'], { name: 'idx_tasks_next_retry_at', });
    await queryInterface.addIndex('tasks', ['locked_by'], { name: 'idx_tasks_locked_by', });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('Tasks');
  },
};
