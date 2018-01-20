var params = {};

function exportAll() {
  download(`/export/withdraw/list/${params.type}`);
}

function exportSearch() {
  if (!params.search) {
    return;
  }
  download(`/export/withdraw/search/${params.search}`);
}

function loadTable(page, type, search) {
  params.page = page;
  params.type = type;
  switch (params.dataRel) {
    case '1': case '2': case '3':
      get(`/tbk/withdraw/request/list/${type}/${page}`).done(responseMapper(renderAll));
      break;
    case '4':
      params.search = search;
      if (!search) {
        renderAll({
          totalElements: 0,
          content: [],
          first: true,
          last: true,
          totalPages: 0
        });
      } else {
        get(`/tbk/withdraw/request/search/${search}`).done(responseMapper(renderAll));
      }
      break;
    default:
      break;
  }
}

function searchText() {
  loadTable(1, params.type, $("#searchTextId").val());
}

function onFirstPageClicked() {
  loadTable(1, params.type, params.search);
}

function onLastPageClicked() {
  loadTable(params.total, params.type, params.search);
}

function onPreviousPageClicked() {
  loadTable(Number(params.page) - 1, params.type, params.search);
}

function onNextPageClicked() {
  loadTable(Number(params.page) + 1, params.type, params.search);
}

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
  $(`section[data-rel~=${dataRel}]`).removeClass('d-none');

  if (load) {
    params = { dataRel: dataRel };
    loadTable(1, e.target.getAttribute('data-rel'), '');
  }
}

function onPay(e, data) {
  if (data.payed) {
    return;
  }

  var confirmed = confirm("确定用户收到打款了吗？");
  if (!confirmed) {
    return;
  }

  get('/tbk/withdraw/response/' + data.id).done(responseMapper((data) => {
    var table = document.getElementById("table");
    table.removeChild(findOne(table, 0, data.id + ''));
  }));
}

function renderOne(isNew, data) {
  var table = document.getElementById("table");

  var handlers = [{
    text: '已支付',
    handler: onPay
  }];

  var renders = [null, {
    innerHTML: renderUser
  }, null, null, {
      innerHTML: renderPayed
    }];

  var rowElem = buildRow(handlers, data, ["id", "user", "amount", "createTime", "payed", "payTime"], renders);

  if (!isNew) {
    table.replaceChild(rowElem, findOne(table, 0, data.id + ''));
  } else {
    table.appendChild(rowElem);
  }
}

function renderUser(user) {
  return `${user.name}(${user.realName})`;
}

function renderPayed(payed) {
  return payed ? "支付过" : "还未支付";
}

function renderAll(page) {
  var table = document.getElementById("table");
  var tableTitle = table.firstElementChild.cloneNode(true);
  table.innerHTML = "";
  table.appendChild(tableTitle);

  var handlers = [{
    text: '已支付',
    handler: onPay
  }];

  var renders = [null, {
    innerHTML: renderUser
  }, null, null, {
      innerHTML: renderPayed
    }];

  page.content.forEach(function (rowData) {
    var rowElem = buildRow(handlers, rowData, ["id", "user", "amount", "createTime", "payed", "payTime"], renders);
    table.appendChild(rowElem);
  });

  $(`section > .badge`).html(`共${page.totalElements}个`);

  $.each($(`section > .btn-group > button`), (i, $page) => {
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
    onTopCateClicked({ target: $(`#topCates > button[data-rel=${params.type}]`)[0] }, false);
    loadTable(params.page, params.type, params.search);
  } else {
    onTopCateClicked({ target: $("#topCates > button")[0] }, true);
  }
})();