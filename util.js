function getJSONfromForm($form) {
  var sa = $form.serializeArray();
  var ret = {};

  $.map(sa, function (n, i) {
    ret[n['name']] = n['value'];
  });

  $.each($form.find('input[disabled]'), (i, dI) => {
    var $dI = $(dI);
    ret[$dI.attr('name')] = $dI.val();
  });
  return ret;
}

function letJSONtoForm(data, $form) {
  Object.keys(data).forEach((key) => {
    var input = $form.find(`input[name="${key}"]`);
    if (input.length) {
      input.val(data[key]);
    }

    var textarea = $form.find(`textarea[name="${key}"]`);
    if (textarea.length) {
      textarea.val(data[key]);
    }
  });
}

function getAPI(api) {
  // return "http://127.0.0.1:8090" + api;
  return "http://120.78.194.198:8080/api" + api;
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

  return buildRowFromArray(handlers, data, array, specs);
}

function buildRowFromArray(handlers, data, array, specs) {
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
    handler.onclick = (e) => {
      handlerV.handler(e, data);
    };
    handler.innerHTML = handlerV.text;

    handlerG.appendChild(handler);
  });

  lastCell.appendChild(handlerG);
  row.appendChild(lastCell);

  return row;
}

function ajaxOnFail(error) {
  if (401 === error.status) {
    console.log("http level not authed");
  }

  console.log(error);
  alert("Net Error Occurred, Open 控制台 to see more infomation.");
}

function responseFilter(response) {
  if (response.code !== 2000) {
    console.log(response.body);
    alert(`Server Code Error, Open 控制台 to see more infomation.\n${response.body.msg}`);
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

function responseMapper(handler) {
  return function (response, status) {
    console.log("Data: ", response, "\nStatus: ", status);

    if (response.code === 2000) {
      handler(response.body);
      return;
    }

    if (response.code === 4010) {
      alert('需要登录');
      location.href = '/';
      return;
    }

    if (response.code === 4011) {
      alert('需要相应的管理员权限');
      return;
    }

    console.log(response.body);
    alert(`Server Code Error, Open 控制台 to see more infomation.\n${response.body.msg}`);
  }
}

function getUserToken() {
  var userTokenJSON = localStorage.getItem('user') || "{}";
  return JSON.parse(userTokenJSON);
}

function get(api) {
  var ut = getUserToken();
  if (ut.token) {
    return $.ajax({
      url: getAPI(api),
      type: 'GET',
      headers: {
        'auth': ut.token.token
      },
      contentType: 'application/json; charset=utf-8'
    }).fail(ajaxOnFail);
  } else {
    return $.get(getAPI(api)).fail(ajaxOnFail);
  }
}

function post(api, data) {
  var ut = getUserToken();
  if (ut.token) {
    return $.ajax({
      url: getAPI(api),
      type: 'POST',
      headers: {
        'auth': ut.token.token
      },
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(data)
    }).fail(ajaxOnFail);
  } else {
    return $.post(getAPI(api), data).fail(ajaxOnFail);
  }
}

function upload($form) {
  var ut = getUserToken();
  if (!ut.token) {
    return;
  }

  return $.ajax({
    url: getAPI("/uploadFile"),
    type: "POST",
    headers: {
      'auth': ut.token.token
    },
    data: new FormData($form[0]),
    enctype: 'multipart/form-data',
    processData: false,
    contentType: false,
    cache: false
  }).fail(ajaxOnFail);
}

function findOne(table, idx, keyData) {
  for (var i = 0; i < table.childElementCount; i++) {
    var row = table.childNodes[i];
    if (row.childNodes[idx].innerHTML === keyData) {
      return row;
    }
  }
  return null;
}