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
    } else if (pathname.substring(0, 9) == "/uploads/") {
        pdf = fs.readFileSync('.' + pathname);
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
        request.pipe(bb);
        response.writeHead(302, {location: '/'});
    }

    response.end();
})

server.listen(8888, () => {
    console.log('Server listening on http://localhost:8888 ...');
});