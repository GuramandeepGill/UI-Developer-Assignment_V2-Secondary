const { watch } = require('gulp');
var browserSync = require('browser-sync').create();

exports.default = function() {
	console.log('Running Site ...');
	require('./server.js');
	// All events will be watched
  	watch('./site/', { events: 'all' }, function(cb) {
    cb();
  });
}