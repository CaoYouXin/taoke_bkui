var params = {};

function onTopCateClicked(e, load) {
  $.each($("#topCates > button"), (i, $btn) => {
    $btn.classList.remove('btn-primary');
    $btn.classList.remove('btn-secondary');

    $btn.classList.add('btn-secondary');
  });

  e.target.classList.remove('btn-secondary');
  e.target.classList.add('btn-primary');

  var dataRel = e.target.getAttribute('data-rel');
  $('section').addClass('d-none');
  $(`section[data-rel=${dataRel}]`).removeClass('d-none');

  if (load) {
    var showAnonymous = $(`section[data-rel=${dataRel}] input.form-check-input`)[0];
    if (showAnonymous) {
      loadUserList(dataRel, 1, $(showAnonymous).is(':checked') ? 1 : 0, true);
    } else {
      loadUserList(dataRel, 1, 1, true);
    }
  }
}

function loadUserList(dataRel, page, showAnonymousFlag, init) {
  params = { dataRel: dataRel };
  params.page = page;
  switch (dataRel) {
    case '1':
      params.showAnonymousFlag = showAnonymousFlag;
      get(`/admin/manage/user/list/${page}/${showAnonymousFlag}`).done(responseMapper(renderAll));
      break;
    case '2':
    case '3':
    case '4':
      if (init) {
        renderAll({
          first: true,
          last: true,
          content: [],
          totalElements: 0,
          totalPages: 0
        });
      }
      break;
    // case '4':
    // get(`/admin/manage/user/need/check/list/${page}`).done(responseMapper(renderAll));
    // break;
  }
}

function onAnonymousFlagChange(dataRel) {
  loadUserList(dataRel, 1, params.showAnonymousFlag === 1 ? 0 : 1, false);
}

function onFirstPageClicked(dataRel) {
  loadUserList(dataRel, 1, params.showAnonymousFlag, false);
}

function onLastPageClicked(dataRel) {
  loadUserList(dataRel, params.total, params.showAnonymousFlag, false);
}

function onPreviousPageClicked(dataRel) {
  loadUserList(dataRel, Number(params.page) - 1, params.showAnonymousFlag, false);
}

function onNextPageClicked(dataRel) {
  loadUserList(dataRel, Number(params.page) + 1, params.showAnonymousFlag, false);
}

function exportAll() {
  download(`/export/all/${params.showAnonymousFlag}`);
}

function onCheck(e, data) {
  letJSONtoForm(data, $('#table-form'));
  $('.table-modal-lg').modal({ show: true });
}

function onSubmit() {
  var data = getJSONfromForm($('#table-form'));
  post(`/tbk/user/check/agent/${data.id}`, data.pid).done(responseMapper((result) => {
    renderOne(false, result);
  }));
}

function onDownGrade(e, data) {
  get(`/tbk/user/down/grade/${data.id}`).done(responseMapper((result) => {
    renderOne(false, result);
  }));
}

function renderOne(isNew, data) {
  var table = document.getElementById("table");
  var tableTitle = table.firstElementChild;

  var colNames = ["id", "name", "realName", "phone", "aliPayId", "qqId", "weChatId", "announcement", "aliPid", "code", "ext"];
  if (tableTitle.childElementCount - 1 !== colNames.length && tableTitle.childElementCount !== colNames.length) {
    alert("ERROR, table formattion.");
    return;
  }

  var handlers = [{
    text: '降级',
    handler: onDownGrade
  }, {
    text: '通过审核',
    handler: onCheck
  }];

  var renders = [];

  var array = [];
  for (var i = 0; i < colNames.length; i++) {
    var obj = {};
    obj.value = data[colNames[i]];
    obj.width = tableTitle.children[i].getAttribute('class');
    array[i] = obj;
  }

  var rowElem = buildRowFromArray(handlers, data, array, renders, 'col-sm-2');

  if (!isNew) {
    table.replaceChild(rowElem, findOne(table, 0, data.id + ''));
  } else {
    table.appendChild(rowElem);
  }
}

function renderAll(page) {
  var table = document.getElementById("table");
  var tableTitle = table.firstElementChild.cloneNode(true);
  table.innerHTML = "";
  table.appendChild(tableTitle);

  var colNames = ["id", "name", "realName", "phone", "aliPayId", "qqId", "weChatId", "announcement", "aliPid", "code", "ext"];
  if (tableTitle.childElementCount - 1 !== colNames.length && tableTitle.childElementCount !== colNames.length) {
    alert("ERROR, table formattion.");
    return;
  }

  var handlers = [{
    text: '降级',
    handler: onDownGrade
  }, {
    text: '通过审核',
    handler: onCheck
  }];

  var renders = [];

  page.content.forEach(function (rowData) {
    var array = [];
    for (var i = 0; i < colNames.length; i++) {
      var obj = {};
      obj.value = rowData[colNames[i]];
      obj.width = tableTitle.children[i].getAttribute('class');
      array[i] = obj;
    }

    var rowElem = buildRowFromArray(handlers, rowData, array, renders, 'col-sm-2');
    table.appendChild(rowElem);
  });

  $(`section[data-rel=${params.dataRel}] > .badge`).html(`共${page.totalElements}个`);

  $.each($(`section[data-rel=${params.dataRel}] > .btn-group > button`), (i, $page) => {
    if (i <= 1) {
      if (page.first) {
        $page.setAttribute('disabled', true);
      } else {
        $page.removeAttribute('disabled');
      }
    } else {
      if (page.last) {
        $page.setAttribute('disabled', true);
      } else {
        $page.removeAttribute('disabled');
      }
    }
  });

  params.total = page.totalPages;
  location.hash = Object.keys(params).reduce(
    function (a, k) { a.push(k + '=' + encodeURIComponent(params[k])); return a; }, []
  ).join('&');
}

(function () {
  if (location.hash) {
    params = decodeURIComponent(location.hash).substring(1).split(/&/).reduce(
      function (a, kv) { keyV = kv.split(/=/); a[keyV[0]] = keyV[1]; return a; }, {}
    );
    console.log('refresh from url hash: ', params);
    onTopCateClicked({ target: $(`#topCates > button[data-rel=${params.dataRel}]`)[0] }, false);
    var showAnonymous = $(`section[data-rel=${params.dataRel}] input.form-check-input`)[0];
    if (showAnonymous) {
      $(showAnonymous).attr('checked', params.showAnonymousFlag === '1');
    }
    loadUserList(params.dataRel, params.page, params.showAnonymousFlag, true);
  } else {
    onTopCateClicked({ target: $("#topCates > button")[0] }, true);
  }
})();