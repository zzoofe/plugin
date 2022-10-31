(function(w){
	const Request = function () {
		this.url = 'https://estes.ru/get.php';
	};

	const p = Request.prototype;

	/**
	 * Получаем нужный объект XMLHttp для работы с запросами
	 */
	p.getXmlHttp = function () {
		let xmlhttp;
		try {
			xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try {
				xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (E) {
				xmlhttp = false;
			}
		}
		if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
			xmlhttp = new XMLHttpRequest();
		}

		return xmlhttp;
	};

	/**
	 * Совершаем запрос
	 */
	p.create = function (obj, callback) {
		var xmlhttp = this.getXmlHttp();
		xmlhttp.open(obj.method, obj.url, true);
		xmlhttp.setRequestHeader('Content-Type', obj.type);
		xmlhttp.send(obj.data);

		xmlhttp.onreadystatechange = function () {
			if (xmlhttp.readyState == 4) {
				callback(xmlhttp.responseText, xmlhttp.status);
			}
		};
	};

	/**
	 * Получаем json
	 */
	p.getJSON = function (url, callback) {
		this.create({
			data:   null,
			type:   'application/json',
			method: 'GET',
			url:    url
		}, function(data, status) {
			if (callback) callback(JSON.parse(data), status);
		});
	};

	w.Request = Request;
})(window);