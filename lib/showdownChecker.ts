import { constants, Timestamp } from '@klasa/timestamp';
import { readJSON, writeJSONAtomic } from 'fs-nextra';
import fetch from 'node-fetch';
import { join } from 'path';
import { DataJSON, Formats, needFile } from './utils';

export async function check(outFiles: string[]) {
  const CONFIG_PATH = join(__dirname, '../', 'config');
  const DATA_FILE = join(CONFIG_PATH, 'smogonTiersData.json');

  const UPDATED_FORMATS_DATA = readJSON(DATA_FILE) as Promise<DataJSON>;
  const TEN_DAYS_AGO = Date.now() - 10 * constants.DAY;
  const TIMESTAMP = new Timestamp('YYYY-MM-DD[T]HH:mm:ssZ').display(TEN_DAYS_AGO);

  const url = new URL('https://api.github.com/repos/smogon/pokemon-showdown/commits');
  url.searchParams.append('path', 'data/formats-data.js');
  url.searchParams.append('since', TIMESTAMP);

  const request = await fetch(url);

  const [commits, { lastSha }] = await Promise.all([request.json(), UPDATED_FORMATS_DATA]);

  const data = { sha: commits.length ? commits[0].sha : null, length: commits.length };
  const output: Formats = {};
  if (!data) {
    console.log('no data from request');

    return process.exit(1);
  }

  if (data.sha === lastSha) {
    console.log('Fetched data but no new commit was available');

    return process.exit(0);
  }

  const { BattleFormatsData } = await needFile('https://raw.githubusercontent.com/smogon/pokemon-showdown/master/data/formats-data.js');

  for (const mon in BattleFormatsData) {
    const tier = BattleFormatsData[mon].isNonstandard || BattleFormatsData[mon].tier;
    output[mon] = tier;
  }

  const writePromises: Promise<void>[] = [];

  if (data.sha) writePromises.push(writeJSONAtomic(DATA_FILE, { lastSha: data.sha }));
  if (output && Object.entries(output).length) {
    for (const FORMATS_FILE of outFiles) {
      writePromises.push(writeJSONAtomic(FORMATS_FILE, output));
    }
  }

  await Promise.all(writePromises);

  console.log(`Successfully wrote updated formats data to file; Latest SHA ${data.sha}`);

  return process.exit(0);
}
