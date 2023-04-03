import { v4 as uuidv4 } from 'uuid';

import type { ReadLine } from 'readline';

import { normalizeInput } from '../utils';

import type {
  Project,
  PromptSuccessResponse,
  PromptErrorResponse,
} from '../interfaces';

interface Args {
  attempts?: number;
  maxAttempts?: number;
  projects: Project[];
  rl: ReadLine;
}

function createNewProjectPrompt({
  attempts = 0,
  maxAttempts = 2,
  projects,
  rl,
}: Args): Promise<PromptErrorResponse | PromptSuccessResponse<Project>> {
  return new Promise((resolve) => {
    const projectNames = projects.map((p) => normalizeInput(p.name));

    if (attempts === maxAttempts) {
      resolve({
        success: false,
        error: 'Too many incorrect attempts',
      });
    } else {
      rl.question('New project name?: ', (name) => {
        if (projectNames.includes(normalizeInput(name))) {
          console.log(
            'Invalid name. Project with that name already exists. Try again: '
          );
          createNewProjectPrompt({ attempts: attempts + 1, projects, rl });
        } else {
          const newProject = {
            id: uuidv4(),
            name,
          };
          projects.push(newProject);
          resolve({
            success: true,
            data: newProject,
          });
        }
      });
    }
  });
}

export default createNewProjectPrompt;
