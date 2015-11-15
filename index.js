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
var store = new Store(STORE);

store.populate().
	then(spawnServer).
	catch(err => {
		var msg = err.code !== "ENOENT" ? err :
				`no such file or directory: ${err.path}`;
		console.error("[ERROR]", msg);
	});

app.get("/", (req, res) => {
	res.render("index", { store });
});

function spawnServer() {
	var server = app.listen(PORT, HOST, () => {
		var addr = server.address();
		console.log("→ http://%s:%s", addr.address, addr.port);
	});
}
