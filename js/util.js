function getJSONfromForm($form) {
  var sa = $form.serializeArray();
  var ret = {};

  $.map(sa, function (n, i) {
    ret[n['name']] = n['value'];
  });

  return ret;
}

function getAPI(api) {
  return "http://localhost:8090" + api;
}

function buildRow(handlers, data, keyIdxArray, specs) {
  if (!keyIdxArray.length) {
    throw new Error('argument wrong, reprogram it.');
  }

  var array = [];
  for (var i = 0; i < keyIdxArray.length; i++) {
    var key = keyIdxArray[i];
    array[i] = data[key];
  }

  return buildRowFromArray(handlers, array, specs);
}

function buildRowFromArray(handlers, array, specs) {
  specs = specs || [];

  var row = document.createElement('div');
  row.classList.add('row');

  for (var i = 0; i < array.length; i++) {
    var cell = document.createElement('div');
    cell.classList.add('col-sm');

    var content = array[i];
    cell.innerHTML = content;

    var spec = specs[i] || {};
    Object.keys(spec).forEach(function (specK) {
      var specV = spec[specK];
      cell[specK] = spec[specK] instanceof Function ? spec[specK](content) : spec[specK];
    });

    row.appendChild(cell);
  }

  var lastCell = document.createElement('div');
  lastCell.classList.add('col-sm');

  var handlerG = document.createElement('div');
  handlerG.classList.add('btn-group');
  handlerG.setAttribute('role', 'group');

  Object.keys(handlers).forEach(function (handlerK) {
    var handlerV = handlers[handlerK];

    var handler = document.createElement('button');
    handler.classList.add('btn');
    handler.classList.add('btn-primary');
    handler.setAttribute('type', 'button');
    handler.onclick = handlerV.handler;
    handler.innerHTML = handlerV.text;

    handlerG.appendChild(handler);
  });

  lastCell.appendChild(handlerG);
  row.appendChild(lastCell);

  return row;
}

function ajaxOnFail(error) {
  if (401 === error.status) {
    console.log("go to login");
    return;
  }

  console.log(error);
  alert("Net Error Occurred, Open 控制台 to see more infomation.");
}

function responseFilter(response) {
  if (response.code !== 2000) {
    console.log(response.body);
    alert("Server Code Error, Open 控制台 to see more infomation.");
    return {
      done: () => { }
    };
  }

  return {
    done: function (handler) {
      handler(response.body);
    }
  };
}