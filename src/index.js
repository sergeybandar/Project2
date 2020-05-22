const renderDate = require('./renderDate.js');
const getPeople = require('./getPeople.js');
class App {
    constructor(elem, position) {
        this.elem = elem;
        this.position = position;
        this.map = null;
        this.loading = 0;
    }

    async start() {
        try {
        this.data = (await axios.get(`https://api.covid19api.com/summary`)).data;
            ymaps.ready(() => this.initMap());
            this.init();
        } catch (err) {
            this.loading++;
            if(this.loading>=5){
                return 0;
            }
            console.log(err);
            this.start();
        }
    }
    async initMap() {
        this.map = new ymaps.Map("map", {
            center: this.position.center,
            zoom: this.position.zoom
        });
        for (let i = 0; i < this.data.Countries.length; i++) {
            this.displayDiagram(this.data.Countries[i]);
        }
    }
    async init() {
        this.renderTabel(this.data.Countries, 'Confirmed');
        this.renderTabel(this.data.Countries, 'Deaths');
        this.renderTabel(this.data.Countries, 'Recovered');
        const totalConfirmed = document.getElementById('totalConfirmed');
        const totalDeaths = document.getElementById('totalDeaths');
        const totalRecovered = document.getElementById('totalRecovered');
        totalConfirmed.innerHTML = `<h3>Total Confirmed</h3><h2>${this.data.Global.TotalConfirmed}${this.data.Global.NewConfirmed === 0 ? '' : `(+${this.data.Global.NewConfirmed})`}</h2>`;
        totalRecovered.innerHTML = `<h3>Total Confirmed</h3><h2>${this.data.Global.TotalRecovered}${this.data.Global.NewRecovered === 0 ? '' : `(+${this.data.Global.NewRecovered})`}</h2>`;
        totalDeaths.innerHTML = `<h3>Global Deaths</h3><h2>${this.data.Global.TotalDeaths}${this.data.Global.NewDeaths === 0 ? '' : `(+${this.data.Global.NewDeaths})`}</h2>`;
        this.text = (await axios.get(`https://api.covid19api.com/world`)).data;
        const totalData = (await axios.get(`https://api.covid19api.com/world`)).data;
        this.renderTotalCenterTable(totalData);
        this.renderTotalChart(totalData);
        renderDate();
    }
    async displayDiagram(country) {
        const countryGeoCode = await ymaps.geocode(`${country.Country}`);
        const coords = countryGeoCode.geoObjects.get(0).geometry.getCoordinates();
        const myPieChart = new ymaps.Placemark(coords, {
            data: [
                { weight: country.TotalConfirmed - country.TotalDeaths - country.TotalRecovered, color: 'red' },
                { weight: country.TotalDeaths, color: 'black' },
                { weight: country.TotalRecovered, color: 'green' }
            ],
            iconContent: getPeople(country.TotalConfirmed),
        }, {
            iconLayout: 'default#pieChart',
            iconPieChartRadius: 20,
            iconPieChartCoreRadius: 10,
            iconPieChartCoreFillStyle: '#ffffff',
            iconPieChartStrokeStyle: '#ffffff',
            iconPieChartStrokeWidth: 3,
            iconPieChartCaptionMaxWidth: 200
        });
        this.map.geoObjects.add(myPieChart);
        myPieChart.events.add('click', async () => {
            const countryData = (await axios.get(`https://api.covid19api.com/total/country/${country.Country}`)).data;
            this.renderCenterTable(countryData);
            this.renderChart(countryData);
        });
    }
    async renderTabel(countries, type) {
        const elem = document.getElementById(`${type}`);
        if (type === 'Confirmed') {
            elem.innerHTML = `<tr><th>Confirmed Cases by Country(New)</th></tr>`;
        } else if (type === 'Deaths') {
            elem.innerHTML = '<tr><th>Deaths(New)</th></tr>'
        } else if (type === 'Recovered') {
            elem.innerHTML = '<tr><th>Tecovered(New)</th></tr>';
        }
        for (let i = 0; i < countries.length; i++) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td><span>${countries[i][`Total${type}`]}${countries[i][`New${type}`] === 0 ? '' : `(+${countries[i][`New${type}`]})`} ${countries[i].Country}</span></td>`;
            tr.addEventListener('click', async () => {
                const countryData = (await axios.get(`https://api.covid19api.com/total/country/${countries[i].Country}`)).data;
                this.renderCenterTable(countryData);
                this.renderChart(countryData);
            })
            elem.appendChild(tr);
        }
        document.querySelector(`#${type} tr th`).addEventListener('click', () => {
            const countriesSort = [...countries];
            countriesSort.sort((a, b) => b[`Total${type}`] - a[`Total${type}`]);
            if (JSON.stringify(countries) === JSON.stringify(countriesSort)) {
                this.renderTabel(this.data.Countries, `${type}`);
            } else {
                this.renderTabel(countriesSort, `${type}`);
            }
        })
    }
    renderCenterTable(data) {
        const table = document.getElementById('centerTable');
        table.innerHTML = `<tr><th colspan="7"><span class="dataCenter">${data[0].Country} data</span></th></tr><tr><th>Date</th><th>Confirmed</th><th>Deaths</th><th>Recovered</th><th>New Confirmed</th><th>New Deaths</th><th>New Recovered</th></tr>`;
        for (let i = 0; i < data.length; i++) {
            const tr = document.createElement('tr');
            if (data[i].Confirmed === 0) {
                continue;
            }
            if (i === 0) {
                tr.innerHTML = `<td>${data[i].Date.slice(0, 10)}</td><td>${data[i].Confirmed}</td><td>${data[i].Deaths}</td><td>${data[i].Recovered}</td><td>${data[i].Confirmed}</td><td>${data[i].Deaths}</td><td>${data[i].Recovered}</td>`;
            } else {
                tr.innerHTML = `<td>${data[i].Date.slice(0, 10)}</td><td>${data[i].Confirmed}</td><td>${data[i].Deaths}</td><td>${data[i].Recovered}</td><td>${data[i].Confirmed - data[i - 1].Confirmed}</td><td>${data[i].Deaths - data[i - 1].Deaths}</td><td>${data[i].Recovered - data[i - 1].Recovered}</td>`;
            }
            table.appendChild(tr);
        }
    }
    renderTotalCenterTable(data) {
        data.sort((a, b) => a.TotalConfirmed - b.TotalConfirmed);
        const table = document.getElementById('centerTable');
        table.innerHTML = `<tr><th colspan="7"><span class="dataCenter">Global data</span></th></tr><tr><th>№</th><th>Confirmed</th><th>Deaths</th><th>Recovered</th><th>New Confirmed</th><th>New Deaths</th><th>New Recovered</th></tr>`;
        for (let i = 0; i < data.length; i++) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${i + 1}</td><td>${data[i].TotalConfirmed}</td><td>${data[i].TotalDeaths}</td><td>${data[i].TotalRecovered}</td><td>${data[i].NewConfirmed}</td><td>${data[i].NewDeaths}</td><td>${data[i].NewRecovered}</td>`;
            table.appendChild(tr);
        }
    }
    async renderChart(countryData) {
        const chart = document.getElementById('chart');
        chart.innerHTML = '';
        const coordsCon = [];
        const coordsDeat = [];
        const coordsRec = [];
        const date = [];
        const data = [];
        for (let i = 0; i < countryData.length; i++) {
            if (countryData[i].Confirmed === 0) {
                continue;
            }
            data.push(countryData[i]);
        }
        data.reverse();
        for (let i = data.length - 1; i > 0; i -= Math.floor(data.length / 10)) {
            date.push(data[i].Date.slice(0, 10));
            coordsCon.push(data[i].Confirmed);
            coordsDeat.push(data[i].Deaths);
            coordsRec.push(data[i].Recovered);
        }
        Highcharts.chart('chart', {
            chart: {
                type: 'column'
            },
            title: {
                text: 'COVID 2019'
            },
            xAxis: {
                categories: date,
                type: 'datetime',
                crosshair: true
            },
            rangeSelector: {
                enabled: true
            },
            navigator: {
                enabled: true
            },
            yAxis: {
                min: 0,
                title: {
                    text: ''
                }
            },
            tooltip: {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                    '<td style="padding:0"><b>{point.y:.1f} people</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0
                }
            },
            series: [{
                color: "#e60000",
                name: 'Confirmed',
                data: coordsCon

            }, {
                color: "black",
                name: 'Deaths',
                data: coordsDeat

            }, {
                color: "#70a800",
                name: 'Recovered',
                data: coordsRec

            }]
        });
    }
    async renderTotalChart(countryData) {
        const chart = document.getElementById('chart');
        chart.innerHTML = '';
        const coordsCon = [];
        const coordsDeat = [];
        const coordsRec = [];
        const date = [];
        //const data = [];
        countryData.sort((a, b) => a.TotalConfirmed - b.TotalConfirmed);
        //data.reverse();

        for (let i = 0; i < countryData.length; i++) {

            coordsCon.push(countryData[i].TotalConfirmed);
            coordsDeat.push(countryData[i].TotalDeaths);
            coordsRec.push(countryData[i].TotalRecovered);
        }
        for (let i = 0; i < coordsCon.length; i++) {
            date.push(i + 1);
        }
        Highcharts.chart('chart', {
            chart: {
                type: 'column'
            },
            title: {
                text: 'COVID 2019'
            },
            xAxis: {
                categories: date,

                crosshair: true
            },
            rangeSelector: {
                enabled: true
            },
            navigator: {
                enabled: true
            },
            yAxis: {
                min: 0,
                title: {
                    text: ''
                }
            },
            tooltip: {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                    '<td style="padding:0"><b>{point.y:.1f} people</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0
                }
            },
            series: [{
                color: "#e60000",
                name: 'Confirmed',
                data: coordsCon

            }, {
                color: "black",
                name: 'Deaths',
                data: coordsDeat

            }, {
                color: "#70a800",
                name: 'Recovered',
                data: coordsRec

            }]
        });
    }
}
const app = new App(document.getElementById('app'), {
    center: [27, 21],
    zoom: 2
});
app.start();
