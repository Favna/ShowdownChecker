const json = require('jsonfile'),
  moment = require('moment'),
  path = require('path'),
  reqlive = require('require-from-url/sync'),
  snek = require('snekfetch'),
  {stripIndents} = require('common-tags');
const isoformat = 'YYYY-MM-DD[T]HH:mm:ssZ';

let lastfetch = moment().subtract(3, 'days').format(isoformat),
  lastsha = 'a909b23d0d6122ca6f56470d01ee8894abc9c009';

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

      return null;
    }

    const formats = reqlive('https://raw.githubusercontent.com/Zarel/Pokemon-Showdown/master/data/formats-data.js').BattleFormatsData;
    const file = [];
    lastsha = data.sha;
    lastfetch = moment().format(isoformat);

    for (const poke in formats) {
      file.push({
        name: poke,
        tier: formats[poke].tier
      });
    }

    json.writeFileSync(path.join(__dirname, '../ribbon/src/data/dex/formats.json'), file);

    return console.log(stripIndents`
    Successfully wrote updated formats data to file
    **Latest SHA:** ${lastsha}
    **Last Fetch:** ${lastfetch}
    **Date:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss')}
    ===================================
    `);
  } catch (err) {
    return console.error(err);
  }
};

setInterval(() => {
  run();
}, 72000000);