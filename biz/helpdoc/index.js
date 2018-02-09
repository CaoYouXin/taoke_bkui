let table = document.getElementById('table');
let preview = document.getElementById('preview');
let fileUploader = document.getElementById('fileUploader');
let customFileLabel = document.getElementById('customFileLabel');
let colNames = ['id', 'title', 'path', 'order'];
let handles = [{
  text: '修改',
  cls: 'btn-primary',
  handler: onChange
}, {
  text: '删除',
  cls: 'btn-danger',
  handler: onDelete
}];
// $('.table-responsive').mCustomScrollbar({
//   scrollButtons: { enable: true, scrollType: "stepped" },
//   keyboard: { scrollType: "stepped" },
//   mouseWheel: { scrollAmount: 188, normalizeDelta: true },
//   theme: "rounded-dark",
//   // autoExpandScrollbar: true,
//   // snapAmount: 188,
//   // snapOffset: 65,
//   axis: "yx"
// });
let editor = ace.edit("editor");
// editor.setValue('');
// editor.setTheme("ace/theme/monokai");
// editor.session.setMode("ace/mode/markdown");
let converter = new showdown.Converter({ tables: true });

function onDelete(e, datum) {
  get(`/blog/helpdoc/del/${datum.id}`).done(responseMapper(() => {
    table.removeChild(findOne(table, 0, datum.id + ''));
  }));
}

function onChange(e, datum) {
  datum.fileName = datum.path.substring(
    lastIndexOfChar(datum.path, '/') + 1,
    lastIndexOfChar(datum.path, '.')
  );
  letJSONtoForm(datum, $('#table-form'));
  get(`/blog/raw/${datum.path.replace(/\//g, '&@&')}`).done(responseMapper((data) => {
    editor.setValue(data);
    $('.table-modal-lg').modal({ show: true });
  }));
}

function onCopy(e) {
  console.log(e.target.previousElementSibling.innerText);
  copyText(e.target.previousElementSibling.innerText);
  $(e.target).tooltip('enable');
  $(e.target).tooltip('show');
  setTimeout(() => {
    $(e.target).tooltip('disable');
  }, 1000);
}

function openFileUploader() {
  var fileUploader = document.getElementById('fileUploader');
  fileUploader.click();
}

function onFileUploaderChange() {
  upload($('#uploader')).done((data, status) => {
    console.log(data, status);
    data = JSON.parse(data);
    Object.keys(data).forEach(key => {
      customFileLabel.innerText = `![](${data[key]})`;
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
  if (!submitData.order) {
    delete submitData.order;
  } else {
    submitData.order = Number(submitData.order);
  }
  if (!submitData.fileName) {
    submitData.fileName = Date.now() + '';
  }
  submitData.content = `---\ntitle: ${submitData.title}\n---\n` + editor.getValue();

  post('/blog/helpdoc/post', submitData).done(responseMapper((data) => {
    let tr = buildTableRow(data, colNames, [], handles);
    if (!submitData.id) {
      table.appendChild(tr);
    } else {
      table.replaceChild(tr, findOne(table, 0, data.id + ''));
    }
  }));
}

var interval = null;
$('.table-modal-lg').on('show.bs.modal', (e) => {
  customFileLabel.innerText = '点击选择图片';
  interval = setInterval(() => {
    var content = editor.getValue();
    preview.innerHTML = converter.makeHtml(content.replace(/!\[(.*?)]\((.*?)\)/g, ($0, $1, $2) => {
      if (0 != $2.indexOf('http')) {
        return `![${$1}](${getCDN($2)})`;
      }
      return $0;
    }));
  }, 1000);
});

$('.table-modal-lg').on('hidden.bs.modal', (e) => {
  clearInterval(interval);
  interval = null;
});

(() => {
  get('/blog/helpdoc/list').done(responseMapper((data) => {
    table.innerHTML = "";
    data.forEach((datum) => {
      table.appendChild(buildTableRow(datum, colNames, [], handles));
    });
  }));
})();