let table = document.getElementById('table');
let colNames = ["id", "user"];
let renders = [
  null,
  (user) => `${user.name}`
];
let handles = [
  {
    text: '新标签打开',
    cls: 'btn-info',
    handler: goToFeedback
  }
];
var params = {};

function loadFeedback(pageNo) {
  params.pageNo = pageNo;
  get(`/blog/feedback/list/1/${pageNo}`).done(responseMapper(renderAll));
}

function onFirstPageClicked() {
  loadFeedback(1);
}

function onLastPageClicked() {
  loadFeedback(params.total);
}

function onPreviousPageClicked() {
  loadFeedback(Number(params.page) - 1);
}

function onNextPageClicked() {
  loadFeedback(Number(params.page) + 1);
}

function goToFeedback(e, datum) {
  window.open(getAPI(`/blog/${datum.path.replace(/\//g, '&@&')}//${getCDN('').replace(/\//g, '&@&')}`));
}

function renderAll(paged) {
  table.innerHTML = "";
  paged.content.forEach((datum) => {
    table.appendChild(buildTableRow(datum, colNames, renders, handles));
  });

  $(`.badge`).html(`共${paged.totalElements}个`);

  $.each($(`#nav > button`), (i, $page) => {
    if (i <= 1) {
      if (paged.first) {
        $page.setAttribute('disabled', true);
      } else {
        $page.removeAttribute('disabled');
      }
    } else {
      if (paged.last) {
        $page.setAttribute('disabled', true);
      } else {
        $page.removeAttribute('disabled');
      }
    }
  });

  params.total = paged.totalPages;
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

    loadFeedback(params.pageNo);
  } else {
    loadFeedback(1);
  }
})();