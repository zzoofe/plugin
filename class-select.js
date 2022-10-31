/**
 * Dropdown вместо select
 */
(function(w){
	var Select = function(element){
		if(!element) return;

		if (typeof element === 'string') {
			element = document.querySelectorAll(element);
		}

		if (element.length > 1) {
			return Select.createMany(element);
		} else if (element.length === 1) {
			element = element[0];
		}

		if(element.length === 0) return;

		this.main = element;
		this.select = this.main.querySelector('.select__real');
		this.current = this.main.querySelector('.select__current');
		this.inner = this.main.querySelector('.select__inner');
		this.className = this.main.getAttribute('data-classname');
		this.options = [];
		this.createReplacementItems();
		this.addListeners();
	};

	Select.createMany = function (nodes) {
		var result = [];
		for (var i = 0; i < nodes.length; i++) {
			result.push(new Select(nodes[i]));
		}
		return result;
	};

	var p = Select.prototype;

	p.cE = function(string){
		return document.createElement(string);
	};


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
	}

	/**
	 * Добаляем элементы и отмечаем выбранный элемент
	*/
	p.createReplacementItems = function() {
		var items = this.select.options,
			self = this,
			selected = this.select.querySelector('[selected]'),
			disabled = this.select.querySelector('[disabled]');

		this.each(items, function (item, index) {
			var text = item.text,
				option = self.cE('div');

			option.setAttribute('class', self.className + '__item select__item');

			if(disabled && disabled === item) option.classList.add('disabled');

			if ((selected && selected === item) || (!selected && index === 0)) {
				option.classList.add('active');
				self.current.innerHTML = text;
			}
			option.innerHTML = text;
			self.inner.appendChild(option);
			self.options.push(option);
		});
	};

	p.changeActive = function(el){
		var active = this.main.querySelector('.select__item.active');
		active.classList.remove('active');
		el.classList.add('active');
		this.current.innerHTML = el.innerHTML;
	};

	p.triggerChange = function(){
		var event = this.getEventObject('change');
		this.select.dispatchEvent(event);
	};

	// Связываем элементы между собой
	p.addListeners = function(){
		var self = this;

		// Событие при нажатии на один из элементов
		this.each(this.options, function(item, index){
			item.addEventListener('click', function(e){
				if(e.target.classList.contains('disabled')) return false;

				self.changeActive(e.target);
				self.select.options[index].selected = true;

				self.triggerChange();

				// self.close();
			});
		});

		// Событие при изменении настоящего select
		this.select.addEventListener('change', function(){
			self.changeActive(self.options[self.select.options.selectedIndex]);
		});
	};

	w.Select = Select;
})(window);
