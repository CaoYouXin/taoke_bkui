function openFileUploader() {
  var fileUploader = document.getElementById('fileUploader');
  fileUploader.click();
}

function onFileUploaderChange() {
  var fileUploader = document.getElementById('fileUploader');
  var fileName = document.getElementById('fileName');

  upload($('#uploader')).done((data, status) => {
    console.log(data, status);
    data = JSON.parse(data);
    Object.keys(data).forEach(key => {
      fileName.value = data[key];
    });
    fileUploader.value = '';
  });
}

function onSubmit() {
  var submitData = getJSONfromForm($('#table-form'));

  post(`/tbk/order/upload`, submitData.fileName)
    .done(responseMapper((data) => {

      alert('Status GOOD!! 同步完成！');
    }));
}