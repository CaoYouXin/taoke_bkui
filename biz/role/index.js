var table = document.getElementById("table");

var handlers = [{
  text: '修改',
  handler: onChange
}, {
  text: '权限',
  handler: onPrivilege
}];

var renders = [];
var colNames = ["id", "name", "renderedMenus", "renderedPrivileges"];

function preRender(rowData) {
  rowData.renderedMenus = rowData.menus.map(m => m.name).join('<br/>');
  rowData.renderedPrivileges = rowData.privileges.map(p => p.api).join('<br/>');
  return rowData;
}

function onSubmit() {
  var submitData = getJSONfromForm($('#table-form'));
  if (!submitData.id) {
    delete submitData.id;

    post('/admin/role/create', submitData)
      .done(responseMapper((data) => {

        renderOne(true, data);
      }));
  } else {

    submitData.id = Number(submitData.id);

    post('/admin/role/change', submitData)
      .done(responseMapper((data) => {

        renderOne(false, data);
      }));
  }
}

function renderOne(isNew, data) {
  var tableTitle = table.firstElementChild;
  var rowElem = buildRowWithTitleWidth(handlers, preRender(data), tableTitle, colNames, renders, 'col-sm-2');

  if (!isNew) {
    table.replaceChild(rowElem, findOne(table, 0, data.id + ''));
  } else {
    table.appendChild(rowElem);
  }
}

function onChange(e, data) {
  letJSONtoForm(data, $('#table-form'));
  $('.table-modal-lg-1').modal({ show: true });
}

function onPrivilege(e, data) {
  letJSONtoForm(data, $('#table-form-2'));
  $('.table-modal-lg-2').modal({ show: true });
}

function renderAll(data) {
  var tableTitle = table.firstElementChild.cloneNode(true);
  table.innerHTML = "";
  table.appendChild(tableTitle);

  data.forEach(function (rowData) {
    var rowElem = buildRowWithTitleWidth(handlers, preRender(rowData), tableTitle, colNames, renders, 'col-sm-2');
    table.appendChild(rowElem);
  });
}

(function () {
  get('/admin/role/list').done(responseMapper(renderAll));
})();