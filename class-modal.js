/*
 * Модальное окно
*/
(function(w){
	var Mmodal = function(bb){
		this.m = document.querySelector('.modal');

		if(!this.m) return false;

		this.ir = this.m.querySelector('.modal__inner');
		this.o = this.m.querySelector('.modal__overlay');
		this.c = this.m.querySelectorAll('.modal-close');
		this.ms = this.m.querySelectorAll('.modal-item');
		this.b = document.body;
		this.l = this.m.querySelector('.modal-loader');
		this.out = this.m.querySelector('.modal__outer');
		this.timeout = 300;
		this.bb = bb;
		this.opened = false;

		this.bindHandlers();
		this.addListeners();
		
	};

	var p = Mmodal.prototype;

	p.each = function(items, callback){
		[].forEach.call(items, callback);
	};

	/**
	 * Получаем эвент, который будет работать в ie11
	 */
	p.getEventObject = function(str){
		var event;
		if (typeof(Event) === 'function') {
			event = new Event(str);
		} else {
			event = document.createEvent('Event');
			event.initEvent(str, true, true);
		}

		return event;
	};

	// Высота экрана с учетом нижней подложки в Safari
	p.windowHeight = function(el) {
		var vh = window.innerHeight * 0.01;
		el.style.setProperty('--vh', vh + 'px');
	};

	p.hideItems = function(){
		this.each(this.ms, function (e) {
			e.style.display = 'none';
		});
	};

	p.closeModalHandler = function(event){
		event.preventDefault();
		
		this.close();
	};

	p.resizeWindowHandler = function(){
		this.windowHeight(this.m);
	};

	p.close = function(){
		this.ir.classList.remove('open');
		this.m.classList.remove('open');
		this.o.removeAttribute('style');

		var self = this;

		setTimeout(function () {
			self.hideItems();
			self.m.style.display = 'none';

			self.bb.unblock();
			self.opened = false;
			window.removeEventListener('resize', self.resizeWindowHandler);

			self.m.dispatchEvent(self.getEventObject('afterClose'));
		}, this.timeout);
	};

	p.open = function(string){
		var modal = this.m.querySelector(string);

		this.hideItems();
		modal.removeAttribute('style');
		this.m.removeAttribute('style');
		if(!this.m.classList.contains('open') && !this.opened) this.bb.block();
		this.windowHeight(this.m);

		window.addEventListener('resize', this.resizeWindowHandler);

		var self = this;

		this.opened = true;

		setTimeout(function () {
			self.ir.classList.add('open');
			self.m.classList.add('open');
			self.o.style.width = 'calc(100% - ' + self.bb.bar + 'px)';
			self.l.style.display = 'none';
		}, 2);
	};

	p.change = function(){
		this.ir.classList.remove('open');
		// setTimeout(this.hideItems, this.timeout);
	};

	p.loader = function(){
		this.m.removeAttribute('style');
		this.l.removeAttribute('style');

		if(!this.bb.check()) this.bb.block();

		var self = this;

		setTimeout(function () {
			self.m.classList.add('open');
			self.o.style.width = 'calc(100% - ' + self.bb.bar + 'px)';
		}, 2);
	};

	p.addListeners = function() {
		var self = this;

		this.each(this.c, function (e) {
			e.addEventListener('click', self.closeModalHandler);
		});

		this.o.addEventListener('click', self.closeModalHandler);
	};

	p.bindHandlers = function () {
		this.closeModalHandler = this.closeModalHandler.bind(this);
		this.resizeWindowHandler = this.resizeWindowHandler.bind(this);
	};

	w.Mmodal = Mmodal;
})(window);