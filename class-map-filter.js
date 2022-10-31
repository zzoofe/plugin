(function(w){
	const MapFilter = function () {
		this.main = document.querySelector('.filters');

		if (!this.main) return;

		this.cols = this.main.querySelectorAll('.filters__col');

		this.used = this.main.querySelector('.filters-used');
		this.usedWrapper = this.main.querySelector('.filters-used__items');
		this.usedOpen = this.main.querySelector('.filters-used__open');
		this.usedClear = this.main.querySelector('.filters-used__clear');
		this.usedClassName = 'filters-used__item';
		this.usedHeight = 0;
		this.showClassName = 'show';
		this.inputs = this.main.querySelectorAll('input, select');
		this.indexAttr = 'data-index';
		this.groupAttr = 'data-group';
		this.types = [
			['checkbox', 'radio'],
			['tel', 'text, number'],
			['select']
		];

		/**
		 * Задаем индексы инпутам
		 */
		this.setIndexes();

		/**
		 * Биндим
		 */
		this.bindHandlers();

		/**
		 * Вешаем события
		 */
		this.addListeners();

		/**
		 * Объединяем чекбоксы в один скрытый инпут для простоты отправки формы
		 */
		this.groupedCheckboxes();
	};

	const p = MapFilter.prototype;

	p.each = function(items, callback){
		[].forEach.call(items, callback);
	};

	p.bindHandlers = function(){
		this.inputChangeHandler = this.inputChangeHandler.bind(this);
	};

	/**
	 * Задаем всем инпутам индексы кроме поиска и скрытых полей
	 */
	p.setIndexes = function(){
		let i = 0;

		const self = this;

		this.each(this.inputs, function(item){
			if (!item.classList.contains('search') && item.getAttribute('type') !== 'hidden') item.setAttribute(self.indexAttr, i++);
		});
	};

	/**
	 * Получаем эвент, который будет работать в ie11
	 */
	p.getEventObject = function(str){
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
	 * Получаем элемент фильтра по индексу
	 */
	p.getIndexedUsed = function(index){
		return this.main.querySelector('.filters-used__item['+ this.indexAttr +'="'+ index +'"]');
	};

	/**
	 * Получаем все инпуты по группе
	 */
	p.getGroupedInputs = function(group){
		return this.main.querySelectorAll('input['+ this.groupAttr +'="'+ group +'"], select['+ this.groupAttr +'="'+ group +'"]');
	};

	/**
	 * Получаем группу элементов по индексу одного из них
	 */
	p.getIndexedInputs = function(index, one){
		let main = this.main.querySelector('input[' + this.indexAttr + '="' + index + '"]');

		if (!main) main = this.main.querySelector('select['+ this.indexAttr +'="'+ index +'"]');

		if (!one){
			let grouped = [];

			if (this.getInputType(main) !== 'checkbox') grouped = this.getGroupedInputs(main.getAttribute(this.groupAttr));

			if (grouped.length > 0) return grouped;
			else return [main];
		} else {
			return main;
		}
	};

	/**
	 * Получаем тип инпута
	 */
	p.getInputType = function(input){
		if (input.getAttribute('type'))
			return input.getAttribute('type').toLowerCase();

		if (input.tagName.toLowerCase() === 'select')
			return input.tagName.toLowerCase();
	};

	/**
	 * Очищаем все фильтры
	 */
	p.clean = function(inputs){
		const self = this;

		this.each(inputs, function(input){
			const type = self.getInputType(input),
				event = self.getEventObject('delete');

			if (self.types[0].indexOf(type) !== -1) input.checked = false;
			if (self.types[1].indexOf(type) !== -1) input.value = '';

			// Очищаем селект и с помощью эвента, даем понять, что он изменился
			if (self.types[2].indexOf(type) !== -1) {
				const ev = self.getEventObject('change');

				input.options[0].selected = true;

				input.dispatchEvent(ev);
			}

			input.dispatchEvent(event);
		});
	};

	/**
	 * Удаляем элементы фильтра по группе
	 */
	p.removeGroupedUsed = function(group){
		const self = this;

		this.each(this.getGroupedInputs(group), function(input){
			const item = self.getIndexedUsed(input.getAttribute(self.indexAttr));
			if (item) self.usedWrapper.removeChild(item);
		});
	};

	/**
	 * Добавляем событие для элемента фильтра (закрытие и чистка фильтра)
	 */
	p.setUsedListener = function(item, close, id){
		const self = this;

		close.addEventListener('click', function(){
			const inputs = self.getIndexedInputs(id);

			self.clean(inputs);

			self.usedWrapper.removeChild(item);

			self.checkUsed();
		});
	};

	/**
	 * Задаем содержимое для элемента фильтра
	 */
	p.setUsedValue = function(id){
		const used = this.getIndexedUsed(id),
			text = used.querySelector('b'),
			input = this.getIndexedInputs(id, true),
			type = this.getInputType(input);

		if (this.types[0].indexOf(type) !== -1) text.innerHTML = this.main.querySelector('[for="'+ input.getAttribute('id') +'"]').innerHTML;

		// ПЕРЕДЕЛАТЬ КОСТЫЛИ
		if (this.types[1].indexOf(type) !== -1){
			const inputs = this.getIndexedInputs(id),
				fst = inputs[0].value.trim().length,
				scnd = inputs[1].value.trim().length,
				currency = input.closest('.filters__col').querySelector('.filters__currency').innerHTML;

			if (fst > 0 && scnd === 0) text.innerHTML = 'от ' + inputs[0].value + ' ' + currency;
			if (fst === 0 && scnd > 0) text.innerHTML = 'до ' + inputs[1].value + ' ' + currency;
			if (fst > 0 && scnd > 0) text.innerHTML = inputs[0].value + ' - ' + inputs[1].value + ' ' + currency;
		}

		if (this.types[2].indexOf(type) !== -1) {
			this.each(input.querySelectorAll('option'), function(item){
				if (item.selected) text.innerHTML = item.innerHTML;
			});
		}

		this.checkUsed();
	};

	/**
	 * Создаем элемент фильтра
	 */
	p.createUsed = function(id){
		const item = document.createElement('div'),
			close = document.createElement('span'),
			text = document.createElement('b');

		item.setAttribute('class', this.usedClassName);
		item.setAttribute(this.indexAttr, id);
		item.appendChild(text);
		item.appendChild(close);

		this.usedWrapper.appendChild(item);

		close.addEventListener('mouseover', function(){
			item.classList.add('hover');
		});

		close.addEventListener('mouseout', function(){
			item.classList.remove('hover');
		});

		this.setUsedListener(item, close, id);

		this.setUsedValue(id);
	};

	/**
	 * Обновляем размер элемента фильтра
	 */
	p.updateUsedHeight = function(){
		const used = this.usedWrapper.querySelector('.' + this.usedClassName);
		this.usedHeight = used.offsetHeight + parseInt(window.getComputedStyle(used, null).getPropertyValue("margin-bottom"));
	};

	/**
	 * Показываем и скрываем кнопку раскрытия опций в зависимости от размера
	 */
	p.toggleShowButton = function(){
		if (this.usedWrapper.scrollHeight > this.usedHeight) this.usedOpen.classList.add(this.showClassName);
		else this.usedOpen.classList.remove(this.showClassName);
	};

	/**
	 * Проверяем на существование элементов фильтра, если они есть, то показываем фильтры
	 */
	p.checkUsed = function(){
		if (this.usedWrapper.innerHTML === ''){
			this.used.classList.remove(this.showClassName);
			this.usedClear.classList.remove(this.showClassName);
		}else{
			this.used.classList.add(this.showClassName);
			this.usedClear.classList.add(this.showClassName);

			this.updateUsedHeight();

			this.toggleShowButton();
		}
	};

	/**
	 * Работаем с текстовыми инпутами (диапазон) (если понадобится еще больше группированных элементов, переделать)
	 */
	p.processInputText = function(input){
		let inputs = this.getGroupedInputs(input.getAttribute(this.groupAttr)),
			self = this,
			used = undefined,
			index = input.getAttribute(this.indexAttr);

		this.each(inputs, function(item){
			const x = self.getIndexedUsed(item.getAttribute(self.indexAttr));
			if (x) used = x;
		});

		if (typeof used === 'undefined') this.createUsed(index);
		if (typeof used !== 'undefined') this.setUsedValue(used.getAttribute(this.indexAttr));

		// Удаляем элементы если ипуты пусты
		if (inputs[0].value.trim().length === 0 && inputs[1].value.trim().length === 0)
			this.removeGroupedUsed(input.getAttribute(this.groupAttr));
	};

	/**
	 * В зависимости от типа инпута, производим действия
	 */
	p.inputChangeHandler = function(e){
		const input = e.target,
			group = input.getAttribute(this.groupAttr),
			type = this.getInputType(input),
			index = input.getAttribute(this.indexAttr);

		if (this.types[0].indexOf(type) !== -1) {
			if (type === 'radio') this.removeGroupedUsed(group);

			if (input.checked) this.createUsed(index);
			else this.usedWrapper.removeChild(this.getIndexedUsed(index));
		}

		if (this.types[1].indexOf(type) !== -1) this.processInputText(input);

		if (this.types[2].indexOf(type) !== -1) {
			if (group) this.removeGroupedUsed(group);

			if (!this.getIndexedUsed(index)) this.createUsed(index);
			else this.setUsedValue(index);
		}

		this.checkUsed();
	};

	/**
	 * Создаем события для инпутов и кнопок
	 */
	p.addListeners = function(){
		const self = this;

		this.each(this.inputs, function(item){
			const type = self.getInputType(item);

			if (self.types[0].indexOf(type) !== -1 || self.types[2].indexOf(type) !== -1) 
				item.addEventListener('change', self.inputChangeHandler, false);
			else 
				item.addEventListener('keyup', self.inputChangeHandler, false);
		});

		this.usedClear.addEventListener('click', function(){
			self.clean(self.inputs);

			self.usedWrapper.innerHTML = '';

			self.checkUsed();
		});

		// При ресайзе проверяем возможность раскрытия опций
		window.addEventListener('resize', function(){
			if (self.usedWrapper.innerHTML !== '') {
				self.updateUsedHeight();

				self.toggleShowButton();
			}
		});
	};

	/**
	 * Создаем скрытый инпут для группированных чекбоксов
	 */
	p.createHiddenString = function(inputs){
		let string = '';

		this.each(inputs, function(input){
			if (input.checked){
				if (string.length === 0) string = input.value;
				else string += ',' + input.value;
			}
		});

		return string;
	};

	/**
	 * Добавляем события для группированных чекбоксов
	 */
	p.groupedCheckboxes = function(){
		const inputs = this.main.querySelectorAll('input[type="checkbox"][' + this.groupAttr + ']'),
			self = this;

		this.each(inputs, function(input){
			const group = input.getAttribute(self.groupAttr),
				hidden = self.main.querySelector('input[name="' + group + '"]');

			input.addEventListener('change', function(){
				hidden.value = self.createHiddenString(self.getGroupedInputs(group));
			});

			input.addEventListener('delete', function(){
				hidden.value = self.createHiddenString(self.getGroupedInputs(group));
			});
		});
	};

	w.MapFilter = MapFilter;
})(window);