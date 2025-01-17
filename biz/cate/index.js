function onSubmit() {
  var submitData = getJSONfromForm($('#cate-form'));
  if (!submitData.id) {
    delete submitData.id;
  } else {
    submitData.id = Number(submitData.id);
  }
  submitData.order = Number(submitData.order);

  post('/home/cate/set', submitData)
    .done(responseMapper((data) => {

      renderOne(!submitData.id, data);
      letJSONtoForm(data, $('#cate-form'));
    }));
}

function renderOne(isNew, data) {
  var table = document.getElementById("cate");

  var handlers = [{
    text: '修改',
    handler: onChange
  }, {
    text: '删除',
    handler: onDelete
  }];

  var renders = [];

  var rowElem = buildRow(handlers, data, ["id", "name", "cid", "order"], renders);

  if (!isNew) {
    table.replaceChild(rowElem, findOne(table, 0, data.id + ''));
  } else {
    table.appendChild(rowElem);
  }
}

function onChange(e, data) {
  letJSONtoForm(data, $('#cate-form'));
  $('.cate-modal-lg').modal({ show: true });
}

function onDelete(e, data) {
  get(`/home/cate/del/${data.id}`).done(() => {
    var table = document.getElementById("cate");
    table.removeChild(findOne(table, 0, data.id + ''));
  });
}

function renderAll(data) {
  var table = document.getElementById("cate");
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
    var rowElem = buildRow(handlers, rowData, ["id", "name", "cid", "order"], renders);
    table.appendChild(rowElem);
  });
}

(function () {
  get('/home/cate/list').done(responseMapper(renderAll));
})();