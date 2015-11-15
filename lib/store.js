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

	cards(factions, categories) { // TODO: use LRU cache
		factions = factions || this.factions;
		categories = categories || this.categories;
		var paths = factions.reduce((memo, faction) => {
			var dirs = categories.
				map(category => path.join(this.root, faction, category));
			return memo.concat(dirs);
		}, []);

		var prefixLength = this.root.length;
		var cards = paths.map(dir => util.listDir(dir).
			then(entries => entries.
				map(entry => path.join(dir, entry).substr(prefixLength))).
			catch(err => [])); // faction has no such category
		return Promise.all(cards).
			then(entries => entries.reduce((memo, items) => memo.concat(items)));
	}

	populate() {
		return util.listDir(this.root, true).
			then(dirs => {
				this.factions = dirs.sort();

				var categoriesByFaction = dirs.map(faction => util.
					listDir(path.resolve(this.root, faction), true).
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
