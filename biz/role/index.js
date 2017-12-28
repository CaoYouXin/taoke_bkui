var table = document.getElementById("table");
var menus = document.getElementById("menus");
var formMenus = document.getElementById("form-menus");

var handlers = [{
  text: '修改',
  handler: onChange
}, {
  text: '权限',
  handler: onPrivilege
}];

var renders = [];
var colNames = ["id", "name", "renderedMenus", "renderedPrivileges"];
var to = null;

function preRender(rowData) {
  rowData.renderedMenus = rowData.menus.map(m => `<div>${m.name}</div>`).join('');
  rowData.renderedPrivileges = rowData.privileges.map(p => `<div>${p.api}</div>`).join('');
  return rowData;
}

function buildMenu(name, id) {
  var a = document.createElement('a');
  a.classList.add('dropdown-item');
  a.setAttribute('href', '#');
  a.innerText = name;
  a.onclick = function (e) { onMenuAdd(e, name, id); };
  return a;
}

function buildFormMenu(name, id) {
  var div = document.createElement('div');
  div.classList.add('float-left');
  div.classList.add('form-menu');
  var nameElem = document.createElement('span');
  nameElem.classList.add('name');
  nameElem.innerText = name;
  div.appendChild(nameElem);
  var handler = document.createElement('span');
  handler.classList.add('delete');
  handler.innerText = '删除';
  handler.onclick = function (e) { onMenuRemove(e, name, id); };
  div.appendChild(handler);
  return div;
}

function onMenuRemove(e, name, id) {
  post('/admin/menu/unbind', {
    id: id,
    to: to
  }).done(responseMapper(function () {
    menus.appendChild(buildMenu(name, id));
    e.target.parentElement.parentElement.removeChild(e.target.parentElement);
  }));
}

function onMenuAdd(e, name, id) {
  post('/admin/menu/bind', {
    id: id,
    to: to
  }).done(responseMapper(function () {
    formMenus.appendChild(buildFormMenu(name, id));
    e.target.parentElement.removeChild(e.target);
  }));
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
  to = data.id;
  get('/admin/menu/list').done(responseMapper(function (res) {
    formMenus.innerHTML = '';
    menus.innerHTML = '';
    res.forEach(function (menu) {
      if (data.menus.some(m => m.name === menu.name)) {
        formMenus.appendChild(buildFormMenu(menu.name, menu.id));
      } else {
        menus.appendChild(buildMenu(menu.name, menu.id));
      }
    });
    letJSONtoForm(data, $('#table-form-2'));
    $('.table-modal-lg-2').modal({ show: true });
  }));
}

$('.table-modal-lg-2').on('hidden.bs.modal', function () {
  get('/admin/role/list').done(responseMapper(renderAll));
});

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