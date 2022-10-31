/**
 * Методы для сокращения синтаксиса (замена jQuery)
 */
import { qS, addClass, removeClass, hasClass, each } from '../cuts';
import { bb, transfer, catalog, catalogMap} from '../globals';

(function (w) {
	const CatalogMapController = function () {

		this.main = qS('.catalog');
		this.wrapper = this.main.querySelector('.map');
		this.mapNode = this.wrapper.querySelector('.map__main');
		this.placemarkAttr = 'data-placemark';
		this.zoom = 14;

		const center = this.mapNode.getAttribute('data-center').trim().replace(/\s/g, '');

		this.center = center !== '' ? center.split(',') : [55.729199, 37.574534];

		// Темплейты объектов на карте
		this.single = this.wrapper.querySelector('#map-single').innerHTML;
		this.couple = this.wrapper.querySelector('#map-couple').innerHTML;
		this.priced = this.wrapper.querySelector('#map-priced').innerHTML;

		// Окно для показа объектов с карты
		this.modal = this.wrapper.querySelector('.map-modal');
		this.modalTitle = this.wrapper.querySelector('.map-modal__title b');
		this.modalOuter = this.wrapper.querySelector('.map-modal__outer');

		this.currentId = 0;
		this.objects = [];

		/**
		 * Создаем карту ymaps
		 */
		this.initMap();

		/**
		 * Инициализируем менеджер объектов
		 */
		this.initObjectsManager();

		/**
		 * Биндим обработчики событий с этим объектом
		 */
		this.bindHandlers();

		/**
		 * Объявляем события
		 */
		this.addListeners();
	};

	const p = CatalogMapController.prototype;

	p.initMap = function () {
		this.map = new ymaps.Map(this.mapNode, {
			center: this.center,
			zoom: this.zoom,
			controls: ['zoomControl'],
			maxAnimationZoomDifference: Infinity
		}, {
			suppressMapOpenBlock: true,
			yandexMapDisablePoiInteractivity: true,
			zoomControlPosition: {
				right: 20,
				top: 30
			},
			zoomControlSize: 'large'
		});
		
		catalogMap = this;

		// Задаем событие инита карты
		this.main.dispatchEvent(this.getEventObject('mapLoaded'));
	};

	p.initObjectsManager = function () {
		this.objectManager = new ymaps.ObjectManager({
			clusterize: false,
			geoObjectOpenBalloonOnClick: false,
			clusterOpenBalloonOnClick: false
		});

		this.map.geoObjects.add(this.objectManager);
	};

	/**
	 * Получаем эвент, который будет работать в ie11
	 */
	p.getEventObject = function (str) {
		let event;
		if (typeof(Event) === 'function') {
			event = new Event(str);
		} else {
			event = document.createEvent('Event');
			event.initEvent(str, true, true);
		}

		return event;
	};

	/**
	 * Сокращаем число
	 */
	p.formatCash = function (n) {
		if (n < 1e3) return n;
		if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + " тыс";
		if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + " млн";
		if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + " млрд";
		if (n >= 1e12) return +(n / 1e12).toFixed(1) + " трлн";
	};

	/**
	 * Получение базовой информации о карте
	 */
	p.getMapInfo = function () {
		const bounds = this.map.getBounds();
		return {
			zoom:        this.zoom, 
			leftTop:     [bounds[1][0], bounds[0][1]], 
			rightBottom: [bounds[0][0], bounds[1][1]]
		};
	};

	/**
	 * Создаем координаты оверлея для priced иконки (0 элемент массива - тело значка, 1 элемент массива - ножка значка)
	 */
	p.getAreaCoords = function (el) {
		const width = el.offsetWidth,
			height = el.offsetHeight,
			left = width / 2,
			top = -height;
		return [
			[
				[-left, -15],
				[-left, top],
				[left, top],
				[left, -15]
			],
			[
				[-10, 0],
				[-10, -15],
				[10, -15],
				[10, 0]
			]
		];
	}

	/**
	 * Данные карты для запроса к серверу
	 */
	p.getMapRequestString = function () {
		let info = this.getMapInfo(),
			string = '&zoom=' + info.zoom;

		string += '&leftTopLat=' + info.leftTop[0];
		string += '&leftTopLong=' + info.leftTop[1];
		string += '&rightBottomLat=' + info.rightBottom[0];
		string += '&rightBottomLong=' + info.rightBottom[1];

		return string;
	};

	/**
	 * Скрываем объекты за пределами области видимости
	 */
	p.controlObjectViewing = function () {
		const info = this.getMapInfo();

		this.objectManager.setFilter(function(obj){
			const coords = obj.geometry.coordinates;
			return coords[0] < info.leftTop[0]
				&& coords[0] > info.rightBottom[0]
				&& coords[1] > info.leftTop[1]
				&& coords[1] < info.rightBottom[1];
		});
	};

	/**
	 * Событие изменения зума или положения карты
	 */
	p.boundsChangeHandler = function () {
		this.zoom = this.map.getZoom();
		// this._prependScreenCoords = this.getScreenPolygon();
		
		// Скрываем объекты за пределами видимости карты
		this.controlObjectViewing();

		// Создаем событие изменения карты
		this.main.dispatchEvent(this.getEventObject('mapChanged'));
	};

	/**
	 * Событие нажатия на один из объектов на карте
	 */
	p.geoObjectsClickHandler = function (e) {
		let id = e.get('objectId'),
			object = this.objectManager.objects.getById(id),
			center = object.geometry.coordinates,
			zoom = this.zoom,
			inner = this.wrapper.querySelector('[' + this.placemarkAttr + '="' + id + '"]'),
			newZoom = 11;

		// Если зум маленький, то приближаем, если большой, то отмечаем активный объект и открываем окно
		if (zoom <= 12){
			if (zoom <= 12) newZoom = 14;
			if (zoom <= 10) newZoom = 12;
			this.map.setCenter(center, newZoom, {
				duration: 300
			});
		} else {
			const allPlacemarks = this.wrapper.querySelectorAll('[' + this.placemarkAttr + ']');

			each(allPlacemarks, function(placemark){
				removeClass(placemark, 'active');
				removeClass(placemark, 'selected');
			});

			addClass(inner, 'active');
			addClass(inner, 'selected');

			// Включаем загрузку на модалке
			addClass(this.modal, 'loading');
			
			// В зависимости от размера окна открываем модалку либо на карте, либо в отдельном модальном окне
			if ((document.body.offsetWidth + bb.bar) <= 1199) transfer.make(this.modal); 
			else this.modal.Toggle.open();

			// Осуществляем запрос
			catalog.createRequest(null, object.properties.id);
		}
	};

	/**
	 * Событие движения мыши над объектами
	 */
	p.geoObjectsMouseHandler = function (e) {
		const type = e.get('type'),
			inner = this.wrapper.querySelector('[' + this.placemarkAttr + '="' + e.get('objectId') + '"]');

		if (type === 'mouseenter' && !hasClass(inner, 'selected'))
			addClass(inner, 'active');

		if (type === 'mouseleave' && !hasClass(inner, 'selected'))
			removeClass(inner, 'active');
	};

	p.addListeners = function () {
		this.map.events.add("boundschange", this.boundsChangeHandler);
		this.map.geoObjects.events.add('click', this.geoObjectsClickHandler);
		this.map.geoObjects.events.add('mouseenter', this.geoObjectsMouseHandler);
		this.map.geoObjects.events.add('mouseleave', this.geoObjectsMouseHandler);
	};

	p.bindHandlers = function () {
		this.boundsChangeHandler = this.boundsChangeHandler.bind(this);
		this.geoObjectsClickHandler = this.geoObjectsClickHandler.bind(this);
		this.geoObjectsMouseHandler = this.geoObjectsMouseHandler.bind(this);
	};

	p.getCountCollapsed = function (count) {
		return parseInt(count) > 9 ? '9+' : count;
	};

	p.getStringedCount = function (price, count) {
		const priceStr = this.formatCash(price).replace('.', ','),
			countStr = this.getCountCollapsed(count);

		return parseInt(count) > 1 ? '<span>' + countStr + '</span>' + priceStr : priceStr;
	};

	p.getTemplate = function (zoom, count) {
		if (zoom <= 21 && zoom > 14) return this.priced;

		if (zoom <= 14 && zoom > 12 && count > 1) return this.couple;

		if (zoom <= 14 && zoom > 12 && count === 1) return this.single;

		if (zoom <= 12) return this.single;
	};

	p.buildPoint = function (_this, layout, zoom) {
		const inner = _this.getElement().firstElementChild;

		inner.setAttribute('data-placemark', _this.getData().id);

		if (zoom < 15) {
			_this.getData().options.set('shape', {
				type: 'Circle', 
				coordinates: [0, 0], 
				radius: inner.offsetWidth / 2,
				fillColor: '#00FF00',
			});
		} else {
			_this.getData().options.set('shape', {
				type: 'Polygon', 
				coordinates: this.getAreaCoords(inner),
			});
		}
	};

	p.getPointLayout = function (zoom, count) {
		const self = this,
			layout = ymaps.templateLayoutFactory.createClass(this.getTemplate(zoom, count), {
				build: function () {
					layout.superclass.build.call(this);

					self.buildPoint(this, layout, zoom);
				}
			});

		return layout;
	};

	p.update = function (data) {
		const self = this;

		removeClass(this.wrapper, 'loading');
		
		if(data.count || data.count === 0) {
			this.objectManager.removeAll();
			this.objects = [];

			each(data.data, function (item) {
				self.objects.push({
					type: 'Feature',
					id: self.currentId++,
					geometry: {
						type: 'Point',
						coordinates: [parseFloat(item.lat), parseFloat(item.lon)]
					},
					properties: {
						objectsCount: self.getCountCollapsed(item.count),
						id: item.id,
						stringedCount: self.getStringedCount(item.min_price, item.count),
						zoom: data.zoom,
					},
					options: {
						iconLayout: self.getPointLayout(data.zoom, parseInt(item.count)),
						hasBalloon: false,
						zIndex: 1
					}
				});
			});

			this.objectManager.add({
				type:"FeatureCollection",
				features: this.objects,
			});
		} else {
			// Скроллим наверх
			this.modalOuter.scroll(0, 0);
			// Чистим окно
			this.modalOuter.innerHTML = '';
			// Обновляем заголовок окна с объектами
			catalog.updateCatalogCounter(data.length, this.modalTitle);
			// Добавляем карточки элементов в окно
			catalog.createListItems(data, this.modalOuter, 'map-modal');
			// Выключаем загрузку
			removeClass(this.modal, 'loading');
		}
		
	};

	w.CatalogMapController = CatalogMapController;
})(window);