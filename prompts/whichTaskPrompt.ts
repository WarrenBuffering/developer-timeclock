import type { ReadLine } from 'readline';

import createNewTaskPrompt from './createNewTaskPrompt';

import type {
  PromptSuccessResponse,
  PromptErrorResponse,
  Task,
} from '../interfaces';

interface Args {
  attempts?: number;
  maxAttempts?: number;
  projectID: string;
  rl: ReadLine;
  tasks: Task[];
}

function whichTaskPrompt({
  attempts = 0,
  maxAttempts = 3,
  projectID,
  rl,
  tasks,
}: Args): Promise<PromptErrorResponse | PromptSuccessResponse<Task>> {
  return new Promise((resolve) => {
    if (attempts === maxAttempts) {
      resolve({
        success: false,
        error: 'Too many wrong attempts',
      });
    } else {
      const projectTasks = tasks.filter((t) => t.id === projectID);
      if (projectTasks.length) {
        let tasksList = '';

        tasks.forEach((p, index) => (tasksList += `\n${index} - ${p.name}`));
        console.log(tasksList);
        console.log('');

        rl.question(
          'Which task (enter associated number or press enter to create new task): ',
          (index) => {
            if (index) {
              if (+index >= 0 && +index < tasks.length) {
                const task = tasks[+index];
                resolve({
                  success: true,
                  data: task,
                });
              } else {
                console.log('Incorrect task number.');
                whichTaskPrompt({
                  attempts: attempts + 1,
                  projectID,
                  rl,
                  tasks,
                });
              }
            } else {
              resolve(createNewTaskPrompt({ projectID, rl, tasks }));
            }
          }
        );
      } else {
        resolve(createNewTaskPrompt({ projectID, rl, tasks }));
      }
    }
  });
}

export default whichTaskPrompt;
