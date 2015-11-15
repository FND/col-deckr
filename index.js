/*eslint-env node */
"use strict";

var path = require("path");
var express = require("express");
var Store = require("./lib/store");

var HOST = "localhost";
var PORT = 3000;
var STORE = path.resolve(__dirname, "store");

var app = express();
app.set("view engine", "jade");
app.use("/assets", express.static(STORE));
app.get("/", frontpage);
var store = new Store(STORE);

store.populate().
	then(spawnServer).
	catch(err => {
		var msg = err.code !== "ENOENT" ? err :
				`no such file or directory: ${err.path}`;
		console.error("[ERROR]", msg);
	});

function frontpage(req, res) {
	var filters = req.query;
	// ensure filters are always arrays
	filters = ["faction", "category"].reduce((memo, filter) => {
		var value = filters[filter];
		if(value !== undefined) {
			memo[filter] = value.pop ? value : [value];
		}
		return memo;
	}, {});

	store.cards(filters.faction, filters.category).
		then(cards => {
			cards = cards.map(path => "/assets" + path); // XXX: Unix only
			res.render("index", { store, cards, filters });
		});
}

function spawnServer() {
	var server = app.listen(PORT, HOST, () => {
		var addr = server.address();
		console.log("→ http://%s:%s", addr.address, addr.port);
	});
}
