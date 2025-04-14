import { TaskEvent } from './task-event.entity';
import { Task } from './task.entity';

const generateProvider = (entity) => [{
  provide: `${entity.name.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase()}_REPOSITORY`,
  useValue: entity,
}];

export const taskProvider = generateProvider(Task);
export const taskEventProvider = generateProvider(TaskEvent);
