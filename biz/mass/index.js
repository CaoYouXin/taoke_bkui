function onSubmit() {
  var submitData = getJSONfromForm($('#table-form'));
  if (!submitData.id) {
    delete submitData.id;
  } else {
    submitData.id = Number(submitData.id);
  }

  post('/msg/send/2/all', submitData)
    .done(responseMapper((data) => {

      renderOne(!submitData.id, data);
    }));
}

function renderOne(isNew, data) {
  var table = document.getElementById("table");

  var renders = [];

  var rowElem = buildRow(null, data, ["id", "title", "content"], renders);

  if (!isNew) {
    table.replaceChild(rowElem, findOne(table, 0, data.id + ''));
  } else {
    table.appendChild(rowElem);
  }
}

function onChange(e, data) {
  letJSONtoForm(data, $('#table-form'));
  $('.table-modal-lg').modal({ show: true });
}

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
  get('/msg/send/2/all/read').done(responseMapper(renderAll));
})();