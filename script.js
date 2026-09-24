'use strict';
(function () {
  const config = window.SITE_CONFIG || {};
  const select = document.getElementById('product');
  const quantity = document.getElementById('qty');
  const form = document.getElementById('lead-form');
  const status = form.querySelector('[role="status"]');
  const submit = form.querySelector('[type="submit"]');
  const catalog = document.querySelector('.catalog');
  const format = n => new Intl.NumberFormat('ru-RU').format(n);
  const arrow = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7h10v10"></path><path d="M7 17 17 7"></path></svg>';

  // Цены: 80% от прайса ЖБИ Маркет / ООО «Металл-Строй», округление до рубля.
  const products = [
    {id:'ПАГ-14', category:'ПАГ', label:'Аэродромная плита', dimensions:'6000 × 2000 × 140 мм', area:12, price:17152, popularity:96, description:'Для площадок, подъездных путей и аэродромных покрытий.'},
    {id:'ПАГ-18', category:'ПАГ', label:'Аэродромная плита', dimensions:'6000 × 2000 × 180 мм', area:12, price:22090, popularity:91, description:'Для промышленных объектов и покрытий под тяжёлую технику.'},
    {id:'ПАГ-20', category:'ПАГ', label:'Аэродромная плита', dimensions:'6000 × 2000 × 200 мм', area:12, price:42336, popularity:72, description:'Усиленный формат для высоких нагрузок и постоянных проездов.'},
    {id:'ПДН 6 × 2', category:'ПДН', label:'Дорожная плита', dimensions:'6000 × 2000 мм', area:12, price:12104, popularity:94, description:'Крупный формат для временных дорог и стройплощадок.'},
    {id:'ПДН 6 × 1,75', category:'ПДН', label:'Дорожная плита', dimensions:'6000 × 1750 мм', area:10.5, price:16474, popularity:67, description:'Рациональный формат для технологических проездов и баз.'},
    {id:'ПДН 3 × 1,75', category:'ПДН', label:'Дорожная плита', dimensions:'3000 × 1750 мм', area:5.25, price:11113, popularity:89, description:'Для подъездов, парковок и обустройства территории.'},
    {id:'ПДН 3 × 1,5', category:'ПДН', label:'Дорожная плита', dimensions:'3000 × 1500 мм', area:4.5, price:9677, popularity:93, description:'Компактный формат для проездов и небольших площадок.'},
    {id:'ПДН 2 × 1,5', category:'ПДН', label:'Дорожная плита', dimensions:'2000 × 1500 мм', area:3, price:7258, popularity:64, description:'Удобна для локального ремонта, въездов и узких участков.'},
    {id:'ПДП 3 × 1,75', category:'ПДП', label:'Плита дорожная', dimensions:'3000 × 1750 мм', area:5.25, price:4744, popularity:84, description:'Для постоянных дорог, парковок и благоустройства территории.'},
    {id:'ПДП 3 × 1,5', category:'ПДП', label:'Плита дорожная', dimensions:'3000 × 1500 мм', area:4.5, price:5432, popularity:78, description:'Универсальный формат для дорог с умеренной нагрузкой.'},
    {id:'ПДП 3 × 1,2', category:'ПДП', label:'Плита дорожная', dimensions:'3000 × 1200 мм', area:3.6, price:3144, popularity:62, description:'Компактная плита для проходов, парковок и доборных участков.'},
    {id:'ПДП 1,5 × 1,75', category:'ПДП', label:'Плита дорожная', dimensions:'1500 × 1750 мм', area:2.625, price:3792, popularity:59, description:'Небольшой формат для локальных проездов и ремонта покрытия.'}
  ];

  function renderCard(product, index) {
    return '<article class="product" data-category="' + product.category + '" data-price="' + product.price + '" data-area="' + product.area + '" data-popularity="' + product.popularity + '">' +
      '<div class="product-name"><span class="num">' + String(index + 1).padStart(2, '0') + '</span><div><small>' + product.label + '</small><h3>' + product.id + '</h3></div></div>' +
      '<div class="spec"><strong>' + product.dimensions + '</strong><span>' + product.description + '</span></div>' +
      '<div class="price"><span>от</span> ' + format(product.price) + ' ₽<small>за 1 шт.</small></div>' +
      '<button class="product-button" data-product="' + product.id + '" type="button">Рассчитать ' + arrow + '</button></article>';
  }

  function populateSelect() {
    select.innerHTML = products.map(product => '<option value="' + product.id + '" data-price="' + product.price + '" data-area="' + product.area + '">' + product.id + '</option>').join('');
    select.value = 'ПАГ-14';
  }

  function setupCatalog() {
    const label = catalog.querySelector('.catalog-label');
    const note = catalog.querySelector('.note');
    if (note) note.textContent = 'Цены на новые плиты рассчитаны как 80% от опубликованных цен источника (скидка 20%), без доставки и разгрузки. Итоговая стоимость, наличие, исполнение и условия НДС уточняются при расчёте. Марку и несущую способность подбирают по проекту.';
    catalog.querySelectorAll(':scope > .product').forEach(product => product.remove());
    const tools = document.createElement('div');
    tools.className = 'catalog-tools';
    tools.innerHTML = '<div class="catalog-filters" role="group" aria-label="Фильтр по типу плит"><button type="button" class="filter-button active" data-filter="all">Все <span>' + products.length + '</span></button><button type="button" class="filter-button" data-filter="ПАГ">ПАГ <span>' + products.filter(p => p.category === 'ПАГ').length + '</span></button><button type="button" class="filter-button" data-filter="ПДН">ПДН <span>' + products.filter(p => p.category === 'ПДН').length + '</span></button><button type="button" class="filter-button" data-filter="ПДП">ПДП <span>' + products.filter(p => p.category === 'ПДП').length + '</span></button></div><label class="sort-control">Сортировка <select id="catalog-sort"><option value="popular">Сначала популярные</option><option value="price-asc">Сначала дешевле</option><option value="price-desc">Сначала дороже</option><option value="area-desc">По площади: от большей</option><option value="area-asc">По площади: от меньшей</option></select></label><span class="catalog-count" aria-live="polite"></span>';
    label.after(tools);
    const list = document.createElement('div');
    list.className = 'catalog-list';
    catalog.insertBefore(list, catalog.querySelector('.note'));
    let activeFilter = 'all';
    let sort = 'popular';

    function draw() {
      const shown = products.filter(product => activeFilter === 'all' || product.category === activeFilter).slice().sort((a, b) => {
        if (sort === 'price-asc') return a.price - b.price;
        if (sort === 'price-desc') return b.price - a.price;
        if (sort === 'area-desc') return b.area - a.area || b.popularity - a.popularity;
        if (sort === 'area-asc') return a.area - b.area || b.popularity - a.popularity;
        return b.popularity - a.popularity;
      });
      list.innerHTML = shown.map((product, index) => renderCard(product, index)).join('');
      tools.querySelector('.catalog-count').textContent = shown.length + ' ' + (shown.length === 1 ? 'позиция' : shown.length < 5 ? 'позиции' : 'позиций');
    }
    tools.addEventListener('click', event => {
      const button = event.target.closest('[data-filter]');
      if (!button) return;
      activeFilter = button.dataset.filter;
      tools.querySelectorAll('[data-filter]').forEach(item => item.classList.toggle('active', item === button));
      draw();
    });
    tools.querySelector('#catalog-sort').addEventListener('change', event => { sort = event.target.value; draw(); });
    draw();
  }

  function calculate() {
    const option = select.options[select.selectedIndex];
    const qty = Math.max(0, Number(quantity.value) || 0);
    document.getElementById('estimate-total').textContent = 'от ' + format(Number(option.dataset.price) * qty) + ' ₽';
    document.getElementById('estimate-area').innerHTML = format(Number(option.dataset.area) * qty) + ' м² покрытия<br>Без доставки и разгрузки';
  }

  populateSelect();
  setupCatalog();
  const assortmentFact = document.querySelector('.benefits b');
  if (assortmentFact) assortmentFact.textContent = products.length + ' востребованных типоразмеров';
  const privacyText = document.querySelector('#privacy details p');
  if (privacyText) privacyText.textContent = 'Оператор персональных данных: Общество с ограниченной ответственностью «ЛЕД ПРО ТРЕЙД» (ООО «ЛПТ»), ОГРН 1267800067820, ИНН 7811818424, КПП 781101001, 192012, г. Санкт-Петербург, вн. тер. г. муниципальный округ Обуховский, ул. Бабушкина, д. 131, к. 1, литера А, помещ. 3-Н. Имя, телефон, населённый пункт и параметры заказа используются для обработки запроса и обратной связи.';
  select.addEventListener('change', calculate);
  quantity.addEventListener('input', calculate);
  document.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => {
    quantity.value = Math.min(10000, Math.max(1, (Number(quantity.value) || 1) + Number(button.dataset.step)));
    calculate();
  }));
  document.querySelector('.catalog').addEventListener('click', event => {
    const button = event.target.closest('[data-product]');
    if (!button) return;
    select.value = button.dataset.product;
    calculate();
    document.getElementById('request').scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  });
  if (config.phone) {
    const phone = document.createElement('a');
    phone.href = 'tel:' + String(config.phone).replace(/[^+\d]/g, '');
    phone.textContent = config.phone;
    phone.className = 'text-link';
    document.querySelector('.footer-top').appendChild(phone);
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    status.textContent = '';
    const data = new FormData(form);
    const phone = String(data.get('phone') || '').replace(/\D/g, '');
    if (!/^[78]\d{10}$/.test(phone)) {
      status.textContent = 'Укажите телефон: 11 цифр, начиная с 7 или 8.';
      document.getElementById('phone').focus();
      return;
    }
    if (!config.leadEndpoint) {
      status.textContent = 'Отправка пока не подключена. Заявка не отправлена.';
      return;
    }
    if (location.protocol === 'file:' && !/^https?:\/\//.test(config.leadEndpoint)) {
      status.textContent = 'Для отправки через этот обработчик откройте сайт на хостинге. Заявка не отправлена.';
      return;
    }
    const params = new URLSearchParams(location.search);
    const attribution = {};
    ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','yclid'].forEach(k => { attribution[k] = params.get(k) || ''; });
    const payload = {name: String(data.get('name') || '').trim(), phone, city: String(data.get('city') || '').trim(), product: select.value, quantity: Number(quantity.value), comment: String(data.get('comment') || '').trim(), website: String(data.get('website') || ''), consent: document.getElementById('consent').checked, attribution};
    const original = submit.innerHTML;
    submit.disabled = true;
    submit.textContent = 'Отправляем…';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(config.leadEndpoint, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload), signal:controller.signal});
      const result = await response.json();
      if (!response.ok || result.ok !== true) throw new Error(result.error || 'Не удалось подтвердить отправку. Попробуйте ещё раз.');
      status.textContent = 'Заявка отправлена. Спасибо за ваш запрос!';
      window.dispatchEvent(new CustomEvent('lead_success', {detail:{product:select.value,quantity:Number(quantity.value)}}));
    } catch (error) {
      status.textContent = error.name === 'AbortError' ? 'Ответ не получен вовремя. Уточните получение заявки перед повторной отправкой.' : (error.message || 'Не удалось отправить заявку. Попробуйте ещё раз.');
    } finally { clearTimeout(timeout); submit.disabled = false; submit.innerHTML = original; }
  });
  calculate();
}());
