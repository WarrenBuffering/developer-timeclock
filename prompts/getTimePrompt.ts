import type { ReadLine } from 'readline';

import yesNoPrompt from './yesNoPrompt';
import getUserProvidedDatetimePrompt from './getUserProvidedDatetimePrompt';
import { getCurrentDatetime } from '../utils';

import type { PromptSuccessResponse, PromptErrorResponse } from '../interfaces';

interface Args {
  attempts?: number;
  maxAttempts?: number;
  rl: ReadLine;
}

function getTimePrompt({
  attempts = 0,
  maxAttempts = 2,
  rl,
}: Args): Promise<PromptErrorResponse | PromptSuccessResponse<string>> {
  return new Promise(async (resolve) => {
    if (attempts === maxAttempts) {
      resolve({
        success: false,
        error: 'Too many invalid attempts',
      });
    } else {
      const useCurrentTime = await yesNoPrompt('Use current time?', rl);

      if (useCurrentTime) {
        resolve({
          success: true,
          data: getCurrentDatetime(),
        });
      } else {
        resolve(getUserProvidedDatetimePrompt({ rl }));
      }
    }
  });
}

export default getTimePrompt;
