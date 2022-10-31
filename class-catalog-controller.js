/**
 * Методы для сокращения синтаксиса (замена jQuery)
 */
import { qS, addClass, removeClass, toggleClass, hasClass, each } from '../cuts';
import { lazyLoadInstance, mmodal, toggle, carousel, transfer, catalog, catalogMap, jsr, request } from '../globals';

(function(w){
	const CatalogController = function () {
		this.main = qS('.catalog');
		this.mapWrapper = this.main.querySelector('.map');
		this.listWrapper = this.main.querySelector('.catalog__list');
		this.listContainer = this.main.querySelector('.catalog__items');
		this.counter = this.main.querySelector('.catalog__counter span');
		this.more = this.main.querySelector('.catalog__more');
		this.form = this.main.querySelector('.filters');
		this.offerTemplate = jsr.templates("#offer-template");
		this.openClassName = 'open';
		this.pagedAttr = 'data-page';
		this.willChange = false;
		this.isMap = false;
		this.loadingClassName = 'loading';
		this.allClassName = 'all-loaded';

		this.updateFormData();
		this.bindHandlers();
		this.initChanger();
		this.addListeners();

		catalog = this;

		// Если пусто, то убираем кнопку и указываем, что все загружено
		if (this.listContainer.innerHTML.trim().length === 0) {
			addClass(this.main, this.allClassName);
		}
	};

	const p = CatalogController.prototype;

	p.getFormString = function () {
		let i;
		let arr = Array.from(this.formData),
			string = '';

		// Убираем пробелы из чисел
		for (i = 0; i < arr.length; i++)
			if (/[0-9]\s/.test(arr[i][1].trim())) arr[i][1] = arr[i][1].replace(/\s/g, '');

		// Добавляем в строку только не пустые значения
		for (i = 0; i < arr.length; i++) {
			if (arr[i][1].trim().length !== 0){
				if (string.length === 0) string = arr[i][0] + '=' + arr[i][1];
				else string += '&' + arr[i][0] + '=' + arr[i][1];
			}
		}

		return string;
	};

	/**
	 * Правильное окончание слов с цифрами
	 */
	p.declOfNum = function (number, words) {
		return words[(number % 100 > 4 && number % 100 < 20) ? 2 : [2, 0, 1, 1, 1, 2][(number % 10 < 5) ? number % 10 : 5]];
	};

	/**
	 * Обновляем количество найденных элементов в счетчике
	 */
	p.updateCatalogCounter = function (num, wrapper) {
		wrapper.innerHTML = num +' '+ this.declOfNum(num, ['объект', 'объекта', 'объектов']);
	};

	/**
	 * Обработчик переключателя списка и карты
	 */
	p.changerHandler = function (e) {
		if (e) {
			e.preventDefault();
			toggleClass(this.changer.button, this.changer.list);
			toggleClass(this.changer.button, this.changer.map);
		}

		if (hasClass(this.changer.button, this.changer.list)) {
			addClass(this.mapWrapper, this.openClassName);
			removeClass(this.listWrapper, this.openClassName);
			this.isMap = true;
		} else {
			removeClass(this.mapWrapper, this.openClassName);
			addClass(this.listWrapper, this.openClassName);
			this.isMap = false;

			removeClass(this.main, this.loadingClassName);
		}

		/**
		 * Если было нажатие и были изменения в фильтре, производим запрос
		 */
		if (e && this.willChange) {
			this.willChange = false;
			this.createRequest();
		}

		carousel.update();
	};

	/**
	 * Запуск кнопки переключения
	 */
	p.initChanger = function () {
		this.changer = {
			button: this.main.querySelector('.catalog__change'),
			list:   'catalog__change_list',
			map:    'catalog__change_map'
		};

		this.changerHandler();
		this.changer.button.addEventListener('click', this.changerHandler, false);
	};

	p.createListItems = function (data, wrapper, className) {
		const self = this;

		each(data, function(item){
			item.className = className;
			item.price = parseInt(item.price).toLocaleString();
			item.images = JSON.parse(item.images);

			wrapper.innerHTML += self.offerTemplate.render(item);
		});

		carousel.update();
		toggle.update();
		lazyLoadInstance.update();
	};

	p.afterRequestHandler = function (data, status) {
		if (data.count) {
			this.updateCatalogCounter(parseInt(data.count), this.counter);
			removeClass(this.main, this.loadingClassName);
		}

		if (!this.isMap) {
			if (data.next === 'all') addClass(this.main, this.allClassName);
			else removeClass(this.main, this.allClassName);
			// Прибавляем страницу на 1
			this.main.setAttribute(this.pagedAttr, (parseInt(this.main.getAttribute(this.pagedAttr)) + 1));

			// Добавляем элементы в список
			this.createListItems(data.data, this.listContainer, 'catalog');
		} else {
			catalogMap.update(data);
		}
	};

	/**
	 * Производим запрос к серверу
	 */
	p.createRequest = function (e, id) {
		// Если открыта не карта, запрещаем события карты
		if (e) {
			if ((!this.isMap && e.type === 'mapLoaded') || (!this.isMap && e.type === 'mapChanged')) return;
		}

		addClass(this.main, this.loadingClassName);

		if (!this.isMap && parseInt(this.main.getAttribute(this.pagedAttr)) === 0)
			this.listContainer.innerHTML = '';

		let url = '';

		if (this.isMap && !id) {
			url = request.url + '?' + this.getFormString() + catalogMap.getMapRequestString();
		} else if (!this.isMap && !id) {
			url = request.url + '?' + this.getFormString() + '&page=' + (parseInt(this.main.getAttribute(this.pagedAttr)) + 1);
		} else if (this.isMap && id) {
			url = request.url + '?offerIds=' + id;
		}

		request.getJSON(url, this.afterRequestHandler);
	};

	/**
	 * Обновляем форму в объекте
	 */
	p.updateFormData = function () {
		this.formData = new FormData(this.form);
	};

	/**
	 * Обработчик события сабмита фильтров
	 */
	p.formHandler = function (e) {
		e.preventDefault();

		this.willChange = true;

		this.main.setAttribute(this.pagedAttr, 0);

		mmodal.close();

		this.updateFormData();

		this.createRequest();
	};

	p.addListeners = function () {
		this.main.addEventListener('mapLoaded', this.createRequest);
		this.main.addEventListener('mapChanged', this.createRequest);
		this.form.addEventListener('submit', this.formHandler);
		this.more.addEventListener('click', this.createRequest);
	};

	p.bindHandlers = function () {
		this.changerHandler = this.changerHandler.bind(this);	
		this.createRequest = this.createRequest.bind(this);
		this.formHandler = this.formHandler.bind(this);
		this.afterRequestHandler = this.afterRequestHandler.bind(this);
	};

	w.CatalogController = CatalogController;
})(window);