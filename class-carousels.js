/**
 * Методы для сокращения синтаксиса (замена jQuery)
 */
import { addClass, removeClass, hasClass, each } from '../cuts';
import { bb } from '../globals';
import EmblaCarousel from '../libs/embla';

/*
 * Карусели
*/
(function (w) {
	const create = function (obj) {
		// Указываем активный слайд
		// p.selectActiveSlide = function () {
		// 	var slides = this.embla.slideNodes();

		// 	for (var i = 0; i < slides.length; i++) slides[i].classList.remove("active");

		// 	slides[this.embla.selectedScrollSnap()].classList.add("active");
		// };

		const restartAutoplay = function () {
			if (!obj.autoplayer) return;

			obj.autoplayer.stop();
			obj.autoplayer.play();
		};

		const autoplay = function () {
			const stop = function () {
				window.clearTimeout(timer);
				timer = 0;
			};
			const next = function () {
				if (obj.embla.canScrollNext()) obj.embla.scrollNext();
				else obj.embla.scrollTo(0);

				play();
			};
			let timer = 0;

			const play = function () {
				stop();
				requestAnimationFrame(function () {
					timer = window.setTimeout(next, obj.interval);
					return timer;
				});
			};

			obj.autoplayer = {
				play: play,
				stop: stop
			};

			obj.embla.on("pointerDown", play);
			obj.embla.on("init", play);
		};

		const dotsHandler = function (e) {
			e.preventDefault();

			obj.embla.scrollTo(obj.dots.indexOf(e.target));

			restartAutoplay();
		};

		const generateDots = function () {
			// Генерируем контейнер для дотов
			const dotsContainer = document.createElement('ul');

			dotsContainer.className = obj.className + '__dots carousel__dots dots row';
			obj.main.appendChild(dotsContainer);

			// Генерируем доты
			obj.dots = [];

			for (let i = 0; i < obj.embla.slideNodes().length; i++) {
				const dot = document.createElement('li');

				if (obj.embla.selectedScrollSnap() === i) dot.setAttribute('class', obj.className + '__dot carousel__dot dots__item active');
				else dot.setAttribute('class', obj.className + '__dot carousel__dot dots__item');

				dotsContainer.appendChild(dot);
				obj.dots.push(dot);

				// Событие клика на дот
				dot.addEventListener('click', dotsHandler);
			}

			// Событие скролла контейнера для изменения активного дота
			obj.embla.on('scroll', function () {
				if (obj.dots.length > 0) {
					for (let i = 0; i < obj.dots.length; i++) removeClass(obj.dots[i], 'active');

					addClass(obj.dots[obj.embla.selectedScrollSnap()], 'active');
				}
			});
		};

		const checkScrollers = function () {
			if (obj.prev) {
				if (!obj.embla.canScrollPrev()) addClass(obj.prev, 'disabled');
				else removeClass(obj.prev, 'disabled');
			}

			if (obj.next) {
				if (!obj.embla.canScrollNext()) addClass(obj.next, 'disabled');
				else removeClass(obj.next, 'disabled');
			}
		};

		const buttonsHandler = function (e) {
			e.preventDefault();

			if (e.target === obj.prev) obj.embla.scrollPrev();
			if (e.target === obj.next) obj.embla.scrollNext();

			checkScrollers();
			restartAutoplay();
		};

		const setControls = function () {
			if (obj.prev) obj.prev.addEventListener('click', buttonsHandler, false);
			if (obj.next) obj.next.addEventListener('click', buttonsHandler, false);

			checkScrollers();
			obj.embla.on('select', checkScrollers);

			// Добавление дотов к слайдеру
			if (hasClass(obj.main, 'carousel_dots')) generateDots();
		};

		// Автоматическая ширина слайдов
		const autoWidth = function () {
			const slides = obj.embla.slideNodes();

			each(slides, function (slide) {
				slide.style.width = 'auto';
				slide.style.width = slide.offsetWidth + 'px';
			});

			obj.embla.reInit();
		};

		// Автоматическая высота вьюпорта
		const resizeViewport = function () {
			let biggest = 0,
				slides = obj.embla.slideNodes();

			each(slides, function (item, index) {
				if (obj.embla.slidesInView().indexOf(index) !== -1 && biggest < item.offsetHeight) biggest = item.offsetHeight;
			});

			obj.viewport.style.height = biggest + 'px';
		};

		// Если существует, то просто обновляем
		if (obj.main.Carousel) {
			obj = obj.main.Carousel;
			obj.embla.reInit(obj.options);
			checkScrollers();
			resizeViewport();
		} else {
			// Инициализируем embla
			obj.embla = EmblaCarousel(obj.viewport, obj.options);

			setControls();

			if (obj.autoplay) autoplay();

			// Автоподстройка ширины слайдов
			if (obj.autoWidth) {
				autoWidth();
				obj.embla.on('resize', autoWidth);
			}

			// Если обозначено, что это слайдер с разной высотой слайдов
			if (obj.autoHeight) {
				resizeViewport();
				obj.embla.on('resize', resizeViewport);
				obj.embla.on('scroll', resizeViewport);
			}

			// Следим за кнопками при изменении ширины
			if (obj.buttons) {
				obj.embla.on('resize', checkScrollers);
			}

			// Изменение активного слайда
			// obj.embla.on('scroll', selectActiveSlide);
			// obj.embla.on('init', selectActiveSlide);

			obj.main.Carousel = obj;
		}
	};

	const Carousel = function (elements, align) {

		this.elements = elements;
		this.align = align;

		this.initElement = this.initElement.bind(this);
		this.update();
	};

	const p = Carousel.prototype;

	p.update = function () {
		if(typeof this.elements === 'undefined') return;

		let items;

		if (typeof this.elements === 'string') items = document.querySelectorAll(this.elements);
		else if (typeof this.elements === 'object' && typeof this.elements.length === 'undefined') items = [this.elements];

		each(items, this.initElement);
	};

	p.initElement = function (element) {
		// Если это галерея, то отменяем инициализацию
		if (hasClass(element, 'gallery__outer')) return;

		const obj = {
			main: element,
			className: element.getAttribute('data-classname'),
			viewport: element.querySelector('.carousel__viewport'),
			container: element.querySelector('.carousel__container'),
			prev: element.querySelector('.carousel__prev'),
			next: element.querySelector('.carousel__next'),
			autoplay: hasClass(element, 'carousel_autoplay'),
			autoWidth: hasClass(element, 'carousel_autowidth'),
			autoHeight: hasClass(element, 'carousel_height'),
			buttons: hasClass(element, 'carousel_buttons'),
			interval: element.getAttribute('data-interval') ? parseInt(element.getAttribute('data-interval')) : 3000,
			options: {
				speed: 20,
				draggable: (document.body.offsetWidth + bb.bar) <= 991,
				loop: hasClass(element, 'carousel_loop'),
				containScroll: "trimSnaps",
				align: this.align ? this.align : 'start'
			}
		};

		create(obj);
	};

	w.Carousel = Carousel;
})(window);