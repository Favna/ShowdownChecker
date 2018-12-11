import { oneLine } from 'common-tags';
import { readFileSync, writeFileSync } from 'jsonfile';
import moment from 'moment';
import fetch from 'node-fetch';
import path from 'path';
import { createLogger, format, transports } from 'winston';
import { IFormats, need, stringify } from '.';

const { lastsha } = readFileSync(path.join(__dirname, 'data.json'));
const { printf } = format;

const logger = createLogger({
    format: printf(info => `[${moment().format('DD-MM-YYYY HH:mm:ssZ')}] [${info.level}]: ${info.message}`),
    transports: [
        new transports.File({ filename: 'program.log' }),
        new transports.Console()
    ],
});

export const check = async (outpath: string) => {
    try {
        const request = await fetch(`https://api.github.com/repos/Zarel/Pokemon-Showdown/commits?${stringify({
            path: 'data/formats-data.js',
            since: moment().subtract(3, 'days').format('YYYY-MM-DD[T]HH:mm:ssZ'),
        })}`);
        const commits = await request.json();
        const data = { sha: commits.length ? commits[0].sha : null, length: commits.length };
        const output: IFormats = {};

        if (!data.length) throw new Error('no_data');
        if (data.sha === lastsha) throw new Error('same_hash');
        const { BattleFormatsData } = await need('https://raw.githubusercontent.com/Zarel/Pokemon-Showdown/master/data/formats-data.js');

        for (const mon in BattleFormatsData) output[mon] = BattleFormatsData[mon].tier;

        writeFileSync(path.join(__dirname, 'data.json'), { lastsha: data.sha });
        writeFileSync(outpath, output);

        return logger.info(oneLine`
            Successfully wrote updated formats data to file;
            Latest SHA ${data.sha}
        `);
    } catch (err) {
        if (/(?:no_data)/i.test(err.toString())) return logger.error('No data was found');
        if (/(?:same_hash)/i.test(err.toString())) return logger.info(`Fetched data but no new commit was available`);

        return logger.error(err);
    }
};