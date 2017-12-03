function onPay(e, data) {
  if (data.payed) {
    return;
  }

  var confirmed = confirm("确定用户收到打款了吗？");
  if (!confirmed) {
    return;
  }

  get('/tbk/withdraw/response/' + data.id).done(responseMapper((data) => {
    
  }));
}

function renderOne(isNew, data) {
  var table = document.getElementById("table");

  var handlers = [{
    text: '已支付',
    handler: onPay
  }];

  var renders = [null, {
    innerHTML: renderUser
  }, null, null, {
      innerHTML: renderPayed
    }];

  var rowElem = buildRow(handlers, data, ["id", "user", "amount", "createTime", "payed", "payTime"], renders);

  if (!isNew) {
    table.replaceChild(rowElem, findOne(table, 0, data.id + ''));
  } else {
    table.appendChild(rowElem);
  }
}

function renderUser(user) {
  return `${user.name}(${user.realName})`;
}

function renderPayed(payed) {
  return payed ? "支付过" : "还未支付";
}

function renderAll(data) {
  var table = document.getElementById("table");
  var tableTitle = table.firstElementChild.cloneNode(true);
  table.innerHTML = "";
  table.appendChild(tableTitle);

  var handlers = [{
    text: '已支付',
    handler: onPay
  }];

  var renders = [null, {
    innerHTML: renderUser
  }, null, null, {
      innerHTML: renderPayed
    }];

  data.forEach(function (rowData) {
    var rowElem = buildRow(handlers, rowData, ["id", "user", "amount", "createTime", "payed", "payTime"], renders);
    table.appendChild(rowElem);
  });
}

(function () {
  get('/tbk/withdraw/request/list').done(responseMapper(renderAll));
})();