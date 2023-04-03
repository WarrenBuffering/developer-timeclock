import { v4 as uuidv4 } from 'uuid';

import type { ReadLine } from 'readline';

import type { PromptSuccessResponse, Session } from '../interfaces';

interface Args {
  datetime: string;
  projectID: string;
  rl: ReadLine;
  sessions: Session[];
  taskID: string;
}

function createNewSessionPrompt({
  datetime,
  projectID,
  rl,
  sessions,
  taskID,
}: Args): Promise<PromptSuccessResponse<Session>> {
  return new Promise((resolve) => {
    rl.question(
      'What are you working on right now? (optional, press enter to skip): ',
      (description) => {
        const newSession = {
          description,
          id: uuidv4(),
          in: datetime,
          out: null,
          projectID,
          taskID,
        };

        sessions.push(newSession);

        resolve({
          success: true,
          data: newSession,
        });
      }
    );
  });
}

export default createNewSessionPrompt;
