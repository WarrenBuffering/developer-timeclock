import fs from 'fs';
import { FilePath } from '../constants';

import type { Project, Session, Task } from '../interfaces';

export function readProjects(): Project[] {
  const rawData = fs.readFileSync(FilePath.PROJECTS, 'utf8');
  return rawData ? JSON.parse(rawData) : [];
}

export function readSessions(): Session[] {
  const rawData = fs.readFileSync(FilePath.SESSIONS, 'utf8');
  return rawData ? JSON.parse(rawData) : [];
}

export function readTasks(): Task[] {
  const rawData = fs.readFileSync(FilePath.TASKS, 'utf8');
  return rawData ? JSON.parse(rawData) : [];
}
