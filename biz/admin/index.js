var table = document.getElementById("table");
var roles1 = document.getElementById("roles-1");
var role1 = document.getElementById("role-1");
var roles2 = document.getElementById("roles-2");
var role2 = document.getElementById("role-2");

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
  letJSONtoForm(data, $('#table-form-3'));
  $('.table-modal-lg-3').modal({ show: true });
}

function onRoleChangeSubmit() {
  var submitData = getJSONfromForm($('#table-form-3'));
  submitData.role = { id: submitData.roleId };
  delete submitData.roleId;

  post('/admin/user/role/change', submitData)
    .done(responseMapper((data) => {

      renderOne(false, data);
    }));
}

function onResetPwd(e, data) {
  letJSONtoForm(data, $('#table-form-2'));
  $('#table-form-2 input[name="pwd"]').val('');
  $('.table-modal-lg-2').modal({ show: true });
}

function onPwdResetSubmit() {
  var submitData = getJSONfromForm($('#table-form-2'));
  submitData.pwd = md5(submitData.pwd);

  post('/admin/user/pwd/change', submitData)
    .done(responseMapper((data) => {

      renderOne(false, data);
    }));
}

function onDelete(e, data) {
  post(`/admin/user/delete/${data.id}`).done(responseMapper(() => {
    var table = document.getElementById("table");
    table.removeChild(findOne(table, 0, data.id + ''));
  }));
}

function renderRole(role) {
  return `${role.name}`;
}

function onCreateSubmit() {
  var submitData = getJSONfromForm($('#table-form-1'));
  if (!submitData.id) {
    delete submitData.id;
  } else {
    submitData.id = Number(submitData.id);
  }
  submitData.pwd = md5(submitData.pwd);
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
    $(role2).val(id);
  };
  return a;
}

(function () {
  get('/admin/user/list').done(responseMapper(renderAll));
  get('/admin/role/list').done(responseMapper(function (data) {
    roles1.innerHTML = '';
    data.forEach(datum => {
      roles1.appendChild(buildMenu(datum.name, datum.id));
      roles2.appendChild(buildMenu(datum.name, datum.id));
    });
  }));
})();