function onTopCateClicked(e) {
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

  location.hash = dataRel;
  loadUserList(dataRel, 1, true);
}

function loadUserList(dataRel, page, init) {
  var end = location.hash.indexOf('p');
  location.hash = location.hash.substring(0, end !== -1 ? end : location.hash.length) + 'p' + page;
  switch (dataRel) {
    case '1':
      get(`/admin/manage/user/list/${page}`).done(responseMapper(renderAll));
      break;
    case '2':
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
  }
}

function onFirstPageClicked(dataRel) {
  loadUserList(dataRel, 1);
}

function onLastPageClicked(dataRel) {
  var start = location.hash.indexOf('of') + 2;
  var page = location.hash.substring(start);
  loadUserList(dataRel, page);
}

function onPreviousPageClicked(dataRel) {
  var start = location.hash.indexOf('p');
  var end = location.hash.indexOf('of');
  var page = Number(location.hash.substring(start + 1, end)) - 1;
  loadUserList(dataRel, page);
}

function onNextPageClicked(dataRel) {
  var start = location.hash.indexOf('p');
  var end = location.hash.indexOf('of');
  var page = Number(location.hash.substring(start + 1, end)) + 1;
  loadUserList(dataRel, page);
}

function exportAll() {
  download('/export/all/2');
}

function onCheck(e, data) {

}

function onFroze(e, data) {

}

function onDefroze(e, data) {

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
    text: '封号',
    handler: onFroze
  }, {
    text: '解封',
    handler: onDefroze
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

  $(`section[data-rel=${location.hash.substring(1, location.hash.indexOf('p'))}] > .badge`).html(`共${page.totalElements}个`);

  $.each($(`section[data-rel=${location.hash.substring(1, location.hash.indexOf('p'))}] > .btn-group > button`), (i, $page) => {
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

  if (location.hash.match(/p/)) {
    location.hash = location.hash + 'of' + page.totalPages;
  }
}

(function () {
  if (location.hash) {
    var end = location.hash.indexOf('p');
    onTopCateClicked({ target: $(`#topCates > button[data-rel=${location.hash.substring(1, end !== -1 ? end : location.hash.length)}]`)[0] });
  } else {
    onTopCateClicked({ target: $("#topCates > button")[0] });
  }
})();