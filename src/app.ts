import moment from 'moment';
import path from 'path';
import { createLogger, format, transports } from 'winston';
import { check } from '.';

const { printf } = format;

const logger = createLogger({
    format: printf(info => `[${moment().format('DD-MM-YYYY HH:mm:ssZ')}] [${info.level}]: ${info.message}`),
    transports: [
        new transports.File({ filename: 'check.log' }),
        new transports.Console()
    ],
});

check(path.join(__dirname, process.argv[2] === 'test' ? 'formats.json' : '../../ribbon/src/data/dex/formats.json'))
    .catch(err => logger.error(err))
    .finally(() => logger.info(`showdown checker has ran`));