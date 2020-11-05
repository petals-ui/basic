const gulp = require("gulp");
const concat = require("gulp-concat");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const scssimport = require('gulp-shopify-sass');
const cssmin = require("gulp-cssmin");
const stripCssComments = require("gulp-strip-css-comments");
const sourcemaps = require("gulp-sourcemaps");
const execSync = require('child_process').execSync;

const { DIST_DIR, ENTRY_POINTS } = require('./helper');

const tasks = [];
const ALL_FILE_NAME = '_all.scss';

ENTRY_POINTS.forEach(name => {
  const taskName = `compile-scss-${name}`;

  tasks.push(taskName);

  gulp.task(taskName, () => {
    return gulp
      .src(`src/_${name}.scss`)
      .pipe(concat(`${name}.scss`))
      .pipe(sass({outputStyle: "expanded", noLineComments: true, keepSpecialComments: 0}).on("error", sass.logError))
      .pipe(stripCssComments({preserve: false}))
      .pipe(gulp.dest(DIST_DIR));
  });
});

gulp.task('concat-entry-points', () => {
  return gulp
    .src(ENTRY_POINTS.map(entry => `src/_${entry}.scss`))
    .pipe(concat(ALL_FILE_NAME))
    .pipe(scssimport())
    .pipe(
      rename((p) => {
        p.basename = p.basename.replace('.cat.scss', '');
        p.extname = '.scss';
      }),
    )
    .pipe(gulp.dest(DIST_DIR));
});

gulp.task('compile-scss-all', ['concat-entry-points'], () => {
  return gulp
    .src(`${DIST_DIR}/${ALL_FILE_NAME}`)
    .pipe(concat(ALL_FILE_NAME.replace('_', '')))
    .pipe(sass({outputStyle: "expanded", noLineComments: true, keepSpecialComments: 0}).on("error", sass.logError))
    .pipe(stripCssComments({preserve: false}))
    .pipe(gulp.dest(DIST_DIR));
});

tasks.push('compile-scss-all')

gulp.task('compress', tasks, () => {
  return gulp
    .src(`${DIST_DIR}/**/*.css`, {base: DIST_DIR})
    .pipe(sourcemaps.init({largeFile: true, loadMaps: true}))
    .pipe(cssmin())
    .pipe(rename({suffix: ".min"}))
    .pipe(sourcemaps.write(""))
    .pipe(gulp.dest(DIST_DIR));
});

gulp.task('compile', ['compress'], () => {
  [...ENTRY_POINTS, 'all'].forEach(entry => {
    execSync(`rm -rf ${DIST_DIR}/${entry}.css`);
  });
});

module.exports = {
  COMPILE_TASKS: ['compile'],
};
