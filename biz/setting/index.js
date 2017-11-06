function onSubmit() {
  var submitData = getJSONfromForm($('#setting-form'));

  post('/tbk/setting', submitData)
    .done(responseMapper((data) => {

      toForm(data);
    }));
}

function toForm(data) {
  letJSONtoForm(data, $('#setting-form'));
}

(function () {
  get('/tbk/setting').done(responseMapper(toForm));
})();