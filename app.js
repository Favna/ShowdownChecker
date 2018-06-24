const fs = require('fs'),
  moment = require('moment'),
  path = require('path'),
  snek = require('snekfetch');
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

    const file = await snek.get('https://raw.githubusercontent.com/Zarel/Pokemon-Showdown/master/data/formats-data.js');
    lastsha = data.sha;
    lastfetch = moment().format(isoformat);

    return fs.writeFileSync(path.join(__dirname, 'dist/formats-data.js'), file.body);
  } catch (err) {
    return console.error(err);
  }
};

setInterval(() => {
  run();
}, 72000000);