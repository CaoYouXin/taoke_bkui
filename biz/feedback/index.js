function renderAll(data) {
  var table = document.getElementById("table");
  var tableTitle = table.firstElementChild.cloneNode(true);
  table.innerHTML = "";
  table.appendChild(tableTitle);

  var renders = [];

  data.forEach(function (rowData) {
    rowData.message.id = rowData.id;
    var rowElem = buildRow(null, rowData.message, ["id", "title", "content"], renders);
    table.appendChild(rowElem);
  });
}

(function () {
  get('/msg/feedback').done(responseMapper(renderAll));
})();