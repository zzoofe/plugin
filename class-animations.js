/*
 * Анимации
*/
(function(w) {
	const DOMAnimations = function () {
		return false;
	};

	const p = DOMAnimations.prototype;

	/**
	 * SlideUp
	 *
	 * @param {HTMLElement} element
	 * @param {Number} duration
	 * @param {Function} callback
	 * @returns {undefined}
	 */
	p.slideUp = function(element, duration, callback) {
		element.classList.remove('open');
		const height = element.offsetHeight;
		element.classList.add('open');
		element.style.height = element.offsetHeight + 'px';
		element.style.transitionProperty = "height, margin, padding";
		element.style.transitionDuration = duration + 'ms';
		element.offsetHeight;
		element.style.overflow = 'hidden';
		element.style.height = height + 'px';
		element.style.paddingTop = '0';
		element.style.paddingBottom = '0';
		element.style.marginTop = '0';
		element.style.marginBottom = '0';
		window.setTimeout(function () {
			element.removeAttribute('style');
			if(callback) callback();
		}, duration);
	};

	/**
	 * SlideDown
	 *
	 * @param {HTMLElement} element
	 * @param {Number} duration
	 * @param {Function} callback
	 * @returns {undefined}
	 */
	p.slideDown = function(element, duration, callback) {
		element.classList.add('open');
		const height = element.offsetHeight;
		element.classList.remove('open');
		element.style.overflow = 'hidden';
		element.style.paddingTop = '0';
		element.style.paddingBottom = '0';
		element.style.marginTop = '0';
		element.style.marginBottom = '0';
		element.offsetHeight;
		element.style.transitionProperty = "max-height, height, margin, padding";
		element.style.transitionDuration = duration + 'ms';
		element.style.height = height + 'px';
		element.style.maxHeight = height + 'px';
		element.style.removeProperty('padding-top');
		element.style.removeProperty('padding-bottom');
		element.style.removeProperty('margin-top');
		element.style.removeProperty('margin-bottom');
		window.setTimeout(function () {
			element.removeAttribute('style');
			if(callback) callback();
		}, duration);
	};

	/**
	* Fade
	*
	* @param {String} type type 'out' (default) || 'in'
	* @param {Number} ms animation duration
	* @returns {undefined}
	*/
	p.fade = function(type, ms) {
		let isIn = type === 'in',
			opacity = isIn ? 0 : 1,
			interval = 10,
			duration = ms,
			gap = interval / duration,
			self = this;

		if (isIn) {
			self.el.style.display = '';
			self.el.style.opacity = opacity;
		}

		function func() {
			opacity = isIn ? opacity + gap : opacity - gap;
			self.el.style.opacity = opacity;

			if (opacity <= 0) self.el.style.display = 'none'
			if (opacity <= 0 || opacity >= 1) window.clearInterval(fading);
		}

		var fading = window.setInterval(func, interval);
	};

	w.DOMAnimations = DOMAnimations;
})(window);