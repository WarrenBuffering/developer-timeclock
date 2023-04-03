#!/usr/bin/env node
import * as readline from 'readline';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

import createNewProjectPrompt from './prompts/createNewProjectPrompt';
import createNewSessionPrompt from './prompts/createNewSessionPrompt';
import createNewTaskPrompt from './prompts/createNewTaskPrompt';
import getTimePrompt from './prompts/getTimePrompt';
import whichProjectPrompt from './prompts/whichProjectPrompt';
import whichTaskPrompt from './prompts/whichTaskPrompt';
import yesNoPrompt from './prompts/yesNoPrompt';

import {
  readProjects,
  readSessions,
  readTasks,
  writeProjects,
  writeSessions,
  writeTasks,
} from './utils';

import type {
  Project,
  PromptSuccessResponse,
  PromptErrorResponse,
  Session,
  Task,
} from './interfaces';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/*=============================================================================
= Break Start
=============================================================================*/

async function handleBreakStart() {
  const sessions = readSessions();

  if (!sessions.length) {
    console.log('You have to clock in first');
    rl.close();
  } else {
    const lastSession = sessions[sessions.length - 1];

    if (lastSession.out) {
      console.log('You have to clock in first');
      rl.close();
    } else {
      const datetimeResponse = await getTimePrompt({ rl });

      if (datetimeResponse.success) {
        lastSession.out = datetimeResponse.data;
        writeSessions(sessions);
        console.log('Break started');
        rl.close();
      }
    }
  }
}

/*=============================================================================
= Break End
=============================================================================*/

async function handleBreakEnd() {
  const sessions = readSessions();

  try {
    if (!sessions.length) {
      console.log("You've never tracked anything before");
      rl.close();
    } else {
      const lastSession = sessions[sessions.length - 1];

      if (!lastSession.out) {
        console.log("You're already clocked in");
        rl.close();
      } else {
        const datetimeResponse = await getTimePrompt({ rl });

        if (datetimeResponse.success) {
          const newSession = {
            ...lastSession,
            in: datetimeResponse.data,
            out: null,
          };
          sessions.push(newSession);
          writeSessions(sessions);
          console.log('Break ended');
          rl.close();
        } else {
          console.log(datetimeResponse.error);
          rl.close();
        }
      }
    }
  } catch (err) {
    console.log(err);
    rl.close();
  }
}

/*=============================================================================
= Clock In
=============================================================================*/

async function handleClockIn() {
  try {
    const projects = readProjects();
    const sessions = readSessions();
    const tasks = readTasks();

    if (sessions.length) {
      const lastSession = sessions[sessions.length - 1];
      if (!lastSession.out) {
        console.log("You're already clocked in");
        rl.close();
      }
    } else {
      // use existing or create new project
      const projResponse = await whichProjectPrompt({ projects, rl });

      if (projResponse.success) {
        const project = projResponse.data;

        // use existing or create new task
        const taskResponse = await whichTaskPrompt({
          projectID: project.id,
          rl,
          tasks,
        });

        if (taskResponse.success) {
          const task = taskResponse.data;

          const timeResponse = await getTimePrompt({ rl });

          if (timeResponse.success) {
            // create an assocated session
            const sessionResponse = await createNewSessionPrompt({
              datetime: timeResponse.data,
              projectID: project.id,
              sessions,
              taskID: task.id,
              rl,
            });

            if (sessionResponse.success) {
              writeProjects(projects);
              writeTasks(tasks);
              writeSessions(sessions);
              console.log(
                `Clocked in to ${project.name} on ${task.name} working on ${sessionResponse.data.description}`
              );
              rl.close();
            }
          } else {
            console.log(timeResponse.error);
            rl.close();
          }
        } else {
          console.log(taskResponse.error);
          rl.close();
        }
      } else {
        console.log(projResponse.error);
        rl.close();
      }
    }
  } catch (err) {
    console.log(err);
    rl.close();
  }
}

/*=============================================================================
= Clock Out
=============================================================================*/

async function handleClockOut() {
  const sessions = readSessions();
  const lastSession = sessions.length && sessions[sessions.length - 1];

  try {
    if (!sessions.length || !lastSession || lastSession.out) {
      console.log('Not clocked in.');
      rl.close();
    } else {
      const timeResponse = await getTimePrompt({ rl });

      if (timeResponse.success) {
        lastSession.out = timeResponse.data;
        writeSessions(sessions);
        console.log('Clocked out successfully');
        rl.close();
      } else {
        console.log(timeResponse.error);
      }
    }
  } catch (err) {
    console.log(err);
    rl.close();
  }
}

/*=============================================================================
= Create Project
=============================================================================*/

async function handleCreateNewProject() {
  const projects = readProjects();
  const projectResponse = await createNewProjectPrompt({ projects, rl });

  if (projectResponse.success) {
    projects.push(projectResponse.data);
    writeProjects(projects);
    console.log(`${projectResponse.data.name} created successfully.`);
    rl.close();
  } else {
    console.log(`Unable to create project. Error: ${projectResponse.error}`);
    rl.close();
  }
}

/*=============================================================================
= Switch Project
=============================================================================*/

async function handleSwitchProject() {
  const projects = readProjects();
  const tasks = readTasks();
  const sessions = readSessions();

  try {
    const projectResponse = await whichProjectPrompt({ projects, rl });

    if (projectResponse.success) {
      const project = projectResponse.data;
      const taskResponse = await whichTaskPrompt({
        projectID: project.id,
        rl,
        tasks,
      });

      if (taskResponse.success) {
        const task = taskResponse.data;
        const timeResponse = await getTimePrompt({ rl });

        if (timeResponse.success) {
          const datetime = timeResponse.data;
          const sessionResponse = await createNewSessionPrompt({
            datetime,
            projectID: project.id,
            rl,
            sessions,
            taskID: task.id,
          });

          if (sessionResponse.success) {
            writeProjects(projects);
            writeTasks(tasks);
            writeSessions(sessions);
            console.log(
              `Switched to ${project.name} > ${task.name} working on ${
                sessionResponse.data.description || 'unknown'
              }`
            );
            rl.close();
          }
        } else {
          console.log(timeResponse.error);
          rl.close();
        }
      } else {
        console.log(taskResponse.error);
        rl.close();
      }
    } else {
      console.log(projectResponse.error);
      rl.close();
    }
  } catch (err) {
    console.log(err);
    rl.close();
  }
}

/*=============================================================================
= Switch Task
=============================================================================*/

async function handleSwitchTask() {
  const sessions = readSessions();
  const tasks = readTasks();

  try {
    if (!sessions.length) {
      console.log('No sessions found');
      rl.close();
    } else {
      const lastSession = sessions[sessions.length - 1];

      if (lastSession.out) {
        console.log('You have to be clocked in to switch tasks');
        rl.close();
      } else {
        const taskResponse = await whichTaskPrompt({
          tasks,
          projectID: lastSession.projectID,
          rl,
        });

        if (taskResponse.success) {
          const task = taskResponse.data;
          const timeResponse = await getTimePrompt({ rl });

          if (timeResponse.success) {
            const datetime = timeResponse.data;
            const sessionResponse = await createNewSessionPrompt({
              datetime,
              projectID: lastSession.projectID,
              rl,
              sessions,
              taskID: task.id,
            });

            if (sessionResponse.success) {
              lastSession.out = datetime;
              writeTasks(tasks);
              writeSessions(sessions);
              console.log(
                `Switched to ${task.name} working on ${
                  sessionResponse.data.description || 'unknown'
                }`
              );
              rl.close();
            }
          } else {
            console.log(timeResponse.error);
            rl.close();
          }
        } else {
          console.log(taskResponse.error);
          rl.close();
        }
      }
    }
  } catch (err) {
    console.log(err);
    rl.close();
  }
}

function handleStatus() {
  const projects = readProjects();
  const tasks = readTasks();
  const sessions = readSessions();

  if (!sessions.length) {
    console.log("You've never tracked anything before");
  } else {
    const lastSession = sessions[sessions.length - 1];

    if (lastSession.out) {
      console.log("You're not clocked in");
    } else {
      const project = projects.find((p) => p.id === lastSession.projectID);
      const task = projects.find((t) => t.id === lastSession.taskID);
      console.log(
        `You're clocked in to \nProject: ${project?.name} \nTask: ${task?.name} \nDescription: ${lastSession?.description}`
      );
    }
  }
  rl.close();
}

/*=============================================================================
= CLI
=============================================================================*/

function main() {
  const [_, __, command] = process.argv;

  switch (command) {
    case 'break-end':
      handleBreakEnd();
      break;
    case 'break-start':
      handleBreakStart();
      break;
    case 'create-project':
      handleCreateNewProject();
      break;
    case 'in':
      handleClockIn();
      break;
    case 'status':
      handleStatus();
      break;
    case 'switch':
      handleSwitchProject();
      break;
    case 'switch-task':
      handleSwitchTask();
    case 'out':
      handleClockOut();
      break;
    default:
      console.log(
        'Invalid command. Use "help" for a list of available commands.'
      );
      process.exit(1);
  }
}

main();
