let preview = document.getElementById('preview');

(() => {
  $('.table-responsive').mCustomScrollbar({
    scrollButtons: { enable: true, scrollType: "stepped" },
    keyboard: { scrollType: "stepped" },
    mouseWheel: { scrollAmount: 188, normalizeDelta: true },
    theme: "rounded-dark",
    // autoExpandScrollbar: true,
    // snapAmount: 188,
    // snapOffset: 65,
    axis: "yx"
  });

  var editor = ace.edit("editor");
  editor.setTheme("ace/theme/monokai");
  editor.session.setMode("ace/mode/markdown");
  var converter = new showdown.Converter({ tables: true });

  var interval = null;
  $('.table-modal-lg').on('show.bs.modal', (e) => {
    editor.setValue('');
    interval = setInterval(() => {
      var content = editor.getValue();
      preview.innerHTML = converter.makeHtml(content);
    }, 1000);
  });

  $('.table-modal-lg').on('hidden.bs.modal', (e) => {
    clearInterval(interval);
    interval = null;
  });
})();