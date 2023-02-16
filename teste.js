// import { renderContent } from "renderContent.js";
//Definição dos canvas e contextos para desenho.
  var doc = document.getElementById("diario");
  var pdfCanvas = document.getElementById("pdfCanvas");
  var pdfContext = pdfCanvas.getContext("2d");
  // var drawingCanvas = document.getElementById("drawingCanvas");
  // var drawingContext = drawingCanvas.getContext("2d");
  
  var pdfcontent = [];
  
  //Definição do PDF que será aberto
  var pdfComplexo = "diario.pdf";
  
  var arquivoLocal = "./" + pdfComplexo;
  
  let loadingTask = pdfjsLib.getDocument(arquivoLocal);
  
  //Lidando com o carregamento do pdf e definindo estados iniciais da aplicação.
  var docLoaded = null;
  var curPage = 1;
  loadingTask.promise.then((docloaded) => {
    docLoaded = docloaded;
    renderContent(curPage);
    console.log(curPage);
  });

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
      // drawingCanvas.width = viewWidth;
      // drawingCanvas.height = viewHeight;
  
      doc.style.width = `${viewWidth + 10}px`;
  
      page.render({
        canvasContext: pdfContext,
        viewport: viewport,
      });
  
      // redraw(curPage);
    });
  }

/*
 * Carrega próxima pagina do pdf no canvas.
 */
function nextPage() {
  if (curPage < docLoaded.numPages) {
    curPage = curPage + 1;
    renderContent(curPage);
    console.log(curPage);
  }
}

/*
 * Carrega página anterior do pdf no canvas.
 */
function previousPage() {
  if (curPage > 1) {
    curPage = curPage - 1;
    renderContent(curPage);
    console.log(curPage);
  }
}
