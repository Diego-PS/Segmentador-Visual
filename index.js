const http = require('http');
const express = require('express');
const busboy = require('busboy');
const path = require('path');

var fs = require("fs");
var url = require("url");

const erroFuncaoPadrao = (err) => console.log("Erro encontrado: ", err);

function checagemErro (response) {
    if (fs.existsSync("./pdf.txt")) {
        const arquivo_pdf = fs.statSync("pdf.txt");
        if(arquivo_pdf.size == 0) {
            response.writeHead(302, {location: '/erro'});
        }
    } else {
        response.writeHead(302, {location: '/erro'});
    }
    if (fs.existsSync("./selections.js")) {
        const arquivo_selections = fs.statSync("selections.js");
        if(arquivo_selections.size == 0) {
            response.writeHead(302, {location: '/erro'});
        }
    } else {
        response.writeHead(302, {location: '/erro'});
    }
}

function copyPDF () {
    // Remove o arquivo na pasta uploads
    let file = fs.readdirSync('./uploads/')[0];
    if (fs.existsSync("./uploads/" + file)) {
        fs.unlinkSync('./uploads/' + file, erroFuncaoPadrao);
    }
    
    // Copia o arquivo diario.pdf para a pasta uploads
    fs.copyFile("./arquivos_originais/diario.pdf", "./uploads/diario.pdf", erroFuncaoPadrao);
}

function copySelections () {
    // Remove o arquivo pdf.txt
    if (fs.existsSync('./pdf.txt')) {
        fs.unlinkSync('./pdf.txt', erroFuncaoPadrao);
    }

    // Copia o arquivo pdf.txt original para o diretorio principal
    fs.copyFile("./arquivos_originais/pdf.txt", "./pdf.txt", erroFuncaoPadrao);
}

function copyTxtFile () {
    // Remove o arquivo selections.js
    if (fs.existsSync('./selextions.js')) {
        fs.unlinkSync('./selections.js', erroFuncaoPadrao);
    }

    // Copia o arquivo selections.js original para o diretorio principal
    fs.copyFile("./arquivos_originais/selections.js", "./selections.js", erroFuncaoPadrao);
}

const server = http.createServer(function (request, response) {

    var pathname = url.parse(request.url).pathname;
    //console.log("Request for " + pathname + " received.");

    response.writeHead(200);

    if(pathname == "/") {
        checagemErro(response);
        html = fs.readFileSync("index.html", "utf8");
        response.write(html);
    } else if (pathname == "/erro") {
        html = fs.readFileSync("erro.html", "utf8");
        response.write(html);
    } else if (pathname == "/reestabelecer") {
        copyPDF();
        copySelections();
        copyTxtFile();
        response.writeHead(302, {location: '/'});
    } else if (pathname == "/selections.js") {
        script = fs.readFileSync("selections.js", "utf8");
        response.write(script);
    } else if (pathname == "/arquivo.js") {
        script = fs.readFileSync("arquivo.js", "utf8");
        response.write(script);
    } else if (pathname.substring(0, 9) == "/uploads/") {
        pdf = fs.readFileSync('.' + pathname);
        response.write(pdf);
    } else if (pathname == "/style.css") {
        css = fs.readFileSync("style.css", "utf8");
        response.write(css);
    } else if (pathname === "/upload") {
        
        let file = fs.readdirSync('./uploads/')[0]
        fs.unlinkSync('./uploads/' + file);

        const bb = busboy({ headers: request.headers });
        bb.on('file', (name, file, info) => {
            filename = encodeURIComponent(info.filename);
            const saveTo = path.join(__dirname, '/uploads/' + filename);
            file.pipe(fs.createWriteStream(saveTo));
        });
        request.pipe(bb);
        //console.log('Upload completed!');

        response.writeHead(302, {location: '/changeselections'});
    } else if (pathname == '/changeselections') {

        //console.log('Cheguei no changeselections')
        let filename = fs.readdirSync('./uploads/')[0]
        //console.log('Filename: ' + filename);

        let searchString = 'var pdfComplexo = \'diario.pdf\';'
        try {
            searchString = fs.readFileSync('./pdf.txt', 'utf8');
        } catch (err) {
            console.error(err);
        }
        //console.log('Search string: ' + searchString);

        fs.readFile('selections.js', 'utf8', function(err, data) {

            let re = new RegExp('^.*' + searchString + '.*$', 'gm');

            const newLine = 'var pdfComplexo = \'' + filename + '\';';
            //console.log('New line: ' + newLine);

            let formatted = data.replace(re, newLine);
            
            fs.writeFile('selections.js', formatted, 'utf8', function(err) {
                if (err) return console.log(err);
            });
        });

        response.writeHead(302, {location: '/changepdf'});
    } else if (pathname == '/changepdf') {
        
        //console.log('Cheguei no changepdf')
        let filename = fs.readdirSync('./uploads/')[0]
        //console.log('Filename: ' + filename);

        const newLine = 'var pdfComplexo = \'' + filename + '\';';
        //console.log('New line: ' + newLine);

        fs.writeFile('./pdf.txt', newLine, 'utf8', err => {
            if (err) {
                console.log(err);
            }
        });

        response.writeHead(302, {location: '/uploaded'});
    } else if (pathname == '/uploaded') {
        html = fs.readFileSync("uploaded.html", "utf8");
        response.write(html);
    }

    response.end();
})

server.listen(8888, () => {
    console.log('Server listening on http://localhost:8888 ...');
});