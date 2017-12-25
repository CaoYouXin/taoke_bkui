function onSubmit() {
  var submitData = getJSONfromForm($('#table-form'));
  if (!submitData.id) {
    delete submitData.id;
  } else {
    submitData.id = Number(submitData.id);
  }

  post('/app/help/set', submitData)
    .done(responseMapper((data) => {

      renderOne(!submitData.id, data);
    }));
}

function renderOne(isNew, data) {
  var table = document.getElementById("table");

  var handlers = [{
    text: '修改',
    handler: onChange
  }, {
    text: '删除',
    handler: onDelete
  }];

  var renders = [];

  var rowElem = buildRow(handlers, data, ["id", "question", "answer"], renders);

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

function onDelete(e, data) {
  get(`/app/help/remove/${data.id}`).done(() => {
    var table = document.getElementById("table");
    table.removeChild(findOne(table, 0, data.id + ''));
  });
}

function renderAll(data) {
  var table = document.getElementById("table");
  var tableTitle = table.firstElementChild.cloneNode(true);
  table.innerHTML = "";
  table.appendChild(tableTitle);

  var handlers = [{
    text: '修改',
    handler: onChange
  }, {
    text: '删除',
    handler: onDelete
  }];

  var renders = [];

  data.forEach(function (rowData) {
    var rowElem = buildRow(handlers, rowData, ["id", "question", "answer"], renders);
    table.appendChild(rowElem);
  });
}

(function () {
  get('/app/help/list').done(responseMapper(renderAll));
})();