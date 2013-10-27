module.exports = require('./libs/pictor');

module.exports.__defineGetter__('routes', function () {
  return require('./routes');
});
module.exports.__defineGetter__('config', function () {
  return require('./config');
});
module.exports.__defineGetter__('app', function () {
  return require('./app');
});
