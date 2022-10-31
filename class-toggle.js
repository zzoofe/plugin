/**
 * Методы для сокращения синтаксиса (замена jQuery)
 */
import { addClass, removeClass, hasClass, each } from '../cuts';

(function(w){
	const create = function (obj){

		/**
		 * Закрытие выпадающего списка при нажатии вне элемента списка
		 */
		const toggleBodyHandler = function (e) {
			if (!obj.toggleOpen) return;

			const arr = completeTargetArray([], obj.ignore);

			if (obj.outer) arr.push(obj.outer);

			each(obj.buttons, function (item) {
				arr.push(item);
			});

			if (!checkTargetElements(arr, e)) {
				removeClass(obj.element, obj.toggleClassName);

				each(obj.buttons, function (item) {
					removeClass(item, obj.toggleClassName);
				});

				if (obj.outer) removeClass(obj.outer, obj.toggleClassName);

				// Удаляем событие после закрытия
				document.body.removeEventListener('click', toggleBodyHandler, false);
			}
		};

		/**
		 * Нажатие на кнопку для открытия/закрытия выпадающего списка
		 */
		const toggleHandler = function () {
			if (!hasClass(obj.element, obj.toggleClassName)) {
				obj.open();
				obj.toggleOpen = true;
			} else {
				obj.close();
				obj.toggleOpen = false;
			}

			// Создаем событие клика по документу
			if (!obj.once && obj.toggleOpen && !obj.isInput)
				document.body.addEventListener('click', toggleBodyHandler, false);
		};

		if (obj.element.Toggle) return;

		obj.element.Toggle = obj;

		obj.open =  function open () {
			addClass(obj.element, obj.toggleClassName);

			each(obj.buttons, function(item){
				addClass(item, obj.toggleClassName);
			});

			if (obj.outer) addClass(obj.outer, obj.toggleClassName);
		};

		obj.close =  function close () {
			removeClass(obj.element, obj.toggleClassName);

			each(obj.buttons, function(item){
				removeClass(item, obj.toggleClassName);
			});

			if (obj.outer) removeClass(obj.outer, obj.toggleClassName);
		};

		each(obj.buttons, function(item){
			if (item.getAttribute('type') && hasClass(item, 'input-text')){
				obj.isInput = true;
				item.addEventListener('focus', toggleHandler, false);
				item.addEventListener('blur', toggleHandler, false);
			}else{
				item.addEventListener('click', toggleHandler, false);
			}
		});
	};
	const Toggle = function (elements) {
		this.elements = elements;
		this.update();
	};

	const p = Toggle.prototype;

	p.update = function() {
		if(typeof this.elements === 'undefined') return;

		let items;

		if (typeof this.elements === 'string') items = document.querySelectorAll(this.elements);
		else if (typeof this.elements === 'object' && typeof this.elements.length === 'undefined') items = [this.elements];

		each(items, this.initElement);
	};

	p.initElement = function(element){
		// Проверка на то, что родителем блока является данный контейнер для избежания конфликтов
		let outer = element.querySelector('.toggle-content');
		if (outer) if (outer.closest('.toggle') !== element) outer = null;

		const buttons = element.querySelectorAll('.toggle-button'),
			buttonsArray = [];

		each(buttons, function(button){
			if (button.closest('.toggle') === element ) buttonsArray.push(button);
		});

		create({
			element:         element,
			outer:           outer,
			buttons:         buttonsArray,
			ignore:          element.querySelectorAll('.toggle-ignore'),
			toggleClassName: 'open',
			toggleOpen:      false,
			// Проверка на единоразовое открытие
			once:            hasClass(element, 'toggle_once'),
			isInput:         false,
		});
	};

	/*
	* Добавляем в массив элементы необходимые для проверки на нажатие
	* Принимает массив который нужно дополнить и элементы, которые нужно добавить в массив
	*/
	const completeTargetArray = function (arr, items) {
		let j = 0,
			arrLength = arr.length;
		for (let i = arrLength; i < items.length + arrLength; i++) {
			arr[i] = items[j];
			j++;
		}

		return arr;
	};

	/*
	* Проверка на нажатие допустимых элементов.
	* Принимает массив элементов и событие
	*/
	const checkTargetElements = function (arr, event) {
		if (arr.length === 0) return false;

		let trigger = false;

		for (let i = 0; i < arr.length; i++) {
			if (event.target === arr[i] && !trigger) trigger = true;
		}

		return trigger;
	};


	w.Toggle = Toggle;
})(window);