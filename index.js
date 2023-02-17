const express = require('express')
const app = express()

var fs = require("fs");
var http = require("http");
var url = require("url");

http.createServer(function (request, response) {

    var pathname = url.parse(request.url).pathname;
    console.log("Request for " + pathname + " received.");

    response.writeHead(200);

    if(pathname == "/") {
        html = fs.readFileSync("index.html", "utf8");
        response.write(html);
    } else if (pathname == "/selections.js") {
        script = fs.readFileSync("selections.js", "utf8");
        response.write(script);
    } else if (pathname == "/diario.pdf") {
        pdf = fs.readFileSync("diario.pdf");
        response.write(pdf);
    } else if (pathname == "/style.css") {
        css = fs.readFileSync("style.css", "utf8");
        response.write(css);
    }

    response.end();
}).listen(8888);

console.log("Listening to server on 8888...");