import path from 'path';

export const FilePath = Object.freeze({
  PROJECTS: path.join(__dirname, '/data/projects.json'),
  SESSIONS: path.join(__dirname, '/data/sessions.json'),
  TASKS: path.join(__dirname, '/data/tasks.json'),
});
