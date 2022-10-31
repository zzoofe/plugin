/**
 * Методы для сокращения синтаксиса (замена jQuery)
 */
import { qS, addClass, removeClass, toggleClass, hasClass, each, toInt, toFloat } from '../cuts';
/**
 * Библиотека range input
 */
import noUiSlider from '../libs/no-ui-slider';

(function(w){
	const CreditCalc = function () {
		this.main = document.querySelector('.calc__outer');

		if (!this.main) return;

		// Объект элементов результатов
		this.results = {
			sum: this.main.querySelector('#calc-sum'),
			payment: this.main.querySelector('#calc-month')
		};

		// Перобразуем элементы в объект для удобства работы
		const self = this;
		this.items = this.main.querySelectorAll('.calc__item');
		this.array = [];

		each(this.items, function (item) {
			self.array.push({
				range: item.querySelector('.calc__range'),
				input: item.querySelector('.calc__input')
			});
		});

		// Начальная цена
		this.startPrice = toInt(this.array[0].range.getAttribute('data-start'));

		this.setFirstDefaults(this.startPrice);

		this.initSliders();

		this.addInputsListeners();
	};

	const p = CreditCalc.prototype;

	// Дефолтные значения для первого взноса
	p.setFirstDefaults = function(price){
		const range = this.array[1].range,
			min = Math.round((price / 100) * 10),
			max = Math.round((price / 100) * 90),
			start = Math.round((price / 100) * 40);

		// Минимальная цена первого взноса
		range.setAttribute('data-min', min);
		// Максимальная цена первого взноса
		range.setAttribute('data-max', max);
		// Дефолтное значение первого взноса
		if(!range.getAttribute('data-start')) range.setAttribute('data-start', start);

		// Если существует слайдер, то обновляем его минимальное и максимальное значение 
		// при изменении слайдера цены недвижимости
		if(range.noUiSlider){
			range.noUiSlider.updateOptions({
				start: parseInt(range.getAttribute('data-start')),
				range: {
					'min': min,
					'max': max
				}
			});
		}
	};

	p.addRangeListener = function(index){
		const self = this,
			obj = this.array[index];

		obj.range.noUiSlider.on('update', function(values){
			obj.input.value = values[0];
			// Задаем дефолтные значения для первоначального взноса
			if(index === 0) self.setFirstDefaults(toInt(values[0]));
			// Расчитываем результаты
			self.calculateResults();
		});

		obj.range.noUiSlider.on('slide', function(values){
			if(index === 1) obj.range.setAttribute('data-start', toInt(values[0]));
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

	p.addInputsListeners = function(){
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
	};

	p.calculateResults = function(){
			// Стоимость недвижимости
		const full = toInt(this.array[0].input.value),
			// Первый взнос
			first = toInt(this.array[1].input.value),
			// Срок кредита
			time = toInt(this.array[2].input.value),
			// Годовой процент
			percent = toFloat(this.array[3].input.value);

		// Проверяем все данные
		if (isNaN(full) || isNaN(first) || isNaN(time) || isNaN(percent)) return;

			// Сумма кредита
		const sum = full - first,
			// Месячный процент деленный на 100
			monthPercent = (percent / 12) / 100,
			// Получаем количество месяцев
			monthsTotal = time * 12,
			// Коэффициент аннуитета
			annuity = monthPercent * Math.pow(1 + monthPercent, monthsTotal) / (Math.pow(1 + monthPercent, monthsTotal) - 1),
			// Месячный платеж
			monthPayment = sum * annuity;

		// Выводим результаты
		this.results.sum.value = sum.toLocaleString() + ' ₽';
		this.results.payment.value = monthPayment.toLocaleString() + ' ₽';
	};

	w.CreditCalc = CreditCalc;
})(window);