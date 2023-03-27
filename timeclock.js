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
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
dayjs_1.default.extend(utc_1.default);
const utils_1 = require("./utils");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
const projectsFilePath = path_1.default.join(__dirname, '/data/projects.json');
const sessionsFilePath = path_1.default.join(__dirname, '/data/sessions.json');
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
function sanitizeInput(str) {
    return str.trim().toLowerCase();
}
function promptUseExistingProject() {
    return new Promise((res) => {
        rl.question('Use existing project? (y/n): ', (ans) => {
            if (sanitizeInput(ans) === 'y') {
                res(true);
            }
            else {
                res(false);
            }
        });
    });
}
function whichProjectPrompt({ attempts = 0, projects, }) {
    return new Promise((res, rej) => {
        if (attempts === 3) {
            console.log('Too many incorrect attempts');
            rl.close();
        }
        else {
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
                }
                else {
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
function createNewSession({ projectID, lastSessionID, }) {
    return new Promise((res) => {
        rl.question('Session description? (optional, press enter to skip): ', (description) => {
            res({
                description,
                id: lastSessionID + 1,
                in: (0, utils_1.getCurrentDatetime)(),
                out: null,
                projectID,
            });
        });
    });
}
function createNewProject({ attempts = 0, projects, }) {
    return new Promise((res) => {
        const projectNames = projects.map((p) => p.name.trim().toLowerCase());
        if (attempts === 3) {
            console.log('Too many incorrect attempts. Closing');
            rl.close();
        }
        else {
            rl.question('New project name?: ', (name) => {
                if (projectNames.includes(sanitizeInput(name))) {
                    console.log('Project already exists');
                    createNewProject({ attempts: attempts + 1, projects });
                }
                else {
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
function getClockOutDatetime({ sessionDescription = 'UNKNOWN', projectName = 'UNKNOWN PROJECT', }) {
    return new Promise((res) => {
        rl.question(`Clocked in on "${projectName || 'unnamed project'}" working on "${sessionDescription || 'unknown'}". Clock out using current datetime? (y/n): `, (resp) => {
            if (sanitizeInput(resp) === 'y') {
                res((0, utils_1.getCurrentDatetime)());
            }
            else {
                rl.question(`Provide clockout datetime in local time: (YYYY/MM/DD HH:mm:ss): `, (datetime) => {
                    if ((0, dayjs_1.default)(datetime).isValid()) {
                        const userDate = new Date(datetime);
                        // Get user's timezone offset in minutes
                        const userOffset = userDate.getTimezoneOffset();
                        // Adjust user-provided date to UTC
                        const utcDate = new Date(userDate.getTime() + userOffset * 60 * 1000);
                        res(utcDate.toISOString());
                    }
                    else {
                        console.log('Invalid datetime. Closing');
                        rl.close();
                    }
                });
            }
        });
    });
}
function handleClockIn() {
    return __awaiter(this, void 0, void 0, function* () {
        const projects = readProjects();
        const sessions = readSessions();
        try {
            // if no prior history
            if (!sessions.length && !projects.length) {
                const newProject = yield createNewProject({ projects });
                const newSession = yield createNewSession({
                    projectID: newProject.id,
                    lastSessionID: 0,
                });
                projects.push(newProject);
                sessions.push(newSession);
                writeProjects(projects);
                writeSessions(sessions);
                rl.close();
            }
            else {
                const lastSession = sessions[sessions.length - 1];
                const lastProject = projects.find((p) => p.id === lastSession.projectID);
                // if user forgot to clock out last time
                if (lastSession && lastSession.in !== null && !lastSession.out) {
                    console.log('Currently clocked in.');
                    const newClockOutDatetime = yield getClockOutDatetime({
                        projectName: lastProject === null || lastProject === void 0 ? void 0 : lastProject.name,
                        sessionDescription: lastSession.description || '',
                    });
                    lastSession.out = newClockOutDatetime;
                    writeSessions(sessions);
                    console.log('Clocked out successfully.');
                    handleClockIn();
                }
                // handle actual clock in
                const useExistingProject = yield promptUseExistingProject();
                if (useExistingProject) {
                    const project = yield whichProjectPrompt({ projects });
                    const newSession = yield createNewSession({
                        projectID: project.id,
                        lastSessionID: lastSession.id,
                    });
                    sessions.push(newSession);
                    writeSessions(sessions);
                }
                else {
                    const newProject = yield createNewProject({ projects });
                    const newSession = yield createNewSession({
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
        }
        catch (err) {
            console.log(err);
            console.log(new Error('handleClockIn Catch Error'));
            rl.close();
        }
    });
}
function handleClockOut() {
    return __awaiter(this, void 0, void 0, function* () {
        const projects = readProjects();
        const sessions = readSessions();
        const currSession = sessions[sessions.length - 1];
        const currProject = projects.find((p) => p.id === currSession.projectID);
        if (currSession.out) {
            console.log('Not clocked in');
            rl.close();
        }
        else {
            const clockOutDatetime = yield getClockOutDatetime({
                projectName: currProject === null || currProject === void 0 ? void 0 : currProject.name,
                sessionDescription: (currSession === null || currSession === void 0 ? void 0 : currSession.description) || '',
            });
            currSession.out = clockOutDatetime;
            writeSessions(sessions);
            rl.close();
            console.log('Clocked out successfully');
        }
    });
}
function handleStatus() {
    const projects = readProjects();
    const sessions = readSessions();
    const currSession = sessions.length && sessions[sessions.length - 1];
    if (currSession && !currSession.out) {
        const project = projects.find((p) => p.id === currSession.projectID);
        console.log(`Clocked in to ${project === null || project === void 0 ? void 0 : project.name} working on ${currSession.description}`);
    }
    else {
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
