/*eslint-env node */
"use strict";

var util = require("./util");

module.exports = class Store {
	constructor(root) {
		this.root = root;
		this.factions = [];
	}

	populate() {
		return util.listDir(this.root).
			then(dirs => {
				this.factions = dirs;
			});
	}
};
