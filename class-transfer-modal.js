/**
 * Методы для сокращения синтаксиса (замена jQuery)
 */
import { qS, qSA, each } from '../cuts';
import { mmodal, transfer } from '../globals';

/**
 * Перемещение контента в модальное окно
 */
(function(w){
	const ModalTransfer = function () {

		this.className = '.modal-transfer';
		this.modal = qS(this.className);

		if (!qS(this.className)) return;

		this.outer = this.modal.querySelector(this.className + '__outer');
		this.replacer = document.createElement('div');
		this.replacer.setAttribute('class', 'modal-replacer');

		this.item = undefined;
		this.innerClassName = 'modal-transfer__inner';

		this.closeHandler = this.closeHandler.bind(this);
		this.transferModalHandler = this.transferModalHandler.bind(this);

		transfer = this;

		this.default();
	};

	const p = ModalTransfer.prototype;

	p.closeHandler = function(){
		this.replacer.parentNode.replaceChild(this.item, this.replacer);

		mmodal.m.removeEventListener('afterClose', this.closeHandler, false);

		this.item.classList.remove(this.innerClassName);

		mmodal.out.classList.remove('transfer');

		this.item = undefined;
	};

	p.make = function (item){
		this.item = item;
		
		this.item.classList.add(this.innerClassName);

		this.item.parentNode.replaceChild(this.replacer, this.item);

		this.outer.appendChild(this.item);

		mmodal.open(this.className);

		mmodal.out.classList.add('transfer');

		mmodal.m.addEventListener('afterClose', this.closeHandler, false);
	};

	p.transferModalHandler = function(e){
		e.preventDefault();

		this.make(qS(e.target.getAttribute('data-content')));
	};

	p.default = function(){
		const self = this;

		each(qSA('.transfer-modal'), function(item){
			item.addEventListener('click', self.transferModalHandler, false);
		});
	};

	w.ModalTransfer = ModalTransfer;
})(window);

