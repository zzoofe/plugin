(function(w){
	const Hamburger = function (bb) {
		this.trigger = document.querySelector('.header__hamburger');

		if (!this.trigger) return;

		// this.header = document.querySelector('.header');
		this.main = document.querySelector('.header__nav');
		this.closeButton = document.querySelector('.header-nav__close');
		this.outline = document.querySelector('.header__outline');
		this.bb = bb;
		this.time = 300;
		this.openClass = 'open';

		// this.windowHeight(this.main);
		// this.windowHeight(this.outline);

		this.bindHandlers();
		this.addListeners();
	};

	const p = Hamburger.prototype;

	// Высота экрана с учетом нижней подложки в Safari
	p.windowHeight = function() {
		const vh = window.innerHeight * 0.01;
		this.main.style.setProperty('--vh', vh + 'px');
		this.outline.style.setProperty('--vh', vh + 'px');
	};

	p.resizeWindowHandler = function(){
		this.windowHeight();
	};

	p.open = function(){
		this.main.classList.add(this.openClass);

		this.bb.block();
		// this.header.style.paddingRight = this.bb.bar + 'px';

		this.windowHeight();
		this.windowHeight();
		window.addEventListener('resize', this.resizeWindowHandler);

		this.outline.style.display = 'block';

		const self = this;

		setTimeout(function(){
			self.outline.classList.add(self.openClass);
		}, 10);
	};

	p.close = function(){
		this.main.classList.remove(this.openClass);
		this.outline.classList.remove(this.openClass);

		window.removeEventListener('resize', this.resizeWindowHandler);

		const self = this;

		setTimeout(function(){
			self.bb.unblock();
			// self.header.style.removeProperty('padding-right');
			self.outline.style.display = 'none';
		}, this.time);
	};

	p.toggleHandler = function(e){
		e.preventDefault();

		if(!this.main.classList.contains('open')) this.open();
		else this.close();
	};

	p.bindHandlers = function(){
		this.toggleHandler = this.toggleHandler.bind(this);
		this.resizeWindowHandler = this.resizeWindowHandler.bind(this);
	};

	p.addListeners = function(){
		this.trigger.addEventListener('click', this.toggleHandler);
		this.closeButton.addEventListener('click', this.toggleHandler);
		this.outline.addEventListener('click', this.toggleHandler);
	};

	w.Hamburger = Hamburger;
})(window);