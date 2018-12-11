const Log = require('log');
const fs = require('fs');
const json = require('jsonfile');
const moment = require('moment');
const path = require('path');
const reqlive = require('require-from-url/sync');
const {stripIndents} = require('common-tags');

const isoformat = 'YYYY-MM-DD[T]HH:mm:ssZ';
const log = new Log('debug', fs.createWriteStream(path.join(__dirname, 'run.log')));
const { lastsha } = json.readFileSync(path.join(__dirname, 'data.json'));

let lastfetch = moment().subtract(3, 'days').format(isoformat);

const run = async function () {
    try {
        const commits = await snek.get('https://api.github.com/repos/Zarel/Pokemon-Showdown/commits')
                .query('path', 'data/formats-data.js')
                .query('since', lastfetch),
            data = {
                sha: commits.body.length ? commits.body[0].sha : null,
                length: commits.body.length
            };

        if (data.sha === lastsha || data.length === 0) {
            lastfetch = moment().format(isoformat);

            return log.notice('Fetched data but no new commit was available');
        }

        const formats = reqlive('https://raw.githubusercontent.com/Zarel/Pokemon-Showdown/master/data/formats-data.js').BattleFormatsData;
        const file = [];
        json.writeFileSync(path.join(__dirname, 'data.json'), {lastsha: data.sha});
        lastfetch = moment().format(isoformat);

        for (const poke in formats) {
            file.push({
                name: poke,
                tier: formats[poke].tier
            });
        }

        json.writeFileSync(path.join(__dirname, '../ribbon/src/data/dex/formats.json'), file);

        return log.info(stripIndents`
    Successfully wrote updated formats data to file
    **Latest SHA:** ${data.sha}
    **Last Fetch:** ${lastfetch}
    **Date:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss')}
    ===================================
    `);
    } catch (err) {
        return console.error(err);
    }
};

run();