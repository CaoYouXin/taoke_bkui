function onSubmit() {
  var submitData = getJSONfromForm($('#menu-form'));
  submitData.pwd = md5(submitData.pwd);

  $.post(getAPI("/admin/super/set"), submitData)
    .done(function (data, status) {
      console.log("Data: ", data, "\nStatus: ", status);

      responseFilter(data).done(function (data) {
        alert(`超级管理员${data.name}创建成功`);
      });
    }).fail(ajaxOnFail);
}