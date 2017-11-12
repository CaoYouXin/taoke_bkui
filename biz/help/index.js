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

  post('/app/help/set', submitData)
    .done(responseMapper((data) => {

      renderOne(!submitData.id, data);
    }));
}

function renderOne(isNew, data) {
  var table = document.getElementById("table");

  var handlers = [{
    text: '修改',
    handler: onChange
  }];

  var renders = [];

  var rowElem = buildRow(handlers, data, ["id", "question", "answer"], renders);

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

  var renders = [];

  data.forEach(function (rowData) {
    var rowElem = buildRow(handlers, rowData, ["id", "question", "answer"], renders);
    table.appendChild(rowElem);
  });
}

(function () {
  get('/app/help/list').done(responseMapper(renderAll));
})();