/*eslint-env node */
"use strict";

var express = require("express");

var HOST = "localhost";
var PORT = 3000;

var app = express();
app.set("view engine", "jade");

app.get("/", (req, res) => {
	res.render("index", {
		title: "Hello World",
		content: "lorem ipsum dolor sit amet"
	});
});

var server = app.listen(PORT, HOST, () => {
	var addr = server.address();
	console.log("→ http://%s:%s", addr.address, addr.port);
});
