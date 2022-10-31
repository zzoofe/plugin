/**
 * Методы для сокращения синтаксиса (замена jQuery)
 */
import { qS, addClass, removeClass, toggleClass, hasClass, each, toInt, toFloat } from '../cuts';
/**
 * Библиотека range input
 */
import noUiSlider from '../libs/no-ui-slider';

(function(w){
	const Quiz = function () {
		this.main = document.querySelector('.quiz');

		if (!this.main) return;

		const self = this;
		this.items = this.main.querySelectorAll('.quiz__field');
		this.frame = this.main.querySelector('.quiz__frame');
		this.form = this.main.querySelector('.quiz__form');
		this.next = this.main.querySelector('.button-next');
		this.prev = this.main.querySelector('.button-back');
		this.percent = this.main.querySelector('.done-percent');
		this.line = this.main.querySelector('.done-line');
		this.back = this.main.querySelector('.quiz__back');
		this.array = [];

		each(this.items, function (item) {
			self.array.push({
				range: item.querySelector('.calc__range'),
				input: item.querySelector('.calc__input')
			});
		});

		this.initSliders();

		this.bindHandlers();

		this.checkStep();

		this.addListeners();
	};

	const p             = Quiz.prototype;
	const activeClass   = 'quiz__step_active';
	const disabledClass = 'disabled';

	p.addRangeListener = function(index){
		const self = this,
			obj = this.array[index];

		obj.range.noUiSlider.on('update', function(values){
			obj.input.value = values[0];
		});

		obj.range.noUiSlider.on('slide', function(values){
			if(index === 1)
				obj.range.setAttribute('data-start', toInt(values[0]));
		});
	};

	p.initSliders = function(){
		const self = this;
		each(this.array, function(item, index){
			let start = item.range.getAttribute('data-start'),
				min = item.range.getAttribute('data-min'),
				max = item.range.getAttribute('data-max'),
				step = 1;

			// Если это индекс процентной ставки (3), делаем шаг 0.1
			if(index === 3) step = 0.1;

			// Инициализируем слайдер
			noUiSlider.create(item.range, {
				start: index === 3 ? toFloat(start) : toInt(start),
				connect: 'lower',
				animate: false,
				step: step,
				range: {
					'min': index === 3 ? toFloat(min) : toInt(min),
					'max': index === 3 ? toFloat(max) : toInt(max)
				},
				format: {
					to: function(value){
						if(index !== 3) return value.toLocaleString();
						else return value.toString().replace('.', ',');
					},
					from: function(value){
						if(index !== 3) return toInt(value);
						else return toFloat(value.replace(',', '.'));
						
					}
				}
			});

			self.addRangeListener(index);
		});
	};

	p.currentStep = function(){
		return this.main.querySelector(`.${activeClass}`)
	};

	p.finishForm = function (){
		this.frame.style.display = 'none';
		this.form.style.display = 'flex';
	}

	p.nextStep = function(){
		const currentStep = this.currentStep();
		const nextStep = currentStep.nextElementSibling;

		if (nextStep) {
			addClass(nextStep, activeClass);
			removeClass(currentStep, activeClass);
			this.readiness(nextStep.dataset.step);
		} else {
			this.finishForm();
		}
	};

	p.prevStep = function(){
		const currentStep = this.currentStep();
		const prevStep = currentStep.previousElementSibling;

		if (prevStep) {
			addClass(prevStep, activeClass);
			removeClass(currentStep, activeClass);
			this.readiness(prevStep.dataset.step);
		}
	};

	p.readiness = function(index){
		let value = '';

		if (index === '1') value = 0;
		if (index === '2') value = 20;
		if (index === '3') value = 40;
		if (index === '4') value = 60;
		if (index === '5') value = 80;

		this.percent.innerHTML = value + '%';
		this.line.style.width = value + '%';
	};

	p.backToSteps = function(){
		this.frame.style.display = 'flex';
		this.form.style.display = 'none';
	};

	p.getInputType = function (input) {
		const type = input.getAttribute('type');

		if (type === 'checkbox' || type === 'radio')
			return 'check';
		if (type === 'text' || type === 'tel' || type === 'number')
			return 'text';

		return;
	};

	/**
	 * Проверка этапа для перехода далее
	 */
	p.checkStep = function () {
		const self = this;
		const currentStep = this.currentStep();
		const inputs = currentStep.querySelectorAll('input');

		let trigger = false;
		let count = 0;

		each(inputs, function (input, index) {
			if (self.getInputType(input) === 'text') {
				if (input.value !== '')
					count++;

				if(inputs.length === count) trigger = true;
				else trigger = false;

			} else if (self.getInputType(input) === 'check') {
				if (input.checked)
					trigger = true;
			}
		});

		if (trigger)
			removeClass(this.next, disabledClass);
		else
			addClass(this.next, disabledClass);
	};

	p.buttonsHandler = function (e) {
		e.preventDefault();

		if (e.target === this.next && !hasClass(this.next, disabledClass))
			this.nextStep();

		if (e.target === this.prev)
			this.prevStep();

		if (e.target === this.back)
			this.backToSteps();

		this.checkStep();
	};

	p.addListeners = function(){
		const self = this;

		each(this.array, function(item){
			item.input.addEventListener('input', function(){
				// Если инпут пустой, то меняем пустоту на 0
				if(this.value.length === 0) this.value = 0;
				// Если введена цифра, но впереди 0, удаляем его
				if(this.value.length > 1 && this.value[0] === '0') this.value = this.value.slice(1);
				// Указываем в слайдере значение инпута, если оно больше минимального значения слайдера
				if(item.range.noUiSlider.options.range.min <= toInt(this.value) 
					&& !isNaN(toInt(this.value[this.value.length - 1]))) item.range.noUiSlider.set(this.value);
			}, false);

			item.input.addEventListener('blur', function(){
				// Если минимальное значение слайдера больше чем в инпуте, то указываем в слайдере минимальное значение
				if(item.range.noUiSlider.options.range.min >= toFloat(this.value) || isNaN(toInt(this.value)))
					item.range.noUiSlider.set(item.range.noUiSlider.options.range.min);
				// Если последний символ это не число, чистим содержимое от лишних символов
				if(isNaN(toInt(this.value[this.value.length - 1]))) this.value = toFloat(this.value).toLocaleString();
			}, false);
		});

		each(this.main.querySelectorAll('input'), function (input) {
			input.addEventListener('change', self.checkStep, false);
		});

		each([this.next, this.prev, this.back], function (item){
			item.addEventListener('click', self.buttonsHandler, false);
		});
	};

	p.bindHandlers = function () {
		this.buttonsHandler = this.buttonsHandler.bind(this);
		this.checkStep = this.checkStep.bind(this);
	};

	w.Quiz = Quiz;
})(window);