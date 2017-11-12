function renderAll(data) {
  var table = document.getElementById("table");
  var tableTitle = table.firstElementChild.cloneNode(true);
  table.innerHTML = "";
  table.appendChild(tableTitle);

  var renders = [];

  data.forEach(function (rowData) {
    var rowElem = buildRow(null, rowData, ["id", "title", "content"], renders);
    table.appendChild(rowElem);
  });
}

(function () {
  get('/msg/feedback').done(responseMapper(renderAll));
})();