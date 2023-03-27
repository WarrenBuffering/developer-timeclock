#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import * as readline from 'readline';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

import { getCurrentDatetime } from './utils';

import type { Project, Session } from './interfaces';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const projectsFilePath = path.join(__dirname, '/data/projects.json');
const sessionsFilePath = path.join(__dirname, '/data/sessions.json');

function readSessions(): Session[] {
  const rawData = fs.readFileSync(sessionsFilePath, 'utf8');
  return rawData ? JSON.parse(rawData) : {};
}

function readProjects(): Project[] {
  const rawData = fs.readFileSync(projectsFilePath, 'utf8');
  return rawData ? JSON.parse(rawData) : {};
}

function writeSessions(sessions: Session[]) {
  fs.writeFileSync(sessionsFilePath, JSON.stringify(sessions, null, 2));
}

function writeProjects(projects: Project[]) {
  fs.writeFileSync(projectsFilePath, JSON.stringify(projects, null, 2));
}

function sanitizeInput(str: string): string {
  return str.trim().toLowerCase();
}

function promptUseExistingProject(): Promise<boolean> {
  return new Promise((res) => {
    rl.question('Use existing project? (y/n): ', (ans) => {
      if (sanitizeInput(ans) === 'y') {
        res(true);
      } else {
        res(false);
      }
    });
  });
}

function whichProjectPrompt({
  attempts = 0,
  projects,
}: {
  attempts?: number;
  projects: Project[];
}): Promise<Project> {
  return new Promise((res, rej) => {
    if (attempts === 3) {
      console.log('Too many incorrect attempts');
      rl.close();
    } else {
      const projectIDs = projects.map((p) => p.id);
      // print all projects to console
      let projectsList = '';
      projects.forEach((p) => (projectsList += `\n${p.id} - ${p.name}`));
      console.log(projectsList);
      console.log('');

      rl.question('Which project (enter associated number): ', (id) => {
        const project = projects.find((p) => p.id === +id);
        if (project) {
          res(project);
        } else {
          console.log('Incorrect project number.');
          whichProjectPrompt({
            attempts: attempts + 1,
            projects,
          });
        }
      });
    }
  });
}

function createNewSession({
  projectID,
  lastSessionID,
}: {
  projectID: number;
  lastSessionID: number;
}): Promise<Session> {
  return new Promise((res) => {
    rl.question(
      'Session description? (optional, press enter to skip): ',
      (description) => {
        res({
          description,
          id: lastSessionID + 1,
          in: getCurrentDatetime(),
          out: null,
          projectID,
        });
      }
    );
  });
}

function createNewProject({
  attempts = 0,
  projects,
}: {
  attempts?: number;
  projects: Project[];
}): Promise<Project> {
  return new Promise((res) => {
    const projectNames = projects.map((p) => p.name.trim().toLowerCase());

    if (attempts === 3) {
      console.log('Too many incorrect attempts. Closing');
      rl.close();
    } else {
      rl.question('New project name?: ', (name) => {
        if (projectNames.includes(sanitizeInput(name))) {
          console.log('Project already exists');
          createNewProject({ attempts: attempts + 1, projects });
        } else {
          const newProjectID = projects.length
            ? projects[projects.length - 1].id + 1
            : 1;
          res({
            id: newProjectID,
            name: name,
          });
        }
      });
    }
  });
}

function getClockOutDatetime({
  sessionDescription = 'UNKNOWN',
  projectName = 'UNKNOWN PROJECT',
}: {
  sessionDescription?: string;
  projectName?: string;
}): Promise<string> {
  return new Promise((res) => {
    rl.question(
      `Clocked in on "${projectName || 'unnamed project'}" working on "${
        sessionDescription || 'unknown'
      }". Clock out using current datetime? (y/n): `,
      (resp) => {
        if (sanitizeInput(resp) === 'y') {
          res(getCurrentDatetime());
        } else {
          rl.question(
            `Provide clockout datetime in local time: (YYYY/MM/DD HH:mm:ss): `,
            (datetime) => {
              if (dayjs(datetime).isValid()) {
                const userDate = new Date(datetime);
                // Get user's timezone offset in minutes
                const userOffset = userDate.getTimezoneOffset();
                // Adjust user-provided date to UTC
                const utcDate = new Date(
                  userDate.getTime() + userOffset * 60 * 1000
                );
                res(utcDate.toISOString());
              } else {
                console.log('Invalid datetime. Closing');
                rl.close();
              }
            }
          );
        }
      }
    );
  });
}

async function handleClockIn() {
  const projects: Project[] = readProjects();
  const sessions: Session[] = readSessions();

  try {
    // if no prior history
    if (!sessions.length && !projects.length) {
      const newProject = await createNewProject({ projects });
      const newSession = await createNewSession({
        projectID: newProject.id,
        lastSessionID: 0,
      });
      projects.push(newProject);
      sessions.push(newSession);
      writeProjects(projects);
      writeSessions(sessions);
      rl.close();
    } else {
      const lastSession = sessions[sessions.length - 1];
      const lastProject = projects.find((p) => p.id === lastSession.projectID);

      // if user forgot to clock out last time
      if (lastSession && lastSession.in !== null && !lastSession.out) {
        console.log('Currently clocked in.');
        const newClockOutDatetime = await getClockOutDatetime({
          projectName: lastProject?.name,
          sessionDescription: lastSession.description || '',
        });

        lastSession.out = newClockOutDatetime;
        writeSessions(sessions);
        console.log('Clocked out successfully.');
        handleClockIn();
      }

      // handle actual clock in
      const useExistingProject = await promptUseExistingProject();
      if (useExistingProject) {
        const project = await whichProjectPrompt({ projects });
        const newSession = await createNewSession({
          projectID: project.id,
          lastSessionID: lastSession.id,
        });

        sessions.push(newSession);
        writeSessions(sessions);
      } else {
        const newProject = await createNewProject({ projects });
        const newSession = await createNewSession({
          projectID: newProject.id,
          lastSessionID: lastSession.id,
        });

        sessions.push(newSession);
        projects.push(newProject);
        writeSessions(sessions);
        writeProjects(projects);
      }

      console.log('Clocked in successfully.');
      rl.close();
    }
  } catch (err) {
    console.log(err);
    console.log(new Error('handleClockIn Catch Error'));
    rl.close();
  }
}

async function handleClockOut() {
  const projects = readProjects();
  const sessions = readSessions();
  const currSession = sessions[sessions.length - 1];
  const currProject = projects.find((p) => p.id === currSession.projectID);

  if (currSession.out) {
    console.log('Not clocked in');
    rl.close();
  } else {
    const clockOutDatetime = await getClockOutDatetime({
      projectName: currProject?.name,
      sessionDescription: currSession?.description || '',
    });
    currSession.out = clockOutDatetime;
    writeSessions(sessions);
    rl.close();
    console.log('Clocked out successfully');
  }
}

function handleStatus() {
  const projects = readProjects();
  const sessions = readSessions();

  const currSession = sessions.length && sessions[sessions.length - 1];

  if (currSession && !currSession.out) {
    const project = projects.find((p) => p.id === currSession.projectID);
    console.log(
      `Clocked in to ${project?.name} working on ${currSession.description}`
    );
  } else {
    console.log('Not currently clocked in.');
  }

  rl.close();
}

function main() {
  const [_, __, command] = process.argv;

  switch (command) {
    case 'status':
      handleStatus();
      break;
    case 'in':
      handleClockIn();
      break;
    case 'out':
      handleClockOut();
      break;
    case 'switch':
    // TODO: switch between tasks (create a new session)
    default:
      console.log('Invalid command. Use "in" or "out".');
      process.exit(1);
  }
}

main();
