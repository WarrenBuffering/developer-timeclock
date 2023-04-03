import type { ReadLine } from 'readline';

import createNewProjectPrompt from './createNewProjectPrompt';

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

function whichProjectPrompt({
  attempts = 0,
  maxAttempts = 2,
  projects,
  rl,
}: Args): Promise<PromptErrorResponse | PromptSuccessResponse<Project>> {
  return new Promise((resolve) => {
    if (attempts === maxAttempts) {
      resolve({
        success: false,
        error: 'Too many wrong attempts',
      });
    } else if (projects.length) {
      const projectIDs = projects.map((p) => p.id);
      let projectsList = '';
      projects.forEach(
        (p, index) => (projectsList += `\n${index + 1} - ${p.name}`)
      );
      console.log(projectsList);
      console.log('');

      rl.question(
        'Which project (enter associated number, or press enter to create a new project): ',
        async (index) => {
          if (index) {
            if (+index > 0 && +index <= projects.length) {
              const project = projects[+index - 1];
              resolve({
                success: true,
                data: project,
              });
            } else {
              console.log('No projects with that number, try again:.');
              whichProjectPrompt({
                attempts: attempts + 1,
                projects,
                rl,
              });
            }
          } else {
            resolve(createNewProjectPrompt({ projects, rl }));
          }
        }
      );
    } else {
      resolve(createNewProjectPrompt({ projects, rl }));
    }
  });
}

// interface CreateNewArgs {
//   projects: Project[];
//   resolve(args: PromptErrorResponse | PromptSuccessResponse<Project>): void;
//   rl: ReadLine;
// }

// async function handleCreateNewProject({
//   projects,
//   resolve,
//   rl,
// }: CreateNewArgs) {
//   const createResponse = await createNewProjectPrompt({
//     projects,
//     rl,
//   });

//   if (createResponse.success) {
//     resolve({
//       success: true,
//       data: createResponse.data,
//     });
//   } else {
//     resolve({
//       success: false,
//       error: createResponse.error,
//     });
//   }
// }

export default whichProjectPrompt;
