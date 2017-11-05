function renderOne(isNew, data) {
  var table = document.getElementById("menus");

  var handlers = [{
    text: '修改',
    handler: onChangeMenu
  }];

  var renders = [null, null, {
    // innerHTML: renderRoute
  }];


}

function onSubmitMenu() {
  var SubmitData = getJSONfromForm($('#menu-form'));

  $.post(getMenuSubmitAPI(SubmitData), SubmitData)
    .done(function (data, status) {
      console.log("Data: ", data, "\nStatus: ", status);


    }).fail(ajaxOnFail);
}

function getMenuSubmitAPI(data) {
  return getAPI(data.id ?
    "/admin/menu/change" :
    "/admin/menu/create");
}

function onChangeMenu(e) {
  console.log(e);
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

$.get(getAPI("/admin/menu/list"))
  .done(function (data, status) {
    console.log("Data: ", data, "\nStatus: ", status);

    responseFilter(data).done(renderAll);
  }).fail(ajaxOnFail);;