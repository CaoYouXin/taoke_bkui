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

      renderOne(!!submitData.id, data);
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
    table.appendChild(rowElem);
  } else {
    var oldElem = findOne(table, 0, data.id + '');
    table.replaceChild(rowElem, oldElem);
  }
}

function onChangeHomeBtn(e, data) {
  letJSONtoForm(data, $('#homeBtn-form'));
  onOpenTypeBtn(renderOpenType(data.openType), data.openType);
  onLocationTypeBtn(renderLocationType(data.locationType), data.locationType);
  $('.btns-modal-lg').modal({ show: true });
}

function renderImgUrl(text) {
  return `<img src="http://192.168.0.104:5001/${text}" alt="no uploaded image" />`;
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
      return '瀑布流代开';
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

(function () {
  get('/home/btn/list').done(responseMapper(renderAll));
})();