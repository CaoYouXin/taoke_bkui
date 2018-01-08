var table = document.getElementById("btns");

var handlers = [{
  text: '修改',
  handler: onChangeHomeBtn
}, {
  text: '删除',
  handler: onDeleteHomeBtn
}];

var renders = [
  null, null, {
    innerHTML: renderImgUrl
  }, null, null, null, {
    innerHTML: renderOpenType
  }, null
];

var colNames = ["id", "name", "imgUrl", "order", "rowSpan", "colSpan", "openType", "ext"];

function openFileUploader() {
  var fileUploader = document.getElementById('fileUploader');
  fileUploader.click();
}

function onFileUploaderChange() {
  var fileUploader = document.getElementById('fileUploader');
  var imgUrl = document.getElementById('imgUrl');

  upload($('#uploader')).done((data, status) => {
    console.log(data, status);
    data = JSON.parse(data);
    Object.keys(data).forEach(key => {
      imgUrl.value = data[key];
    });
    fileUploader.value = '';
  });
}

function onOpenTypeBtn(text, oepnTypeCode) {
  var openType = document.getElementById('openType');
  openType.value = oepnTypeCode;
}

function onSubmit() {
  var submitData = getJSONfromForm($('#homeBtn-form'));
  if (!submitData.id) {
    delete submitData.id;
  } else {
    submitData.id = Number(submitData.id);
  }
  submitData.openType = Number(submitData.openType);
  submitData.order = Number(submitData.order);
  submitData.rowSpan = Number(submitData.rowSpan);
  submitData.colSpan = Number(submitData.colSpan);

  post('/home/adZone/set', submitData)
    .done(responseMapper((data) => {
      clearForm($('#homeBtn-form'));
      renderOne(!submitData.id, data);
    }));
}

function renderOne(isNew, data) {
  var tableTitle = table.firstElementChild;
  var rowElem = buildRowWithTitleWidth(handlers, data, tableTitle, colNames, renders, 'col-sm-2');

  if (!isNew) {
    table.replaceChild(rowElem, findOne(table, 0, data.id + ''));
  } else {
    table.appendChild(rowElem);
  }
}

function onChangeHomeBtn(e, data) {
  letJSONtoForm(data, $('#homeBtn-form'));
  $('.btns-modal-lg').modal({ show: true });
}

function onDeleteHomeBtn(e, data) {
  get(`/home/adZone/del/${data.id}`).done(() => {
    table.removeChild(findOne(table, 0, data.id + ''));
  });
}

function renderImgUrl(text) {
  return `<img src="${getCDN(text)}" alt="no uploaded image" />`;
}

function renderOpenType(text) {
  switch (text) {
    case 1:
      return '只是个标题';
    case 2:
      return '浏览器打开';
    case 4:
      return '瀑布流打开';
    default:
      return 'null';
  }
}

function renderAll(data) {
  var tableTitle = table.firstElementChild.cloneNode(true);
  table.innerHTML = "";
  table.appendChild(tableTitle);

  data.forEach(function (rowData) {
    var rowElem = buildRowWithTitleWidth(handlers, rowData, tableTitle, colNames, renders, 'col-sm-2');
    table.appendChild(rowElem);
  });
}

function renderTable2(data) {
  var table = document.getElementById("favs");
  var tableTitle = table.firstElementChild.cloneNode(true);
  table.innerHTML = "";
  table.appendChild(tableTitle);

  var renders = [null, null, {
    innerHTML: (type) => {
      switch (type) {
        case 1: return '普通选品';
        case 2: return '高佣选品组';
        default: throw new Error('unkonwn type');
      }
    }
  }];

  data.forEach(function (rowData) {
    var rowElem = buildRow([], rowData, ["favoritesId", "favoritesTitle", "type"], renders);
    table.appendChild(rowElem);
  });
}

(function () {
  get('/home/adZone/list').done(responseMapper(renderAll));
  get('/tbk/fav/list/1').done(responseMapper(renderTable2));
})();