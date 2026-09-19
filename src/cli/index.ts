#!/usr/bin/env node

import { Command } from "commander";
import { createScanCommand } from "./commands/index.js";

const program = new Command();

program.name("tsxray").description("TypeScript code analysis").version("0.1.0");

// Add commands
program.addCommand(createScanCommand());

// Parse
program.parse(process.argv);
