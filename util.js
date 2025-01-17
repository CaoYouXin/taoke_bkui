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
  console.log(ret);
  return ret;
}

function letJSONtoForm(data, $form) {
  console.log(data);
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

function clearForm($form) {
  $form.find('input').val('');
  $form.find('textarea').val('');
}

function getAPI(api) {
  if (document.domain === 'bkui.tkmqr.com') {
    return "http://server.tkmqr.com:8080/api" + api;
  }
  return "http://127.0.0.1:8080/api" + api;
}

function getCDN(api) {
  if (document.domain === 'bkui.tkmqr.com') {
    return "http://server.tkmqr.com:8070/" + api;
  }
  return "http://127.0.0.1:8070/" + api;
}

function buildRow(handlers, data, keyIdxArray, specs, handlerWidth) {
  if (!keyIdxArray.length) {
    throw new Error('argument wrong, reprogram it.');
  }

  var array = [];
  for (var i = 0; i < keyIdxArray.length; i++) {
    var key = keyIdxArray[i];
    var obj = {};
    obj.value = data[key];
    obj.width = 'col-sm';
    array[i] = obj;
  }

  return buildRowFromArray(handlers, data, array, specs, handlerWidth || 'col-sm');
}

function buildRowWithTitleWidth(handlers, rowData, tableTitle, colNames, renders, handlerWidth) {
  var array = [];
  for (var i = 0; i < colNames.length; i++) {
    var obj = {};
    obj.value = rowData[colNames[i]];
    obj.width = tableTitle.children[i].getAttribute('class');
    array[i] = obj;
  }

  return buildRowFromArray(handlers, rowData, array, renders, handlerWidth || 'col-sm');
}

function buildRowFromArray(handlers, data, array, specs, handlerWidth) {
  specs = specs || [];

  var row = document.createElement('div');
  row.classList.add('row');

  for (var i = 0; i < array.length; i++) {
    var content = array[i];

    var cell = document.createElement('div');
    cell.classList.add(content.width);

    cell.innerHTML = content.value;

    var spec = specs[i] || {};
    Object.keys(spec).forEach(function (specK) {
      var specV = spec[specK];
      cell[specK] = spec[specK] instanceof Function ? spec[specK](content.value) : spec[specK];
    });

    row.appendChild(cell);
  }

  if (!handlers || !handlers.length) {
    return row;
  }

  var lastCell = document.createElement('div');
  lastCell.classList.add(handlerWidth || 'col-sm');

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

function buildTableRow(datum, colNames, renders, handles) {
  let tr = document.createElement('TR');

  for (var i = 0; i < colNames.length; i++) {
    var td = document.createElement('TD');
    td.innerHTML = !!renders[i] ? renders[i](datum[colNames[i]]) : datum[colNames[i]];
    tr.appendChild(td);
  }

  if (!handles) {
    return tr;
  }

  let lastTd = document.createElement('TD');
  tr.appendChild(lastTd);

  let handlerG = document.createElement('div');
  handlerG.classList.add('btn-group');
  handlerG.setAttribute('role', 'group');
  lastTd.appendChild(handlerG);

  handles.forEach((handle) => {
    var handler = document.createElement('button');
    handler.classList.add('btn');
    handler.classList.add('btn-sm');
    handler.classList.add(handle.cls || 'btn-primary');
    handler.setAttribute('type', 'button');
    handler.onclick = (e) => {
      handle.handler(e, datum);
    };
    handler.innerHTML = handle.text;

    handlerG.appendChild(handler);
  });

  return tr;
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
        'auth': ut.token.token,
        'platform': 'web'
      },
      contentType: 'application/json; charset=utf-8'
    }).fail(ajaxOnFail);
  } else {
    return $.get(getAPI(api)).fail(ajaxOnFail);
  }
}

function download(api) {
  var ut = getUserToken();
  var req = new XMLHttpRequest();
  req.open("GET", getAPI(api), true);
  req.setRequestHeader('auth', ut.token.token);
  req.responseType = "blob";
  req.onload = function (event) {
    var blob = req.response;
    var fileName = req.getResponseHeader("Content-Disposition");
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName.substring(fileName.indexOf('filename="') + 'filename="'.length, fileName.length - 1);
    link.click();
  };
  req.send();
}

function post(api, data) {
  var ut = getUserToken();
  if (ut.token) {
    return $.ajax({
      url: getAPI(api),
      type: 'POST',
      headers: {
        'auth': ut.token.token,
        'platform': 'web'
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
  let isFunc = typeof idx === 'function';
  var row = table.firstElementChild;
  while (!!row) {
    if (isFunc) {
      if (idx(row) === keyData) {
        return row;
      }
    } else if (row.childNodes[idx].innerHTML === keyData) {
      return row;
    }
    row = row.nextElementSibling;
  }
  return null;
}

function copyText(text) {
  function selectElementText(element) {
    if (document.selection) {
      var range = document.body.createTextRange();
      range.moveToElementText(element);
      range.select();
    } else if (window.getSelection) {
      var range = document.createRange();
      range.selectNode(element);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
    }
  }
  var element = document.createElement('DIV');
  element.textContent = text;
  document.body.appendChild(element);
  selectElementText(element);
  document.execCommand('copy');
  element.remove();
}

function lastIndexOfChar(str, char) {
  for (var i = str.length - 1; i >= 0; i--) {
    if (str.charAt(i) == char) {
      return i;
    }
  }
  return -1;
}