let dataL;
const apiKey = "f47e03bfb3fedbe89cc4448684399060";
var maxTemp = [];
var minTemp = [];
var latitude = 0;
var longitude = 0;
var units = "metric";
var endpoint = "";
let city = "";

function getLocation() {
	function success(position) {
		latitude = position.coords.latitude;
		longitude = position.coords.longitude;

		fetchCurrent();
	}
	function error() {
		status.textContent = "Unable to retrieve your location";
	}

	if (!navigator.geolocation) {
		status.textContent = "Geolocation is not supported by your browser";
	} else {
		status.textContent = "Locating…";
		navigator.geolocation.getCurrentPosition(success, error);
	}
}

function pushDataInColumns(element, index) {
	let dayOfWeek = new Date(element.dt * 1000).toLocaleString("en-GB", {
		weekday: "short",
	});
	let dateMonth = new Date(element.dt * 1000).toLocaleString("en-GB", {
		month: "short",
	});
	let dayMonth = new Date(element.dt * 1000).toLocaleString("en-GB", {
		day: "numeric",
	});
	document.getElementById(
		"day" + index
	).innerHTML = `${dayOfWeek} </br> ${dayMonth} ${dateMonth}`;

	document.getElementById("imgDay" + index).src =
		"https://openweathermap.org/themes/openweathermap/assets/vendor/owm/img/widgets/" +
		element.weather[0].icon +
		".png";
}

const fetchCurrent = (city) => {
	if (city) {
		let baseURL = "https://api.openweathermap.org/data/2.5/weather?q=";
		endPoint = baseURL + city + "&appid=" + apiKey + "&units=" + units;
	} else {
		let baseURL = "https://api.openweathermap.org/data/2.5/weather?";
		endPoint =
			baseURL +
			"lat=" +
			latitude +
			"&lon=" +
			longitude +
			"&appid=" +
			apiKey +
			"&units=" +
			units;
	}

	fetch(endPoint)
		.then((response) => response.json())
		.then((data) => {
			if (data.cod != 200) {
				document.getElementById("alert").classList.remove("d-none");
				document.getElementById(
					"alert"
				).innerHTML = ` ${data.message} . To make search more precise put the city's name, comma, 2-letter country code`;
			} else {
				document.getElementById("alert").classList.add("d-none");

				latitude = data.coord.lat;

				longitude = data.coord.lon;

				function capitalizeFirstLetter(string) {
					return string.charAt(0).toUpperCase() + string.slice(1);
				}

				document.getElementById("location").innerHTML =
					"Weather for " + data.name + ", " + data.sys.country;
				document.getElementById("condition").innerHTML = capitalizeFirstLetter(
					data.weather[0].description
				);
				document.getElementById("imageCondition").src =
					"https://openweathermap.org/themes/openweathermap/assets/vendor/owm/img/widgets/" +
					data.weather[0].icon +
					".png";

				document.getElementById("temp").innerHTML =
					Math.round(data.main.temp) + " °C";

				document.getElementById(
					"wind"
				).innerHTML = `Wind: ${data.wind.speed.toFixed(1)} m/s`;
				fetch7Days();
			}
		})

		.catch((error) => console.log("error", error));
};

const fetch7Days = () => {
	var requestOptions = {
		method: "GET",
		redirect: "follow",
	};
	let baseURL = "https://api.openweathermap.org/data/2.5/onecall?";
	let endPoint =
		baseURL +
		"lat=" +
		latitude +
		"&lon=" +
		longitude +
		"&appid=" +
		apiKey +
		"&units=" +
		units;
	fetch(endPoint, requestOptions)
		.then((response) => response.json())
		.then((result) => {
			result.daily.forEach((element, index) => {
				pushDataInColumns(element, index);
				minTemp.push(element.temp.min);
				maxTemp.push(element.temp.max);
			});
		})
		.catch((error) => console.log("error", error));
	setTimeout(() => {
		drawGraph();
	}, 200);
};

var myChart;

function drawGraph() {
	myChart ? myChart.destroy() : undefined;
	let width, height, gradient;
	function getGradient(ctx, chartArea) {
		const chartWidth = chartArea.right - chartArea.left;
		const chartHeight = chartArea.bottom - chartArea.top;
		if (gradient === null || width !== chartWidth || height !== chartHeight) {
			// Create the gradient because this is either the first render
			// or the size of the chart has changed
			width = chartWidth;
			height = chartHeight;
			gradient = ctx.createLinearGradient(
				0,
				chartArea.bottom,
				0,
				chartArea.top
			);
			gradient.addColorStop(0, "rgb(54, 162, 235)");
			gradient.addColorStop(0.5, "rgb(255, 205, 86)");
			gradient.addColorStop(1, "rgb(255, 99, 132)");
		}

		return gradient;
	}
	var range = ["", "", "", "", "", "", "", ""];
	// For drawing the lines
	var ctx = document.getElementById("myChart");
	myChart = new Chart(ctx, {
		type: "line",
		data: {
			labels: range,
			datasets: [
				{
					label: "minTemp",
					data: minTemp,
					fill: false,
					borderColor: function (context) {
						const chart = context.chart;
						const { ctx, chartArea } = chart;

						if (!chartArea) {
							// This case happens on initial chart load
							return null;
						}
						return getGradient(ctx, chartArea);
					},
					tension: 0.3,
					datalabels: {
						align: "bottom",
						offset: 10,
					},
				},
				{
					label: "maxTemp",
					data: maxTemp,
					borderColor: function (context) {
						const chart = context.chart;
						const { ctx, chartArea } = chart;

						if (!chartArea) {
							// This case happens on initial chart load
							return null;
						}
						return getGradient(ctx, chartArea);
					},
					tension: 0.3,
					fill: "-1",
					backgroundColor: "rgba(255,193,8,0.5)",
					datalabels: {
						align: "top",
						offset: 10,
					},
				},
			],
		},
		plugins: [ChartDataLabels],
		options: {
			maintainAspectRatio: false,
			layout: {
				padding: {
					left: 15,
					top: 30,
					bottom: 30,
					right: 10,
				},
			},
			plugins: {
				datalabels: {
					color: "#36A2EB",
					formatter: function (value, context) {
						return Math.round(value) + "°";
					},
					font: {
						size: 14,
					},
				},
				legend: {
					display: false,
					position: "right",
				},
			},
			scales: {
				x: {
					display: false,
					grid: {
						display: false,
					},
				},
				y: {
					display: false,
					grid: {
						display: false,
					},
				},
			},
		},
	});
	setTimeout(() => {
		changeWidth();
	}, 30);
	myChart.update();
}

document.getElementById("getLocation").addEventListener("click", () => {
	maxTemp = [];
	minTemp = [];
	latitude = 0;
	longitude = 0;
	if (myChart) {
		myChart.destroy();
	}
	setTimeout(() => {
		getLocation();
	}, 100);
	myChart.update();
});

document.getElementById("searchButton").addEventListener("click", (e) => {
	latitude = 0;
	longitude = 0;
	maxTemp = [];
	minTemp = [];
	e.preventDefault();
	city = document.getElementById("searchBox").value;

	setTimeout(() => {
		fetchCurrent(city);
	}, 200);
	myChart.update();
	document.getElementById("searchBox").value = "";
});

function changeWidth() {
	let offset = 0;
	if ($(".dayAndIcon")[0].scrollWidth <= 604) {
		offset = 30;
		myChart.options.layout.padding.left = 10;
	} else if ($(".dayAndIcon")[0].scrollWidth <= 615) {
		offset = 45;
		myChart.options.layout.padding.left = 10;
	} else if ($(".dayAndIcon")[0].scrollWidth <= 735) {
		offset = 55;
	} else if ($(".dayAndIcon")[0].scrollWidth < 900) {
		offset = 65;
		myChart.options.layout.padding.left = 25;
	}
	let valueWidth = $(".dayAndIcon")[0].scrollWidth - offset;
	$(".changeMe").css("width", valueWidth);
}
