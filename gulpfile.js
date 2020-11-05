const gulp = require("gulp");

const { COMPILE_TASKS, EXTRACT_TASKS } = require('./build/tasks');

gulp.task("default", [...EXTRACT_TASKS, ...COMPILE_TASKS]);
