/**
 * Карта объектов инфраструктуры
 */
(function(w){
	var PMap = function(){
		this.main = document.querySelector('.places');
		this.toggleButton = this.main.querySelector('.places__button');
		this.toggleOuter = this.main.querySelector('.places__outer');
		this.toggleClassName = 'open';
		this.activeClassName = 'active';
		this.toggleOpen = false;
		this.mapContainer = this.main.querySelector('.places__map');
		this.mainTemplateString = document.querySelector('#place-main-template').innerHTML;
		this.secondaryTemplateString = document.querySelector('#place-icon-template').innerHTML;
		this.balloonTemplateString = document.querySelector('#place-balloon-template').innerHTML;
		this.center = this.mapContainer.getAttribute('data-center').split(',');
		this.items = this.main.querySelectorAll('.places__item');
		this.secondaryPlacemarks = [];
		this.checkedFilters = [];

		/**
		 * Инициализируем карту
		 */
		this.initMap();

		/**
		 * Инициализируем менеджер объектов
		 */
		this.initObjectsManager();

		/**
		 * Добавляем центральную метку
		 */
		this.addMainPlacemark();

		/**
		 * Биндим обработчики событый с основным объектом PMap
		 */
		this.bindHandlers();

		/**
		 * Выпадающий список мест в мобильной версии
		 */
		this.addListeners();

		/**
		 * Производим запрос для вывода меток на карту
		 */
		this.getJSON('./json/places.json', this.updateObject);
	};

	var p = PMap.prototype;

	p.each = function(items, callback){
		[].forEach.call(items, callback);
	};

	p.getIcons = function(type){
		var self = this;

		this.icons = {};

		this.each(this.items, function(item){
			self.icons[item.getAttribute('data-places')] = item.querySelector('.places__icon').getAttribute('data-bg');
		});
	};

	p.updateObject = function(obj, status){
		if(typeof status === 'undefined'){
			this.object = obj;
			
			/**
			 * Получаем иконки из кнопок
			 */
			this.getIcons();

			/**
			 * Создаем значки объектов
			 */
			this.createMarks();
		}
	};

	/**
	 * Получаем нужный объект XMLHttp для работы с запросами
	 */
	p.getXmlHttp = function() {
		var xmlhttp;
		try {
			xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try {
				xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (E) {
				xmlhttp = false;
			}
		}
		if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
			xmlhttp = new XMLHttpRequest();
		}

		return xmlhttp;
	};

	/**
	 * Запрос к серверу
	 */
	p.getJSON = function(url, callback) {
		var xhr = this.getXmlHttp();

		xhr.open('GET', url, true);
		xhr.responseType = 'json';

		xhr.onload = function() {
			if (xhr.status === 200) 
				callback(xhr.response);
			else 
				callback(xhr.response, xhr.status);
		};
		xhr.send();
	};

	/*
	* Добавляем в массив элементы необходимые для проверки на нажатие
	* Принимает массив который нужно дополнить и элементы, которые нужно добавить в массив
	*/
	p.completeTargetArray = function(arr, items) {
		var j = 0,
			arrLength = arr.length;
		for (var i = arrLength; i < items.length + arrLength; i++) {
			arr[i] = items[j];
			j++;
		}

		return arr;
	};

	/*
	* Проверка на нажатие допустимых элементов.
	* Принимает массив элементов и событие
	*/
	p.checkTargetElements = function(arr, event) {
		if (arr.length === 0) return false;

		var trigger = false;

		for (var i = 0; i < arr.length; i++) {
			if (event.target === arr[i] && !trigger) trigger = true;
		}

		return trigger;
	};

	/**
	 * Закрытие выпадающего списка при нажатии вне элемента списка
	 */
	p.toggleBodyHandler = function(e){
		if(!this.toggleOpen) return;

		var arr = this.completeTargetArray([this.toggleOuter, this.toggleButton], this.toggleOuter.querySelectorAll('*'));
		if (!this.checkTargetElements(arr, e)) this.toggleOuter.classList.remove(this.toggleClassName);
	};

	/**
	 * Нажатие на кнопку для открытия/закрытия выпадающего списка
	 */
	p.toggleHandler = function(e){
		this.toggleOuter.classList.toggle(this.toggleClassName);

		if(!this.toggleOuter.classList.contains(this.toggleClassName)) this.toggleOpen = false;
		if(this.toggleOuter.classList.contains(this.toggleClassName)) this.toggleOpen = true;
	};

	/**
	 * Наведение на цетральную метку
	 */
	p.centerMouseEnterHandler = function(e){
		if(!this.centerPlacemarkNode) this.centerPlacemarkNode = this.main.querySelector('.place-main');

		this.centerPlacemarkNode.classList.add(this.toggleClassName);
	};

	/**
	 * Выход курсора мыши из зоны цетральной метки
	 */
	p.centerMouseLeaveHandler = function(e){
		this.centerPlacemarkNode.classList.remove(this.toggleClassName);
	};

	/**
	 * Событие нажатия на один из элементов списка
	 */
	p.listItemClickHandler = function(e){
		e.preventDefault();

		// Меняем класс у кнопки
		e.target.classList.toggle(this.activeClassName);

		// Обозначаем выбранные элементы списка в массиве, с помощью которого и будем фильтровать объекты
		var str = e.target.getAttribute('data-places'),
			index = this.checkedFilters.indexOf(str);

		if(e.target.classList.contains(this.activeClassName)){
			this.checkedFilters.push(str);
		} else {
			if(index !== -1) this.checkedFilters.splice(index, 1);
		}

		var self = this;

		// Фильтруем объекты в зависимости от выбранных
		this.objectManager.setFilter(function(obj){
			if(self.checkedFilters.length === 0) return true;
			if(self.checkedFilters.indexOf(obj.type) !== -1 && self.checkedFilters.length > 0) return true;
		});
	};

	p.addListeners = function(){
		/**
		 * События выпадающего списка
		 */
		this.toggleButton.addEventListener('click', this.toggleHandler, false);
		document.body.addEventListener('click', this.toggleBodyHandler, false);

		/**
		 * События центральной метки
		 */
		this.centerPlacemark.events.add('mouseenter', this.centerMouseEnterHandler);
		this.centerPlacemark.events.add('mouseleave', this.centerMouseLeaveHandler);

		var self = this;

		/**
		 * События нажатия на один из элементов списка
		 */
		this.each(this.items, function(item, index){
			item.addEventListener('click', self.listItemClickHandler);
		});
	};

	p.bindHandlers = function () {
		this.toggleHandler = this.toggleHandler.bind(this);
		this.toggleBodyHandler = this.toggleBodyHandler.bind(this);
		this.centerMouseEnterHandler = this.centerMouseEnterHandler.bind(this);
		this.centerMouseLeaveHandler = this.centerMouseLeaveHandler.bind(this);
		this.listItemClickHandler = this.listItemClickHandler.bind(this);
		this.updateObject = this.updateObject.bind(this);
	};

	p.initMap = function(){
		this.map = new ymaps.Map(this.mapContainer, {
			center: this.center,
			zoom: 15,
			controls: []
		}, {
			suppressMapOpenBlock: true
		});
	};

	p.initObjectsManager = function(){
		this.objectManager = new ymaps.ObjectManager({
			clusterize: true,
			geoObjectOpenBalloonOnClick: true,
			clusterOpenBalloonOnClick: false
		});

		this.map.geoObjects.add(this.objectManager);
	};

	p.addMainPlacemark = function(){
		this.mainTemplate = ymaps.templateLayoutFactory.createClass(this.mainTemplateString);

		this.centerPlacemark = new ymaps.Placemark(this.center, {}, {
			iconLayout: this.mainTemplate,
			// Описываем фигуру активной области "Прямоугольник".
			iconShape: {
				type: 'Polygon',
				// Прямоугольник описывается в виде двух точек - верхней левой и нижней правой.
				coordinates: [
					[
						[0, 0], 
						[-23, -20], [-31, -31], [-36, -41], [-38, -54], [-36, -66], [-31, -76], [-24, -84], [-13, -89], 
						[0, -91],
						[13, -89], [24, -84], [31, -76], [36, -66], [38, -54], [36, -41], [31, -31], [23, -20]
					]
				]
			},
			zIndex: 10
		});

		this.map.geoObjects.add(this.centerPlacemark);
	};

	/**
	 * Удаление старых и добавление новых точек на карте
	 */
	p.createMarks = function(){
		var self = this;

		var circleLayout = ymaps.templateLayoutFactory.createClass(this.secondaryTemplateString, {
			/**
			 * Указываем радиус активной области
			 */
			build: function(){
				balloonLayout.superclass.build.call(this);

				var width = this.getParentElement().querySelector('.place-icon').offsetWidth;

				this.getData().options.set('shape', {type: 'Circle', coordinates: [0, 0], radius: width / 2});

				// Если это кластер, добавляем к нему класс
				if(this.getData().type === 'Cluster') this.getData().properties.classname = 'place-icon_cluster';
			},
		});

		var balloonLayout = ymaps.templateLayoutFactory.createClass(this.balloonTemplateString, {
			/**
			 * Закрытие баллуна при нажатии на кнопку закрытия
			 */
			build: function(){
				balloonLayout.superclass.build.call(this);

				var self = this;

				this.getParentElement().querySelector('.place-balloon__close').addEventListener('click', function(e){
					e.preventDefault();
					self.events.fire('userclose');
				}, false);
			},
		});

		/**
		 * Делаем лейаут для кластерных иконок
		 */
		this.objectManager.clusters.options.set({
			clusterIconLayout: circleLayout,
			zIndex: 2
		});

		/**
		 * Перебираем объект с данными
		 */
		var currentId = 0;

		for (var key in this.object){

			this.each(this.object[key], function(item){
				// Если нет иконок для данного типа объектов, просто не добавляем их в массив
				if(!self.icons[key]) return;

				var text = item.type;

				// Указываем текст в зависимости от того, что есть в объекте, полученном в json
				if(item.schedule) text = item.schedule;
				else if(item.address) text = item.address;

				self.secondaryPlacemarks.push({
					type: key,
					id: currentId++,
					geometry: {
						type: 'Point',
						coordinates: item.coords
					},
					properties: {
						// icon: self.activeIcon,
						icon: self.icons[key],
						title: item.name,
						text: text
					},
					options: {
						iconLayout: circleLayout,
						balloonShadow: false,
						balloonLayout: balloonLayout,
						balloonPanelMaxMapArea: 0,
						// Не скрываем иконку при открытом балуне.
						hideIconOnBalloonOpen: false,
						// И дополнительно смещаем балун, для открытия над иконкой.
						balloonOffset: [0, 0],
						zIndex: 1
					}
				});
			});
		}

		this.objectManager.add(this.secondaryPlacemarks);
	};

	w.PMap = PMap;
})(window);