/*
 * Контроль блокировки body для разблокировки только при закрытии всех окон и меню
*/
(function(w){
	const BodyBlockingControl = function () {
		this.body = document.body;
		this.className = 'blocked';
		this.attr = 'data-body-scroll-fix';
		this.bar = this.getBarSize();
		this.opened = 0;
		// Элементы, которые не должны скакать при убирании скроллбара
		this.fixedElements = document.querySelectorAll('.fixed-element');

		const self = this;

		window.addEventListener('resize', function () {
			self.bar = self.getBarSize();
		});
	};

	const p = BodyBlockingControl.prototype;

	p.each = function(items, callback){
		[].forEach.call(items, callback);
	};

	p.getBarSize = function () {
		return window.innerWidth - document.querySelector(".main-wrapper").offsetWidth;
	};

	p.block = function(){
		this.opened++;

		this.body.classList.add(this.className);

		if (!this.body.hasAttribute(this.attr)) {

			// Получаем позицию прокрутки
			const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

			// Ставим нужные стили
			this.body.setAttribute(this.attr, scrollPosition); // Cтавим атрибут со значением прокрутки
			this.body.style.overflow = 'hidden';
			this.body.style.position = 'fixed';
			this.body.style.top = '-' + scrollPosition + 'px';
			this.body.style.left = '0';
			this.body.style.width = '100%';
			this.body.style.paddingRight = this.bar + 'px';

			const self = this;

			this.each(this.fixedElements, function(item){
				item.style.setProperty('--fixed', self.bar + 'px');
			});
		}
	};

	p.unblock = function(){
		this.opened--;

		if(this.opened > 0) return false;

		this.body.classList.remove(this.className);
		this.body.style.paddingRight = '';

		if (this.body.hasAttribute(this.attr)) {

			// Получаем позицию прокрутки из атрибута
			const scrollPosition = this.body.getAttribute(this.attr);

			// Удаляем атрибут
			this.body.removeAttribute(this.attr);

			// Удаляем ненужные стили
			this.body.style.overflow = '';
			this.body.style.position = '';
			this.body.style.top = '';
			this.body.style.left = '';
			this.body.style.width = '';
			this.body.style.paddingRight = '';
			this.each(this.fixedElements, function(item){
				item.style.removeProperty('--fixed');
			});

			// Прокручиваем страницу на полученное из атрибута значение
			window.scroll(0, scrollPosition);
		}
	};

	p.check = function(){
		return this.body.classList.contains('blocked');
	};

	w.BodyBlockingControl = BodyBlockingControl;
})(window);