#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const readline = __importStar(require("readline"));
const dayjs_1 = __importDefault(require("dayjs"));
const utils_1 = require("./utils");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
const projectsFilePath = path_1.default.join(__dirname, '/data/projects.json');
const sessionsFilePath = path_1.default.join(__dirname, '/data/sessions.json');
function ask({ question, validator, validationWarning = 'INVALID_COMMAND, try again: ', attempts = 1, maxAttempts = 3, }) {
    return new Promise((resolve, reject) => {
        if (attempts > maxAttempts) {
            reject('Maximum attempts reached.');
            rl.close();
            return;
        }
        rl.question(question, (answer) => {
            if (validator && validator(answer)) {
                resolve(answer);
            }
            else if (!validator && answer) {
                resolve(answer);
            }
            else {
                console.log('');
                console.log(validationWarning);
                ask({
                    question,
                    validator,
                    validationWarning,
                    attempts: attempts + 1,
                })
                    .then(resolve)
                    .catch(reject);
            }
        });
    });
}
function createNewProject() {
    const projects = readProjects();
    const sessions = readSessions();
    ask({
        question: 'Give the project a name: ',
        validator: utils_1.isValidName,
    })
        .then((name) => {
        ask({
            question: 'What specific project task will you be working on? (optional, to skip press enter): ',
        })
            .then((desc) => {
            // create new project
            const newProjectID = projects.length
                ? projects[projects.length - 1].id + 1
                : 1;
            const newProject = {
                id: newProjectID,
                name,
            };
            // create new
            const newSessionID = sessions.length
                ? sessions[sessions.length - 1].id + 1
                : 1;
            const newSession = {
                id: newSessionID,
                description: desc || '',
                in: (0, utils_1.getCurrentDatetime)(),
                out: null,
                projectID: newProjectID,
            };
            // if (mostRecentSession && !mostRecentSession.out) {
            //   `Clocking out of previous project`;
            //   mostRecentSession.out = getCurrentDatetime();
            // }
            projects.push(newProject);
            sessions.push(newSession);
            writeProjects(projects);
            writeSessions(sessions);
            console.log(`Project ${name} created and you're clocked in as ${desc}!`);
            rl.close();
        })
            .catch((err) => {
            console.log('Unknown Error. Exiting', err);
            rl.close();
        });
    })
        .catch(() => {
        console.log('Invalid name. Exiting');
        rl.close();
    });
}
function readSessions() {
    const rawData = fs_1.default.readFileSync(sessionsFilePath, 'utf8');
    return rawData ? JSON.parse(rawData) : {};
}
function readProjects() {
    const rawData = fs_1.default.readFileSync(projectsFilePath, 'utf8');
    return rawData ? JSON.parse(rawData) : {};
}
function writeSessions(sessions) {
    fs_1.default.writeFileSync(sessionsFilePath, JSON.stringify(sessions, null, 2));
}
function writeProjects(projects) {
    fs_1.default.writeFileSync(projectsFilePath, JSON.stringify(projects, null, 2));
}
function promptStillClockedIn() { }
function handleForgottenClockOut({ lastSession, lastProjectName, }) {
    return new Promise((res, rej) => {
        ask({
            question: `Should we clock you out with current date and time? (y/n): `,
            validator: utils_1.isYesOrNo,
        })
            .then((ans) => {
            if (ans.toLowerCase() === 'y') {
                lastSession.out = (0, utils_1.getCurrentDatetime)();
                res(true);
            }
            else {
                console.log('');
                ask({
                    question: 'What time should we clock you out? \nUse 24H military time with format "hh:mm" (no quotes): ',
                    validator: utils_1.isValidTime,
                })
                    .then((time) => {
                    console.log('');
                    ask({
                        question: 'Was this on the same date as your clock-in? (y/n): ',
                        validator: utils_1.isYesOrNo,
                    }).then((isSameDate) => {
                        if (isSameDate.toLowerCase() === 'y') {
                            const clockoutDatetime = (0, utils_1.createNewTimeOnDate)(lastSession.in, time);
                            lastSession.out = clockoutDatetime;
                            res(true);
                        }
                        else {
                            console.log('');
                            ask({
                                question: 'What date should this clock out take place? \nUse MM/DD/YYYY format: ',
                                validator: utils_1.isValidDate,
                            }).then((date) => {
                                const fullClockoutDateTime = (0, dayjs_1.default)(`${date} ${time}`).format('YYYY-MM-DDTmm:hh');
                                lastSession.out = fullClockoutDateTime;
                                res(true);
                            });
                        }
                    });
                })
                    .catch((err) => {
                    console.log(err);
                    res(true);
                });
            }
        })
            .catch((err) => {
            console.log('Unable to clock out', err);
            res(true);
        });
    });
}
function handleClockIn() {
    return __awaiter(this, void 0, void 0, function* () {
        const projects = readProjects();
        const sessions = readSessions();
        if (!sessions.length && !projects.length) {
            createNewProject();
        }
        else {
            const lastSession = sessions[sessions.length - 1];
            const lastProject = projects.find((p) => p.id === lastSession.projectID);
            if (lastSession && lastSession.in !== null && !lastSession.out) {
                console.log(`You are still clocked in on "${lastProject === null || lastProject === void 0 ? void 0 : lastProject.name}" working on "${lastSession.description}."`);
                yield handleForgottenClockOut({
                    lastSession,
                    lastProjectName: (lastProject === null || lastProject === void 0 ? void 0 : lastProject.name) || '',
                });
                console.log("Great! You're clocked out! Now let's get back to clocking in.");
                writeSessions(sessions);
                handleClockIn();
            }
            ask({
                question: 'Is this a new project? (y/n): ',
                validator: utils_1.isYesOrNo,
            }).then((ans) => {
                if (ans.toLowerCase() === 'y') {
                    createNewProject();
                }
            });
        }
        // rl.question('Clock in to an existing project? y/n', (line) => {
        //   if (line.toLowerCase === 'y') {
        //     console.log('person selected yes');
        //     //   let projectsList = '';
        //     //     projectNames.forEach((project, index) => {
        //     //       console.log(`${index + 1}. ${project}`);
        //     //     });
        //     //     rl.question(
        //     //       'Choose a project by typing the corresponding number. Existing projects:',
        //     //       (projectNumber) => {}
        //     //     );
        //     // }
        //   } else {
        //     createNewProject(projects, sessions);
        //   }
        // });
    });
}
function handleClockOut() {
    const projects = readProjects();
    const lastSession = projects[projects.length - 1];
    if (lastSession && !lastSession.out) {
        lastSession.out = (0, utils_1.getCurrentDatetime)();
        writeProjects(projects);
        console.log(`Clocked out from project: ${lastSession.project}`);
    }
    else {
        console.log('You are not currently clocked into any projects.');
    }
    rl.close();
}
function main() {
    const [_, __, command] = process.argv;
    switch (command) {
        case 'in':
            handleClockIn();
            break;
        case 'out':
            handleClockOut();
            break;
        default:
            console.log('Invalid command. Use "in" or "out".');
            process.exit(1);
    }
}
main();
