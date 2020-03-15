import { join } from 'path';
import { check } from './showdownChecker';

const CONFIG_PATH = join(__dirname, '../', 'config');

export const run = (outputPath: string | string[]) => {
  if (!Array.isArray(outputPath)) outputPath = [outputPath];

  check(outputPath);
};

run(join(CONFIG_PATH, 'out.json'));

export default run;
