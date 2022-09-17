#!/usr/bin/env node

import { Command, Option } from "commander";

import { TaskType, taskTypes } from "./constants.js";
import clockIn from "./actions/clockIn.js";

const program = new Command();

program
  .command("clock in")
  .alias("in")
  .description("Clock in to time-tracker")
  .action(clockIn);

program.parse(process.argv);
