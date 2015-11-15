/*eslint-env node */
"use strict";

var path = require("path");
var util = require("./util");

module.exports = class Store {
	constructor(root) {
		this.root = root;
		this.factions = [];
		this.categories = []; // TODO: rename? ("factions" is also a category)
	}

	populate() {
		return util.listDir(this.root).
			then(dirs => {
				this.factions = dirs.sort();

				var categoriesByFaction = dirs.map(faction => util.
					listDir(path.resolve(this.root, faction)).
					then(categories => ({ faction, categories })));
				return Promise.all(categoriesByFaction);
			}).
			then(categoriesByFaction => {
				var categories = categoriesByFaction.reduce((memo, entry) => {
					entry.categories.forEach(category => memo.add(category));
					return memo;
				}, new Set());
				this.categories = Array.from(categories).sort();
			});
	}
};
