import { v4 as uuidv4 } from 'uuid';

import type { ReadLine } from 'readline';

import { normalizeInput } from '../utils';
import type {
  PromptSuccessResponse,
  PromptErrorResponse,
  Task,
} from '../interfaces';

interface Args {
  attempts?: number;
  maxAttempts?: number;
  projectID: string;
  tasks: Task[];
  rl: ReadLine;
}

function createNewTaskPrompt({
  attempts = 0,
  maxAttempts = 2,
  projectID,
  tasks,
  rl,
}: Args): Promise<PromptErrorResponse | PromptSuccessResponse<Task>> {
  return new Promise((resolve) => {
    const projectTasks = tasks.filter((t) => t.id === projectID);
    const taskNames = projectTasks.map((p) => normalizeInput(p.name));

    if (attempts === maxAttempts) {
      resolve({
        success: false,
        error: 'Too many invalid attempts',
      });
    } else {
      rl.question('New task name?: ', (name) => {
        if (taskNames.includes(normalizeInput(name))) {
          console.log('Task already exists');
          createNewTaskPrompt({ attempts: attempts + 1, projectID, rl, tasks });
        } else {
          const newTask = {
            projectID,
            id: uuidv4(),
            name: name,
          };
          tasks.push(newTask);
          resolve({
            success: true,
            data: newTask,
          });
        }
      });
    }
  });
}

export default createNewTaskPrompt;
