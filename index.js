const http = require('http');
const express = require('express');
const busboy = require('busboy');
const path = require('path');

var fs = require("fs");
var url = require("url");

const server = http.createServer(function (request, response) {

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
    } else if (pathname == "/file") {
        html = fs.readFileSync("lerArquivos.html", "utf8");
        response.write(html);
    } else if (request.url === "/upload") {
        let filename = '';
        const bb = busboy({ headers: request.headers });
        bb.on('file', (name, file, info) => {
            filename = info.filename;
            const saveTo = path.join(__dirname, '/uploads/' + filename);
            file.pipe(fs.createWriteStream(saveTo));
        });
        bb.on('close', () => {
            response.writeHead(200, { 'Content-Type': 'text/plain' });
            response.write(`upload success: ${filename}`);
        });
        request.pipe(bb);
    }

    response.end();
})

server.listen(8888, () => {
    console.log('Server listening on http://localhost:8888 ...');
});