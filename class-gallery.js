import EmblaCarousel from '../libs/embla';
/*
 * Галерея
*/
(function(w){
	var Gallery = function(bb, lazy){
		this.g = document.querySelector('.gallery');

		if(!this.g) return false;

		this.c = this.g.querySelector('.gallery__close');
		this.o = this.g.querySelector('.gallery__overlay');
		this.ou = this.g.querySelector('.gallery__outer');
		this.its = this.g.querySelector('.gallery__items');
		this.next = this.g.querySelector('.gallery__arrow_next');
		this.prev = this.g.querySelector('.gallery__arrow_prev');
		this.viewport = this.g.querySelector('.gallery__viewport');
		this.bb = bb;
		this.lazy = lazy;
		this.timeout = 300;

		this.createCarousel();
		this.addCarouselListeners();
		this.bindHandlers();
		this.addListeners();

		this.updateLinks();
	};

	var p = Gallery.prototype;

	p.createCarousel = function(){
		this.carousel = EmblaCarousel(this.viewport, {
			loop: true,
			align: 'start',
			speed: 20,
			containScroll: 'trimSnaps',
			draggable: true,
		});
	};

	p.each = function(items, callback){
		[].forEach.call(items, callback);
	};

	// Высота экрана с учетом нижней подложки в Safari
	p.windowHeight = function(el) {
		var vh = window.innerHeight * 0.01;
		el.style.setProperty('--vh', vh + 'px');
	};

	p.bindHandlers = function () {
		this.resizeWindowHandler = this.resizeWindowHandler.bind(this);
		this.openHandler = this.openHandler.bind(this);
		this.close = this.close.bind(this);
	};

	p.resizeWindowHandler = function(){
		this.windowHeight(this.g);
	};

	p.addCarouselListeners = function(){
		var self = this;

		this.prev.addEventListener('click', function(e){
			e.preventDefault();
			self.carousel.scrollPrev();
		});

		this.next.addEventListener('click', function(e){
			e.preventDefault();
			self.carousel.scrollNext();
		});
	};

	p.open = function(current){
		this.g.removeAttribute('style');
		this.windowHeight(this.g);
		window.addEventListener('resize', this.resizeWindowHandler);

		var self = this;

		setTimeout(function () {
			self.carousel.reInit();
			self.g.classList.add('open');
			self.bb.block();
			self.lazy.update();
			self.carousel.scrollTo(current);

			var mc = document.querySelector('.moclients-sidebar__outside');
			mc.style.opacity = 0;
			mc.style.visibility = 'hidden';
		}, 10);
	};

	p.close = function() {
		this.g.classList.remove('open');
		window.removeEventListener('resize', this.resizeWindowHandler);

		var self = this;

		setTimeout(function () {
			self.its.innerHTML = '';
			self.g.style.display = 'none';
			self.bb.unblock();

			var mc = document.querySelector('.moclients-sidebar__outside');
			mc.style.opacity = '';
			mc.style.visibility = '';
		}, this.timeout);
	};

	p.make = function(current, items) {
		this.its.innerHTML = '';

		var self = this;

		this.each(items, function (item) {
			var img = document.createElement('img'),
				inner = document.createElement('div'),
				pre = document.createElement('div');

			img.setAttribute('class', 'gallery__image lazy');
			img.setAttribute('data-src', item.getAttribute('href'));
			inner.setAttribute('class', 'gallery__item carousel__slide');

			inner.appendChild(img);
			self.carousel.containerNode().appendChild(inner);
		});

		this.open(current);
	};

	p.openHandler = function(e) {
		e.preventDefault();

		var item;

		if(!e.target.classList.contains('open-gallery')) item = e.target.closest('.open-gallery');
		else item = e.target;

		var galleryId = item.getAttribute('data-gallery'),
			items = document.querySelectorAll('[data-gallery="' + galleryId + '"]'),
			nodes = Array.prototype.slice.call(items),
			current = 0;

		this.each(items, function (it, i) {
			if (it === item) current = i;
		});

		if (document.body.offsetWidth > 991) this.make(current, items);
		else this.make(nodes.indexOf(item), items);
	};

	p.addListeners = function(){
		this.o.addEventListener('click', this.close);
		this.c.addEventListener('click', this.close);
	};

	p.updateLinks = function(){
		this.t = document.querySelectorAll('.open-gallery');

		var self = this;

		this.each(this.t, function(item){
			item.addEventListener('click', self.openHandler);
		});
	};

	w.Gallery = Gallery;
})(window);