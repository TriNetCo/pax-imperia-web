const path = require('path');
module.exports = {
  paths: function (paths, env) {
    // Changing public to something else
    paths.appPublic = path.resolve(__dirname, '../pax-imperia-js');
    paths.appHtml = path.resolve(__dirname, 'public/index.html');
    return paths;
  }
};
