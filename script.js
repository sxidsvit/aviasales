const formSearch = document.querySelector('.form-search'),
	inputCitiesFrom = formSearch.querySelector('.input__cities-from'),
	dropdownCitiesFrom = formSearch.querySelector('.dropdown__cities-from'),
	inputCitiesTo = formSearch.querySelector('.input__cities-to'),
	dropdownCitiesTo = formSearch.querySelector('.dropdown__cities-to'),
	inputDateDepart = formSearch.querySelector('.input__date-depart');
// db/cities.json' - локальная БД городов

//онлайн база городов, прокси, ключ АПИ и БД по календарю цен
const CITY_API = 'http://api.travelpayouts.com/data/ru/cities.json',
	PROXY = 'https://cors-anywhere.herokuapp.com/',
	API_KEY = '5d2e3c92f5cbb5b20d19b432ed48fb95',
	// Получение минимальных цен на перелёт для указанных даты вылета и городов вылета и назначения
	CALENDAR = 'http://min-prices.aviasales.ru/calendar_preload'


let city = [];

// --- функции
const getData = (url, callback) => {

	const request = new XMLHttpRequest();

	request.open('GET', url);

	request.addEventListener('readystatechange', () => {
		if (request.readyState !== 4) return;

		if (request.status === 200) {
			callback(request.response);
		} else {
			console.error(request.status);
		}
	});

	request.send();
}

const showCity = (input, list) => {
	list.textContent = '';

	if (input.value !== '') {
		const filterCity = city.filter((item) => {
			const fixItem = item.name.toLowerCase();
			return fixItem.includes(input.value.toLowerCase());
		});

		filterCity.forEach((item) => {
			const li = document.createElement('li');
			li.classList.add('dropdown__city');
			li.textContent = item.name;
			list.append(li);
		});
	} else {
		return;
	}
};

const selectCity = (event, input, list) => {
	const target = event.target;
	if (target.tagName.toLowerCase() === 'li') {
		input.value = target.textContent;
		list.textContent = '';
	}
}

const renderCheapDay = (cheapTicket) => {
	console.log('cheapTicketDay: ', cheapTicket);

}

const renderCheapYear = (cheapTicket) => {
	cheapTicket.sort((a, b) => {
		if (a.value < b.value) {
			return -1;
		}
		if (a.value > b.value) {
			return 1;
		}
		return 0;
	})
	const prices = cheapTicket.map(item => item.value)
	console.log('prices increase: ', prices);
	// console.log('cheapTicketYear: ', cheapTicket);

}

const renderCheap = (data, date) => {
	const cheapTicketYear = JSON.parse(data).best_prices
	const cheapTicketDay = cheapTicketYear.filter((item) => { return item.depart_date === date })

	renderCheapDay(cheapTicketDay)
	renderCheapYear(cheapTicketYear)
}


// --- обработчики событий
inputCitiesFrom.addEventListener('input', () => {
	showCity(inputCitiesFrom, dropdownCitiesFrom)
});

inputCitiesTo.addEventListener('input', () => {
	showCity(inputCitiesTo, dropdownCitiesTo)
});

dropdownCitiesFrom.addEventListener('click', () => {
	selectCity(event, inputCitiesFrom, dropdownCitiesFrom);
});

dropdownCitiesTo.addEventListener('click', () => {
	selectCity(event, inputCitiesTo, dropdownCitiesTo);
});

formSearch.addEventListener('submit', (event) => {
	event.preventDefault()

	const cityFromCode = city.find((item) => inputCitiesFrom.value === item.name).code
	const cityToCode = city.find((item) => inputCitiesTo.value === item.name).code

	const formData = {
		from: cityFromCode,
		to: cityToCode,
		when: inputDateDepart.value
	}
	// console.log('formData: ', formData);

	const requestData = CALENDAR +
		`?depart_date=${formData.when}&origin=${formData.from}&destination=${formData.to}&one_way=true&token=${API_KEY}`;

	// console.log('requestData: ', requestData);

	getData(requestData, response => {
		renderCheap(response, formData.when)
	})
})


// --- вызовы функций
getData(PROXY + CITY_API, (data) => {
	// выбираем только те объекты у которых не пустое поле name
	city = JSON.parse(data).filter(item => item.name);
});
