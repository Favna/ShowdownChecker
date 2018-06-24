const moment = require('moment'),
  snek = require('snekfetch');

class ShowdownChecker {
  constructor () {
    this.lastfetch = moment().subtract(2, 'days').format('YYYY-MM-DD[T]HH:mm:ssZ'); // eslint-disable-line newline-per-chained-call
    this.lastsha = '';
  }

  async run () {
    try {
      const commits = await snek.get('https://api.github.com/repos/Zarel/Pokemon-Showdown/commits')
        .query('path', 'data/formats-data.js')
        .query('since', this.lastfetch);

      return console.log(commits.body);
    } catch (err) {
      return console.error(err);
    }
  }
}
module.exports = ShowdownChecker;