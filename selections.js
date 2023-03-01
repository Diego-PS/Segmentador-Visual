/*
 * Garante que endpos e startpos tenham as coordenadas esq sup e direita inf.
 */
function fixPositions() {
  if (startpos[0] > endpos[0]) {
    var aux = startpos[0];
    startpos[0] = endpos[0];
    endpos[0] = aux;
  }
  if (startpos[1] > endpos[1]) {
    var aux = startpos[1];
    startpos[1] = endpos[1];
    endpos[1] = aux;
  }
}


/*
 * Checa se o ponto se encontra dentro do retângulo definido pelas coordenadas
 * dadas dada uma tolerância.
 *
 * @param {[Number, Number, Number, Number]} coordinates Coordenadas [esqSupX, esqSupY, largura, altura] que o ponto deve estar dentro.
 * @param {Number} pointX Coordenada X do ponto checado.
 * @param {Number} pointY Coordenada Y do ponto checado.
 * @param {Number} tolerance Tolerância para o ponto ser considerado como dentro do retângulo.
 *
 * @returns {Boolean} Ponto está dentro do retângulo.
 */
function pointInside(coordinates, pointX, pointY, tolerance = 0) {
  var insideX =
    coordinates[0] - tolerance < pointX &&
    coordinates[0] + coordinates[2] + tolerance > pointX;
  var insideY =
    coordinates[1] - tolerance < pointY &&
    coordinates[1] + coordinates[3] + tolerance > pointY;
  return insideX && insideY;
}

/*
 * Desenha as coordenadas com a cor fornecidas por color.
 *
 * @param {HTMLCanvasContext} drawContext contexto em que se deseja desenhar.
 * @param {[Number, Number, Number, Number]} coordinates Coordenadas [esqSupX, esqSupY, largura, altura] que o ponto deve estar dentro.
 * @param {String} color Cor HEX que se deseja usar para desenhar.
 */
function drawCoordinates(drawContext, coordinates, color = "#000") {
  drawContext.strokeStyle = color;
  drawContext.strokeRect(
    coordinates[0],
    coordinates[1],
    coordinates[2],
    coordinates[3]
  );
}

//Objeto de seleção.
var selections = {
  include: [],
  exclude: [],
};

//Definição dos canvas e contextos para desenho.
var doc = document.getElementById("diario");
var pdfCanvas = document.getElementById("pdfCanvas");
var pdfContext = pdfCanvas.getContext("2d");
var drawingCanvas = document.getElementById("drawingCanvas");
var drawingContext = drawingCanvas.getContext("2d");

var pdfcontent = [];

//Definição do PDF que será aberto.
var pdfComplexo = '11beadb2-a568-4f41-b561-1c2f974961da.pdf';

var arquivoLocal = "./uploads/" + pdfComplexo;

let loadingTask = pdfjsLib.getDocument(arquivoLocal);

//Lidando com o carregamento do pdf e definindo estados iniciais da aplicação.
var docLoaded = null;
var curPage = 1;
loadingTask.promise.then((docloaded) => {
  docLoaded = docloaded;
  renderContent(curPage);
});

/*
 * Carrega próxima pagina do pdf no canvas.
 */
function nextPage() {
  if (curPage < docLoaded.numPages) {
    curPage = curPage + 1;
    renderContent(curPage);
  }
}

/*
 * Carrega página anterior do pdf no canvas.
 */
function previousPage() {
  if (curPage > 1) {
    curPage = curPage - 1;
    renderContent(curPage);
  }
}

/*
 * Mostra resultados das seleções no console.
 */
function printResult() {
  console.log(selections);
}

/*
 * Carrega o conteúdo que está na página especificada do pdf no canvas.
 *
 * @param {Number} curPage número da página a ser renderizada.
 */
function renderContent(curPage) {
  docLoaded.getPage(curPage).then((page) => {
    var viewport = page.getViewport({ scale: 1 });
    var viewWidth = viewport.width;
    var viewHeight = viewport.height;
    page.getTextContent().then((cont) => {
      pdfcontent = cont.items.map((item) => {
        return {
          str: item.str,
          coord: [item.transform[4], viewHeight - item.transform[5]],
        };
      });
    });

    pdfCanvas.width = viewWidth;
    pdfCanvas.height = viewHeight;
    drawingCanvas.width = viewWidth;
    drawingCanvas.height = viewHeight;

    doc.style.width = `${viewWidth + 10}px`;

    page.render({
      canvasContext: pdfContext,
      viewport: viewport,
    });

    redraw(curPage);
  });
}

//Define estado inicial de variáveis relacionadas ao desenho.
var drawing = false;
var startpos = [0, 0];

/*
 * Carrega o conteúdo que está na página especificada do pdf no canvas.
 *
 * @returns {('include'|'exclude'|'unselect')} Tipo de seleção atual.
 */
function getSelectType() {
  var typeInput = document.querySelector(".type_selection:checked");
  return typeInput.id;
}

/*
 * Redesenha todos os retângulos da página passada como parâmetro no canva.
 *
 * @param {Number} curPage número da página que se deseja desenhar.
 */
function redraw(curPage) {
  drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
  selections.include.forEach((incSelected) => {
    if (incSelected.page == curPage) {
      drawCoordinates(drawingContext, incSelected.coordinates, "#000000");
    }
  });
  selections.exclude.forEach((excSelected) => {
    if (excSelected.page == curPage) {
      drawCoordinates(drawingContext, excSelected.coordinates, "#FF0000");
    }
  });
}

//Cria o evento que começa a desenhar ou desseleciona ao pressionar o botão do mouse
drawingCanvas.addEventListener("mousedown", (e) => {
  Xclick = e.clientX - doc.offsetLeft;
  Yclick = e.clientY - doc.offsetTop;
  Xpos = Xclick + window.pageXOffset + doc.scrollLeft;
  Ypos = Yclick + window.pageYOffset + doc.scrollTop;

  selectType = getSelectType();
  if (selectType == "unselect") {
    selections.include = selections.include.filter((incSelected) => {
      if (incSelected.page != curPage) {
        return true;
      }
      return !pointInside(incSelected.coordinates, Xpos, Ypos, 5);
    });
    selections.exclude = selections.exclude.filter((excSelected) => {
      if (excSelected.page != curPage) {
        return true;
      }
      return !pointInside(excSelected.coordinates, Xpos, Ypos, 5);
    });
    redraw(curPage);
    return;
  }
  drawing = true;
  startpos = [Xpos, Ypos];
});

//Cria o evento que termina o desenho ao soltar o botão do mouse
drawingCanvas.addEventListener("mouseup", (e) => {
  selectType = getSelectType();
  if (selectType == "unselect") return;
  drawing = false;
  Xclick = e.clientX - doc.offsetLeft;
  Yclick = e.clientY - doc.offsetTop;
  Xpos = Xclick + window.pageXOffset + doc.scrollLeft;
  Ypos = Yclick + window.pageYOffset + doc.scrollTop;
  endpos = [Xpos, Ypos];

  fixPositions();

  width = endpos[0] - startpos[0];
  heigth = endpos[1] - startpos[1];
  if (selectType == "include") {
    drawingContext.strokeStyle = "#000000";
  } else {
    drawingContext.strokeStyle = "#FF0000";
  }

  drawingContext.strokeRect(startpos[0], startpos[1], width, heigth);

  var filtered = pdfcontent.filter((item) => {
    betweenX = item.coord[0] > startpos[0] && item.coord[0] < endpos[0];
    betweenY = item.coord[1] > startpos[1] && item.coord[1] < endpos[1];
    return betweenX && betweenY;
  });
  var content = filtered.reduce((acc, item) => acc + item.str + " ", "");
  var resultDiv = document.getElementById("result");
  var lastSelectedDiv = document.getElementById("lastSelected");

  lastSelectedDiv.innerHTML = content;
  /* resultDiv.innerHTML = content */ selections[selectType].push({
    content: content,
    page: curPage,
    coordinates: [startpos[0], startpos[1], width, heigth],
  });
});

var json = {
  "origem": "",
  "diario": "",
  "numero": "",
  "data": "",
  "segmentos": {
    "PREFEITURA DE BELO HORIZONTE": [
    ]
  }
}

var cont_segmentos = 0

var segmentos = {};

function adicionarSegmento () {

  var materia = selections.include.reduce((acc, item) => acc + item.content, "");
  var publicador = document.getElementById('publicadorid');

  var segmento = {
    "materia": materia,
    "page": curPage,
    "publicador": publicador.value,
    "id": ""
  };

  const modal = document.getElementById("modalid");

  segmentos[cont_segmentos] = {
    divSegmento: document.createElement("div"),
    novoSegmento: document.createElement("p"),
    botaoDiv: document.createElement("div"),
    botaoSegmento: document.createElement("button")
  };
  
  var id = cont_segmentos;

  var divSegmento = segmentos[cont_segmentos].divSegmento;
  divSegmento.className = "divSegmento";
  
  var novoSegmento = segmentos[cont_segmentos].novoSegmento;
  novoSegmento.className = "psegmento";
  novoSegmento.innerHTML = JSON.stringify(segmento, null, 2);

  var botaoDiv = segmentos[cont_segmentos].botaoDiv;
  botaoDiv.className = "botaoDiv";

  var botaoSegmento = segmentos[cont_segmentos].botaoSegmento;
  botaoSegmento.type = "button";
  botaoSegmento.innerHTML = "Remover";
  botaoSegmento.className = "btn btn-outline-danger";
  botaoSegmento.onclick = function(){removerSegmento(id);}

  botaoDiv.appendChild(botaoSegmento);

  divSegmento.appendChild(novoSegmento);
  divSegmento.appendChild(botaoDiv);

  modal.appendChild(divSegmento);

  json["segmentos"]["PREFEITURA DE BELO HORIZONTE"][cont_segmentos] = segmento;
  cont_segmentos++;
  console.log(json);
  while (selections.include.length >= 1){
    selections.include.pop();
  }

  redraw();
}

function removerSegmento (numero_do_contador) {
  alert('contador: ' + numero_do_contador);

  json["segmentos"]["PREFEITURA DE BELO HORIZONTE"].splice(numero_do_contador, 1);
  cont_segmentos = cont_segmentos - 1;

  segmentos[numero_do_contador].divSegmento.remove();
  segmentos[numero_do_contador].novoSegmento.remove();
  segmentos[numero_do_contador].botaoDiv.remove();
  segmentos[numero_do_contador].botaoSegmento.remove();
}


function segmentar () {
  
  var nome = document.getElementById('nomeid');
  var numero = document.getElementById('numeroid');
  var data = document.getElementById('dataid');
  var publicador = document.getElementById('publicadorid');

  if (nome.value == "" || numero.value == "" || data.value == "") {
    console.log('não vou segmentar');
    return;
  }

  json["origem"] = pdfComplexo;
  json["diario"] = nome.value;
  json["numero"] = numero.value;
  json["data"] = data.value;

  const link = document.createElement("a");
  const file = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
  link.href = URL.createObjectURL(file);
  var tamanho_nome = pdfComplexo.length;
  var nome_json = pdfComplexo.substring(0, tamanho_nome - 4);
  link.download = nome_json + ".json";
  link.click();
  URL.revokeObjectURL(link.href);

  console.log(json);
}