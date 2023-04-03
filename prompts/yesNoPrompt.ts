import type { ReadLine } from 'readline';

function yesNoPrompt(question: string, rl: ReadLine): Promise<boolean> {
  return new Promise((res) => {
    rl.question(`${question} (y/n): `, (response) => {
      if (response.trim().toLowerCase() === 'y') {
        res(true);
      } else {
        res(false);
      }
    });
  });
}

export default yesNoPrompt;
