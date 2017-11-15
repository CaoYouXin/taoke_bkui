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

function onSubmit() {
  var submitData = getJSONfromForm($('#table-form'));
  if (!submitData.id) {
    delete submitData.id;
  } else {
    submitData.id = Number(submitData.id);
  }
  submitData.order = Number(submitData.order);

  post('/app/guide/set', submitData)
    .done(responseMapper((data) => {

      renderOne(!submitData.id, data);
    }));
}

function renderImgUrl(text) {
  return `<img src="${getCDN(text)}" alt="no uploaded image" />`;
}

function renderOne(isNew, data) {
  var table = document.getElementById("table");

  var handlers = [{
    text: '修改',
    handler: onChange
  }];

  var renders = [null, {
    innerHTML: renderImgUrl
  }];

  var rowElem = buildRow(handlers, data, ["id", "imgUrl", "order"], renders);

  if (!isNew) {
    table.replaceChild(rowElem, findOne(table, 0, data.id + ''));
  } else {
    table.appendChild(rowElem);
  }
}

function onChange(e, data) {
  letJSONtoForm(data, $('#table-form'));
  $('.table-modal-lg').modal({ show: true });
}

function renderAll(data) {
  var table = document.getElementById("table");
  var tableTitle = table.firstElementChild.cloneNode(true);
  table.innerHTML = "";
  table.appendChild(tableTitle);

  var handlers = [{
    text: '修改',
    handler: onChange
  }];

  var renders = [null, {
    innerHTML: renderImgUrl
  }];

  data.forEach(function (rowData) {
    var rowElem = buildRow(handlers, rowData, ["id", "imgUrl", "order"], renders);
    table.appendChild(rowElem);
  });
}

(function () {
  get('/app/guide/list').done(responseMapper(renderAll));
})();