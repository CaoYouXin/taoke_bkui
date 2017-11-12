var loginBtn = document.getElementById('login');
(function () {
  var ut = getUserToken();
  if (ut.token) {
    setAsLogoutBtn();
  } else {
    setAsLoginBtn();
  }
  flushMenus();
})();

function setAsLoginBtn() {
  loginBtn.innerHTML = '登录';
  loginBtn.setAttribute('data-toggle', 'modal');
  loginBtn.setAttribute('data-target', '.login-modal-lg');
  loginBtn.removeEventListener('click', onLogout);
}

function setAsLogoutBtn() {
  loginBtn.innerHTML = '退出登录';
  loginBtn.removeAttribute('data-toggle');
  loginBtn.removeAttribute('data-target');
  loginBtn.addEventListener('click', onLogout);
}

function onLogout() {
  localStorage.setItem('user', '');
  setAsLoginBtn();
  flushMenus();
}

function onLogin() {
  var submitData = getJSONfromForm($('#login-form'));
  submitData.pwd = md5(submitData.pwd);

  post('/admin/user/login', submitData).done(responseMapper(function (data) {
    localStorage.setItem('user', JSON.stringify(data));
    setAsLogoutBtn();
    flushMenus();
  }));
}

function flushMenus() {
  var menuTable = document.getElementById('menus');
  menuTable.innerHTML = '';

  var ut = getUserToken();
  if (!ut.admin) {
    return;
  }

  var row = null, count = 0;
  ut.admin.role.menus.forEach(function (menu) {
    if (0 === count) {
      row = document.createElement('div');
      row.classList.add('row');
    }

    var cell = document.createElement('div');
    cell.classList.add('col-sm');

    cell.innerHTML = `<a class="btn btn-secondary" href="${menu.route}" target="_self">${menu.name}</a>`;

    row.appendChild(cell);

    count++;
    if (3 === count) {
      menuTable.appendChild(row);
      count = 0;
      row = null;
    }
  });

  if (row) {
    for (var i = 0; i < 3 - row.childNodes.length; i++) {
      var cell = document.createElement('div');
      cell.classList.add('col-sm');
      row.appendChild(cell);
    }
    menuTable.appendChild(row);
  }
}