var table = document.getElementById("table");
var roles1 = document.getElementById("roles-1");
var role1 = document.getElementById("role-1");

var handlers = [{
  text: '角色设定',
  handler: onChangeRole
}, {
  text: '重设密码',
  handler: onResetPwd
}, {
  text: '删除',
  handler: onDelete
}];

var renders = [
  null, null, {
    innerHTML: renderRole
  }
];

var colNames = ["id", "name", "role"];

function onChangeRole(e, data) {

}

function onResetPwd(e, data) {

}

function onDelete(e, data) {

}

function renderRole(role) {
  return `${role.name}`;
}

function onCreateSubmit() {
  var submitData = getJSONfromForm($('#table-form'));
  if (!submitData.id) {
    delete submitData.id;
  } else {
    submitData.id = Number(submitData.id);
  }
  submitData.roleId = Number(submitData.roleId);

  post('/admin/user/create', submitData)
    .done(responseMapper((data) => {

      renderOne(!submitData.id, data);
    }));
}

function renderOne(isNew, data) {
  var rowElem = buildRow(handlers, data, colNames, renders, 'col-sm-4');

  if (!isNew) {
    table.replaceChild(rowElem, findOne(table, 0, data.id + ''));
  } else {
    table.appendChild(rowElem);
  }
}

function renderAll(data) {
  var tableTitle = table.firstElementChild.cloneNode(true);
  table.innerHTML = "";
  table.appendChild(tableTitle);

  data.forEach(function (rowData) {
    var rowElem = buildRow(handlers, rowData, colNames, renders, 'col-sm-4');
    table.appendChild(rowElem);
  });
}

function buildMenu(name, id) {
  var a = document.createElement('a');
  a.classList.add('dropdown-item');
  a.setAttribute('href', '#');
  a.innerText = name;
  a.onclick = function (e) {
    $(role1).val(id);
  };
  return a;
}

(function () {
  get('/admin/user/list').done(responseMapper(renderAll));
  get('/admin/role/list').done(responseMapper(function (data) {
    roles1.innerHTML = '';
    data.forEach(datum => {
      roles1.appendChild(buildMenu(datum.name, datum.id));
    });
  }));
})();