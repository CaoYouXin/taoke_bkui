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

function onTypeBtn(text, typeCode) {
  var typeBtn = document.getElementById('typeBtn');
  typeBtn.innerHTML = text;
  var type = document.getElementById('type');
  type.value = typeCode;
}

function onSubmit() {
  var submitData = getJSONfromForm($('#table-form'));
  if (!submitData.id) {
    delete submitData.id;
  } else {
    submitData.id = Number(submitData.id);
  }
  submitData.order = Number(submitData.order);
  submitData.type = Number(submitData.type);

  post('/app/guide/set', submitData)
    .done(responseMapper((data) => {

      renderOne(!submitData.id, data);
    }));
}

function renderImgUrl(text) {
  return `<img src="${getCDN(text)}" alt="no uploaded image" />`;
}

function renderType(text) {
  switch (text) {
    case 1:
      return '消费者引导';
    case 2:
      return '合伙人引导';
    default:
      return '类型错误';
  }
}

function renderOne(isNew, data) {
  var table = document.getElementById("table");

  var handlers = [{
    text: '修改',
    handler: onChange
  }, {
    text: '删除',
    handler: onDelete
  }];

  var renders = [null, {
    innerHTML: renderImgUrl
  }, null, {
      innerHTML: renderType
    }];

  var rowElem = buildRow(handlers, data, ["id", "imgUrl", "order", "type"], renders);

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

function onDelete(e, data) {
  get(`/app/guide/remove/${data.id}`).done(() => {
    var table = document.getElementById("table");
    table.removeChild(findOne(table, 0, data.id + ''));
  });
}

function renderAll(data) {
  var table = document.getElementById("table");
  var tableTitle = table.firstElementChild.cloneNode(true);
  table.innerHTML = "";
  table.appendChild(tableTitle);

  var handlers = [{
    text: '修改',
    handler: onChange
  }, {
    text: '删除',
    handler: onDelete
  }];

  var renders = [null, {
    innerHTML: renderImgUrl
  }, null, {
      innerHTML: renderType
    }];

  data.forEach(function (rowData) {
    var rowElem = buildRow(handlers, rowData, ["id", "imgUrl", "order", "type"], renders);
    table.appendChild(rowElem);
  });
}

(function () {
  get('/app/guide/list').done(responseMapper(renderAll));
})();