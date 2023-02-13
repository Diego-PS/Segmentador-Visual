// import { renderContent } from "renderContent.js";
//Definição dos canvas e contextos para desenho.
  canvas = {
    doc: document.getElementById("diario"),
    pdfCanvas: document.getElementById("pdfCanvas"),
    pdfContext: pdfCanvas.getContext("2d"),
    drawingCanvas: document.getElementById("drawingCanvas"),
    drawingContext: drawingCanvas.getContext("2d")
  }
//   var doc = document.getElementById("diario");
//   var pdfCanvas = document.getElementById("pdfCanvas");
//   var pdfContext = pdfCanvas.getContext("2d");
//   var drawingCanvas = document.getElementById("drawingCanvas");
//   var drawingContext = drawingCanvas.getContext("2d");
  
  var pdfcontent = [];
  
  //Definição do PDF que será aberto
  var pdf = "2pgs_09_04_2020_DO.pdf";
  var pdfComplexo = "diario.pdf";
  
  var arquivoLocal = "./" + pdfComplexo;
  
  let loadingTask = pdfjsLib.getDocument(arquivoLocal);
  
  //Lidando com o carregamento do pdf e definindo estados iniciais da aplicação.
  var docLoaded = null;
  var curPage = 1;
  loadingTask.promise.then((docloaded) => {
    docLoaded = docloaded;
    renderContent(curPage, canvas);
  });

  function renderContent(curPage, x) {
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
  
      x.pdfCanvas.width = viewWidth;
      x.pdfCanvas.height = viewHeight;
      x.drawingCanvas.width = viewWidth;
      x.drawingCanvas.height = viewHeight;
  
      x.doc.style.width = `${viewWidth + 10}px`;
  
      page.render({
        canvasContext: x.pdfContext,
        viewport: viewport,
      });
  
      redraw(curPage);
    });
  }

  function ola () {
    let titulo = document.getElementById("titulo")
    titulo.innerHTML = 'Olá'
}