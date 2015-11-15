/*eslint-env node */
"use strict";

var fs = require("fs");
var path = require("path");
var denodeify = require("denodeify");

var readdir = denodeify(fs.readdir);
var stat = denodeify(fs.stat);

exports.listDir = (dirPath) => readdir(dirPath).
	then(entries => {
		var dirs = entries.map(name => stat(path.resolve(dirPath, name)).
			then(stats => stats.isDirectory() && name));
		return Promise.all(dirs).
			then(dirs => dirs.filter(dir => dir));
	});
