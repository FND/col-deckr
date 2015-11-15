/*eslint-env node */
"use strict";

var path = require("path");
var express = require("express");
var Store = require("./lib/store");

var HOST = "localhost";
var PORT = 3000;
var STORE = path.resolve(__dirname, "store");

var app = express();
var store = new Store(STORE);

app.set("view engine", "jade");
app.use("/assets", express.static(STORE));

var ROUTES = {
	frontpage: "/"
};
app.get(ROUTES.frontpage, frontpage);

store.populate().
	then(spawnServer).
	catch(err => {
		var msg = err.code !== "ENOENT" ? err :
				`no such file or directory: ${err.path}`;
		console.error("[ERROR]", msg);
	});

function frontpage(req, res) {
	// pagination
	var offset = 0;
	var count = 6;
	var page = req.query.page;
	if(page) {
		page = page.split(":");
		offset = parseInt(page[0], 10) || offset;
		count = parseInt(page[2], 10) || count;
	}
	var prev = offset ? Math.max(0, offset - count) : null;
	var next = offset + count;
	// ensure filters are always arrays
	var filters = ["faction", "category"].reduce((memo, filter) => {
		var value = req.query[filter];
		if(value !== undefined) {
			memo[filter] = value.pop ? value : [value];
		}
		return memo;
	}, {});

	store.cards(filters.faction, filters.category).
		then(cards => {
			var total = cards.length;
			cards = cards.slice(offset, offset + count).
				map(path => "/assets" + path); // XXX: Unix only

			var params = Object.assign({}, filters);
			prev = prev !== null && generateURI("frontpage",
					Object.assign(params, { page: `${prev}:${count}` }));
			next = next < total && generateURI("frontpage",
					Object.assign(params, { page: `${next}:${count}` }));

			res.render("index", { store, cards, filters, prev, next });
		});
}

function generateURI(route, params) { // TODO: use proper library
	var uri = ROUTES[route];
	if(params) {
		var queryString = Object.keys(params).
			map(param => [param, params[param]].map(encodeURIComponent).join("="));
		uri = `${uri}?${queryString}`;
	}
	return uri;
}

function spawnServer() {
	var server = app.listen(PORT, HOST, () => {
		var addr = server.address();
		console.log("→ http://%s:%s", addr.address, addr.port);
	});
}
