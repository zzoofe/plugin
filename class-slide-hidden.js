/**
 * Методы для сокращения синтаксиса (замена jQuery)
 */
import { addClass, removeClass, hasClass, each } from '../cuts';

/**
 * Класс для скрытия и показа скрытых элементов с анимацией выдвижения
 */
(function(w){
	let animation = undefined;

	const create = function (obj){
		const transitionHandler = function(){
			obj.trigger = true;
			obj.hidden.classList.toggle(obj.openClass);
			obj.button.classList.toggle(obj.openClass);

			if (obj.textOpen && obj.textClose){
				var word = obj.textOpen;
				if (obj.button.classList.contains(obj.openClass)) word = obj.textClose;

				var inner = obj.button.querySelector('span');
				if (!inner) inner = obj.button;
				inner.innerHTML = word;
			}
		};

		const buttonHandler = function(e){
			if (!obj.trigger) return;

			if (!obj.hidden.classList.contains(obj.openClass)) obj.open();
			else obj.close();

			obj.trigger = false;
		};

		obj.open = function(){
			if (obj.hidden.classList.contains(obj.openClass) && obj.trigger) return;

			obj.trigger = false;

			animation.slideDown(obj.hidden, obj.duration, transitionHandler);
		};

		obj.close = function(){
			if (!obj.hidden.classList.contains(obj.openClass) && obj.trigger) return;

			obj.trigger = false;

			animation.slideUp(obj.hidden, obj.duration, transitionHandler);
		};

		if (obj.element.Slide) return;

		obj.button.addEventListener('click', buttonHandler, false);



		obj.element.Slide = obj;
	};
	const SlideHidden = function (elements, anim) {
		animation = anim;

		this.elements = elements;
		
		this.update();
	};

	const p = SlideHidden.prototype;

	p.update = function() {
		if(typeof this.elements === 'undefined') return;

		let items;

		if (typeof this.elements === 'string') items = document.querySelectorAll(this.elements);
		else if (typeof this.elements === 'object' && typeof this.elements.length === 'undefined') items = [this.elements];

		each(items, this.initElement);
	};

	p.initElement = function(element){
		// Проверка на то, что родителем блока является данный контейнер для избежания конфликтов
		let outer = element.querySelector('.slide-content');
		if (outer) if (outer.closest('.slide') !== element) outer = null;

		const button = element.querySelector('.slide-button');

		create({
			element:         element,
			button:          button,
			hidden:          outer,
			duration:        300,
			trigger:         true,
			openClass:       'open',
			textOpen:        button.getAttribute('data-open') ? button.getAttribute('data-open') : null,
			textClose:       button.getAttribute('data-close') ? button.getAttribute('data-close') : null
		});
	};

	w.SlideHidden = SlideHidden;
})(window);