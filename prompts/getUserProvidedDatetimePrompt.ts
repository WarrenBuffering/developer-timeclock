import type { ReadLine } from 'readline';

import { convertLocalToGMT, isValidDate } from '../utils';

import type { PromptSuccessResponse, PromptErrorResponse } from '../interfaces';

interface Args {
  attempts?: number;
  maxAttempts?: number;
  rl: ReadLine;
}

function getUserProvidedDatetimePrompt({
  attempts = 0,
  maxAttempts = 3,
  rl,
}: Args): Promise<PromptErrorResponse | PromptSuccessResponse<string>> {
  return new Promise(async (resolve) => {
    if (attempts === maxAttempts) {
      resolve({
        success: false,
        error: 'Too many invalid attempts',
      });
    } else {
      rl.question(
        `Provide local datetime in format YYYY/MM/DD HH:mm:ss`,
        (datetime) => {
          if (!isValidDate(datetime)) {
            console.log('Invalid date.');
            getUserProvidedDatetimePrompt({ attempts: attempts + 1, rl });
          } else {
            const gmtDatetime = convertLocalToGMT(datetime);
            resolve({
              success: true,
              data: gmtDatetime,
            });
          }
        }
      );
    }
  });
}

export default getUserProvidedDatetimePrompt;
