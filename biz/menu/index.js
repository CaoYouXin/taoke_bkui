function renderOne(isNew, data) {
  var table = document.getElementById("menus");

  var handlers = [{
    text: '修改',
    handler: onChangeMenu
  }];

  var renders = [null, null, {
    // innerHTML: renderRoute
  }];

  var rowElem = buildRow(handlers, data, ["id", "name", "route"], renders);
  if (!isNew) {
    table.appendChild(rowElem);
  } else {
    table.replaceChild(rowElem, findOne(table, 0, data.id + ''));
  }
}

function flushMenus(isNew, data) {
  var ut = getUserToken();
  if (!ut.admin) {
    return;
  }

  if (!isNew) {

    ut.admin.role.menus = ut.admin.role.menus.map(m => {
      if (m.id === data.id) {
        return data;
      }
      return m;
    });

  } else {

    ut.admin.role.menus[ut.admin.role.menus.length] = data;

  }

  localStorage.setItem('user', JSON.stringify(ut));
}

function onSubmitMenu() {
  var submitData = getJSONfromForm($('#menu-form'));
  if (submitData.id) {
    submitData.id = Number(submitData.id);
  } else {
    delete submitData.id;
  }
  console.log(submitData);
  post(getMenuSubmitAPI(submitData), submitData)
    .done(responseMapper((data) => {

      renderOne(submitData.id, data);
    }));
}

function getMenuSubmitAPI(data) {
  return data.id ? "/admin/menu/change" : "/admin/menu/create";
}

function onChangeMenu(e, data) {
  letJSONtoForm(data, $('#menu-form'));
  $('.menu-modal-lg').modal({ show: true });
}

// function renderRoute(route) {
//   return `<a href="${route}" target="_blank">${route}</a>`;
// }

function renderAll(data) {
  var table = document.getElementById("menus");
  var tableTitle = table.firstElementChild.cloneNode(true);
  table.innerHTML = "";
  table.appendChild(tableTitle);

  var handlers = [{
    text: '修改',
    handler: onChangeMenu
  }];

  var renders = [null, null, {
    // innerHTML: renderRoute
  }];

  data.forEach(function (rowData) {
    var rowElem = buildRow(handlers, rowData, ["id", "name", "route"], renders);
    table.appendChild(rowElem);
  });
}

(function () {
  get('/admin/menu/list').done(responseMapper(renderAll));
})();