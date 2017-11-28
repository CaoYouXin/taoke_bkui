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
  var openTypeBtn = document.getElementById('openTypeBtn');
  openTypeBtn.innerHTML = text;
  var openType = document.getElementById('openType');
  openType.value = oepnTypeCode;
}

function onLocationTypeBtn(text, locationTypeCode) {
  var locationTypeBtn = document.getElementById('locationTypeBtn');
  locationTypeBtn.innerHTML = text;
  var locationType = document.getElementById('locationType');
  locationType.value = locationTypeCode;
}

function onSubmit() {
  var submitData = getJSONfromForm($('#homeBtn-form'));
  if (!submitData.id) {
    delete submitData.id;
  } else {
    submitData.id = Number(submitData.id);
  }
  submitData.openType = Number(submitData.openType);
  submitData.locationType = Number(submitData.locationType);
  submitData.order = Number(submitData.order);

  post(getSubmitAPI(submitData.locationType), submitData)
    .done(responseMapper((data) => {
      clearForm($('#homeBtn-form'));
      renderOne(!submitData.id, data);
    }));
}

function getSubmitAPI(locationType) {
  switch (locationType) {
    case 1:
      return '/home/banner/set';
    case 2:
      return '/home/tool/set';
    case 4:
      return '/home/group/set';
    default:
      return null;
  }
}

function renderOne(isNew, data) {
  var table = document.getElementById("btns");

  var handlers = [{
    text: '修改',
    handler: onChangeHomeBtn
  }, {
    text: '删除',
    handler: onDeleteHomeBtn
  }];

  var renders = [null, null, {
    innerHTML: renderImgUrl
  }, {
      innerHTML: renderLocationType
    }, null, {
      innerHTML: renderOpenType
    }, null];

  var rowElem = buildRow(handlers, data, ["id", "name", "imgUrl", "locationType", "order", "openType", "ext"], renders);

  if (!isNew) {
    table.replaceChild(rowElem, findOne(table, 0, data.id + ''));
  } else {
    table.appendChild(rowElem);
  }
}

function onChangeHomeBtn(e, data) {
  letJSONtoForm(data, $('#homeBtn-form'));
  onOpenTypeBtn(renderOpenType(data.openType), data.openType);
  onLocationTypeBtn(renderLocationType(data.locationType), data.locationType);
  $('.btns-modal-lg').modal({ show: true });
}

function onDeleteHomeBtn(e, data) {
  get(`/home/btn/del/${data.id}`).done(() => {
    var table = document.getElementById("btns");
    table.removeChild(findOne(table, 0, data.id + ''));
  });
}

function renderImgUrl(text) {
  return `<img src="${getCDN(text)}" alt="no uploaded image" />`;
}

function renderLocationType(text) {
  switch (text) {
    case 1:
      return 'Banner轮播';
    case 2:
      return '工具栏';
    case 4:
      return '选品组';
    default:
      return 'null';
  }
}

function renderOpenType(text) {
  switch (text) {
    case 1:
      return 'APP内打开';
    case 2:
      return '浏览器打开';
    case 4:
      return '瀑布流打开';
    default:
      return 'null';
  }
}

function renderAll(data) {
  var table = document.getElementById("btns");
  var tableTitle = table.firstElementChild.cloneNode(true);
  table.innerHTML = "";
  table.appendChild(tableTitle);

  var handlers = [{
    text: '修改',
    handler: onChangeHomeBtn
  }, {
    text: '删除',
    handler: onDeleteHomeBtn
  }];

  var renders = [null, null, {
    innerHTML: renderImgUrl
  }, {
      innerHTML: renderLocationType
    }, null, {
      innerHTML: renderOpenType
    }, null];

  data.forEach(function (rowData) {
    var rowElem = buildRow(handlers, rowData, ["id", "name", "imgUrl", "locationType", "order", "openType", "ext"], renders);
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
  get('/home/btn/list').done(responseMapper(renderAll));
  get('/tbk/fav/list/1').done(responseMapper(renderTable2));
})();