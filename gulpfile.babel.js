import gulp from 'gulp';
import ts from 'typescript';
import del from 'del';
import uglify from 'gulp-uglify-es';
import * as gulpTs from 'gulp-typescript';
import * as tslint from 'tslint';
import { argv } from 'yargs';
import { milkyLint, milkyReport } from 'milky-tslint';

const minifySource = ['./dist/*.js'];
const tsSource = ['./lib/*.ts'];

const minify = () => {
    return gulp.src(minifySource)
        .pipe(uglify())
        .pipe(gulp.dest('./dist'));
};

const compile = () => {
    const tsProject = gulpTs.createProject('./tsconfig.json');

    return tsProject.src()
        .pipe(tsProject())
        .pipe(gulp.dest('./dist'));
};

gulp.task('lint', () => {
    const lintProgram = tslint.Linter.createProgram('./tsconfig.json', '.');
    ts.getPreEmitDiagnostics(lintProgram);

    return gulp.src(tsSource)
        .pipe(milkyLint({
            configuration: './tslint.json',
            program: lintProgram,
            tslint: tslint,
            fix: !!argv.fix,
        }))
        .pipe(milkyReport());
});

gulp.task('clean', () => del(['./dist']));
gulp.task('watch', () => gulp.watch(tsSource, gulp.series('lint', 'build')));
gulp.task('build', gulp.series('clean', compile, minify));
gulp.task('default', gulp.parallel('watch', 'lint', 'build'));