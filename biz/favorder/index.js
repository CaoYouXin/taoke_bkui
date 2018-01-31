let wrapper = document.getElementById('table');
let favId = document.getElementById('favId');
let favTitle = document.getElementById('favTitle');
let selected = document.getElementById('selected');
let unselected = document.getElementById('unselected');

(() => {
  get('/tbk/fav/list/1').done(responseMapper(renderFavList));
})();

function renderFavList(data) {
  wrapper.innerHTML = '';
  data.forEach(function (datum) {
    table.appendChild(renderFav(datum));
  });
}

function renderFav(datum) {
  let wrapper = document.createElement('DIV');
  wrapper.classList.add('col-4');
  wrapper.classList.add('fav');

  let innerWrapper = document.createElement('DIV');
  innerWrapper.onclick = () => {
    favClicked(datum);
  };
  wrapper.appendChild(innerWrapper);

  let title = document.createElement('H3');
  title.classList.add('mt-3');
  title.classList.add('text-cut');
  title.innerHTML = datum['favoritesTitle'];
  innerWrapper.appendChild(title);

  let typeWrapper = document.createElement('DIV');
  typeWrapper.classList.add('mb-3');
  innerWrapper.appendChild(typeWrapper);

  let type = document.createElement('SPAN');
  type.classList.add('badge');
  type.classList.add(renderTypeClass(datum['type']));
  type.innerHTML = renderType(datum['type']);
  typeWrapper.appendChild(type);

  return wrapper;
}

function renderType(type) {
  switch (type) {
    case 1: return '普通选品';
    case 2: return '高佣选品';
    default: throw new Error('unkonwn type');
  }
}

function renderTypeClass(type) {
  switch (type) {
    case 1: return 'badge-info';
    case 2: return 'badge-warning';
    default: throw new Error('unkonwn type');
  }
}

function favClicked(datum) {
  let favIdNum = datum['favoritesId'];
  $(favId).val(favIdNum);
  $(favTitle).val(datum['favoritesTitle']);
  get(`/tbk/fav/${favIdNum}/list/all`).done(responseMapper(renderFavItems));
  $('.table-modal-lg').modal({ show: true });
}

function renderFavItems(data) {
  let orders = data['orders'];
  let items = data['items'];
  selected.innerHTML = '';
  unselected.innerHTML = '';
  items.forEach(function (item) {
    let isSelected = orders.some(function (numIid) {
      return item['numIid'] === numIid;
    });

    if (!isSelected) {
      unselected.appendChild(renderUnselectedFavItem(item));
    }
  });
  orders.forEach(function (numIid) {
    let item = items.find(function (item) {
      return item['numIid'] === numIid;
    });

    if (!item) {
      return;
    }

    selected.appendChild(renderSelectedFavItem(item));
  });
}

function renderSelectedFavItem(item) {
  let wrapper = document.createElement('DIV');
  wrapper.classList.add('col-4');
  wrapper.classList.add('selected-fav-item');
  wrapper.setAttribute('data-rel', item['numIid']);

  let innerWrapper = document.createElement('DIV');
  innerWrapper.classList.add('card');
  wrapper.appendChild(innerWrapper);

  let imageTop = document.createElement('IMG');
  imageTop.classList.add('card-img-top');
  imageTop.setAttribute('src', item['pictUrl']);
  innerWrapper.appendChild(imageTop);

  let cardBody = document.createElement('DIV');
  cardBody.classList.add('card-body');
  innerWrapper.appendChild(cardBody);

  let title = document.createElement('P');
  title.classList.add('card-text');
  title.innerHTML = item['title'];
  title.setAttribute('title', item['title']);
  cardBody.appendChild(title);

  let btnGroup = document.createElement('DIV');
  btnGroup.classList.add('btn-group');
  btnGroup.setAttribute('role', 'group');
  cardBody.appendChild(btnGroup);

  let leftBtn = document.createElement('button');
  leftBtn.classList.add('btn');
  leftBtn.classList.add('btn-primary');
  leftBtn.setAttribute('type', 'button');
  leftBtn.innerHTML = '向前移动';
  leftBtn.onclick = (e) => {
    selectedFavItemMove(e.target.parentElement.parentElement.parentElement.parentElement, true);
  };
  btnGroup.appendChild(leftBtn);

  let delBtn = document.createElement('button');
  delBtn.classList.add('btn');
  delBtn.classList.add('btn-danger');
  delBtn.setAttribute('type', 'button');
  delBtn.innerHTML = '删除';
  delBtn.onclick = () => {
    selectedFavItemClicked(item);
  };
  btnGroup.appendChild(delBtn);

  let rightBtn = document.createElement('button');
  rightBtn.classList.add('btn');
  rightBtn.classList.add('btn-primary');
  rightBtn.setAttribute('type', 'button');
  rightBtn.innerHTML = '向后移动';
  rightBtn.onclick = (e) => {
    selectedFavItemMove(e.target.parentElement.parentElement.parentElement.parentElement, false);
  };
  btnGroup.appendChild(rightBtn);

  return wrapper;
}

// direction==true : left
function selectedFavItemMove(elem, direction) {
  var toInsertBefore = null;
  if (direction) {
    toInsertBefore = elem.previousSibling;
  } else {
    toInsertBefore = elem.nextSibling;
  }

  if (null == toInsertBefore) {
    return;
  }

  if (!direction) {
    toInsertBefore = toInsertBefore.nextSibling;
  }
  elem.parentElement.insertBefore(elem, toInsertBefore);
}

function selectedFavItemClicked(item) {
  selected.removeChild(findOne(selected, locateCard, item['pictUrl']));
  if (unselected.childElementCount === 0) {
    unselected.appendChild(renderUnselectedFavItem(item));
  } else {
    unselected.insertBefore(renderUnselectedFavItem(item), unselected.childNodes[0]);
  }

  get(`/home/fav/order/del/${$(favId).val()}/${item['numIid']}`);
}

function renderUnselectedFavItem(item) {
  let wrapper = document.createElement('DIV');
  wrapper.classList.add('col-3');
  wrapper.classList.add('unselected-fav-item');

  let innerWrapper = document.createElement('DIV');
  innerWrapper.classList.add('card');
  innerWrapper.onclick = () => {
    unselectedFavItemClicked(item);
  };
  wrapper.appendChild(innerWrapper);

  let imageTop = document.createElement('IMG');
  imageTop.classList.add('card-img-top');
  imageTop.setAttribute('src', item['pictUrl']);
  innerWrapper.appendChild(imageTop);

  let cardBody = document.createElement('DIV');
  cardBody.classList.add('card-body');
  innerWrapper.appendChild(cardBody);

  let title = document.createElement('P');
  title.classList.add('card-text');
  title.innerHTML = item['title'];
  title.setAttribute('title', item['title']);
  cardBody.appendChild(title);

  return wrapper;
}

function unselectedFavItemClicked(item) {
  unselected.removeChild(findOne(unselected, locateCard, item['pictUrl']));
  if (selected.childElementCount === 0) {
    selected.appendChild(renderSelectedFavItem(item));
  } else {
    selected.insertBefore(renderSelectedFavItem(item), selected.childNodes[0]);
  }
}

function locateCard(node) {
  let card = node.childNodes[0];
  let cardImg = card.childNodes[0];
  return cardImg.getAttribute('src');
}

function onSubmit() {
  var idx = selected.childElementCount;
  selected.childNodes.forEach(function (node) {
    post('/home/fav/order/set', {
      favoriteId: $(favId).val(),
      order: idx--,
      numIid: node.getAttribute('data-rel')
    });
  });
}
