import moment from 'moment';
import path from 'path';
import { createLogger, format, transports } from 'winston';
import { check } from './showdownChecker';

const configPath = path.join(__dirname, '../', 'config');
const { printf } = format;

const logger = createLogger({
    format: printf(info => `[${moment().format('DD-MM-YYYY HH:mm:ssZ')}] [${info.level}]: ${info.message}`),
    transports: [
        new transports.File({ filename: `${configPath}/check.log` }),
        new transports.Console()
    ],
});

check(`${process.env.home}/dev/ribbon/dist/data/dex/formats.json`)
    .catch((err: any) => logger.error(err))
    .finally(() => logger.info(`showdown checker has ran`));