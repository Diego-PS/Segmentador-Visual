const express = require('express')
const app = express()

// app.get('/', function(req, res){
//     res.sendFile(__dirname + '/views/index.html')
// })

// app.listen(4000, function(erro) {
//     if (erro) {
//        console.log('Ocorreu um erro!') 
//     } else {
//         console.log('Servidor iniciado com sucesso!')
//     }
// })

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
    } else if (pathname == "/teste.js") {
        script = fs.readFileSync("teste.js", "utf8");
        response.write(script);
    } else if (pathname == "/diario.pdf") {
        // pdf = fs.readFileSync("diario.pdf", "utf8");
        // response.download(pdf);
    }


    response.end();
}).listen(8888);

app.get('/diario.pdf', (req, res) => {
    pdf = fs.readFileSync("diario.pdf", "utf8");
    res.download(pdf);
})

console.log("Listening to server on 8888...");