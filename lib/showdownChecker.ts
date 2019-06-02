import { stringify } from '@favware/querystring';
import { readFileSync, writeFileSync } from 'jsonfile';
import moment from 'moment';
import fetch from 'node-fetch';
import path from 'path';
import { createLogger, format, transports } from 'winston';

const configPath = path.join(__dirname, '../', 'config');
const { lastsha } = readFileSync(`${configPath}/data.json`);
const { printf } = format;

interface IEntry {
    tier: string;
}

interface IFormats {
    [propName: string]: IEntry;
}

interface IModule extends Function {
    _nodeModulePaths: any;

    new (url: string, parents: NodeModule | null): any;
}

const need = async (url: string) => {
    const nodeModule: IModule = module.constructor as IModule;
    const request = await fetch(url);
    const body: string = await request.text();
    const m = new nodeModule(url, module.parent);
    m.fileName = url;
    m.paths = nodeModule._nodeModulePaths(path.dirname(url));
    m._compile(body, url);
    return m.exports;
};

const logger = createLogger({
    format: printf(info => `[${moment().format('DD-MM-YYYY HH:mm:ssZ')}] [${info.level}]: ${info.message}`),
    transports: [
        new transports.File({ filename: `${configPath}/program.log` }),
        new transports.Console()
    ],
});

export const check = async (outFiles: string[]) => {
    try {
        logger.info(moment().subtract(3, 'days').format('YYYY-MM-DD[T]HH:mm:ssZ'));
        const request = await fetch(`https://api.github.com/repos/Zarel/Pokemon-Showdown/commits?${stringify({
            path: 'data/formats-data.js',
            since: moment().subtract(10, 'days').format('YYYY-MM-DD[T]HH:mm:ssZ'),
        })}`);
        const commits = await request.json();
        const data = { sha: commits.length ? commits[0].sha : null, length: commits.length };
        const output: IFormats = {};

        if (!data.length) throw new Error('no_data');
        if (data.sha === lastsha) throw new Error('same_hash');
        const { BattleFormatsData } = await need('https://raw.githubusercontent.com/Zarel/Pokemon-Showdown/master/data/formats-data.js');

        for (const mon in BattleFormatsData) output[mon] = BattleFormatsData[mon].tier;

        writeFileSync(`${configPath}/data.json`, { lastSha: data.sha });
        outFiles.forEach((file: string) => writeFileSync(file, output));

        return logger.info(`Successfully wrote updated formats data to file; Latest SHA ${data.sha}`);
    } catch (err) {
        if (/(?:no_data)/i.test(err.toString())) return logger.error('No data was found');
        if (/(?:same_hash)/i.test(err.toString())) return logger.info(`Fetched data but no new commit was available`);

        return logger.error(err);
    }
};