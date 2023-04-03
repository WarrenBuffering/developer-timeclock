import fs from 'fs';
import { FilePath } from '../constants';

import type { Project, Session, Task } from '../interfaces';

export function writeProjects(projects: Project[]) {
  fs.writeFileSync(FilePath.PROJECTS, JSON.stringify(projects, null, 2));
}

export function writeSessions(sessions: Session[]) {
  fs.writeFileSync(FilePath.SESSIONS, JSON.stringify(sessions, null, 2));
}

export function writeTasks(tasks: Task[]) {
  fs.writeFileSync(FilePath.TASKS, JSON.stringify(tasks, null, 2));
}
