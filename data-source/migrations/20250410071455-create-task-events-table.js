/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('task_events', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      task_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tasks',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      event_type: {
        type: Sequelize.ENUM(
            'started',
            'succeeded',
            'failed',
            'cancelled',
            'locked',
            'unlocked',
            'rescheduled'
        ),
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Indexes
    await queryInterface.addIndex('task_events', ['task_id'], { name: 'idx_task_events_task_id', });
    await queryInterface.addIndex('task_events', ['event_type'], { name: 'idx_task_events_event_type', });
    await queryInterface.addIndex('task_events', ['created_at'], { name: 'idx_task_events_created_at', });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('task_events');
  },
};
