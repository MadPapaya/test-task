const fetch = require('node-fetch');
const moment = require('moment');
const Chart = require('chart.js')

let dateArr = [];
for (let i = 0; i < 7; i++) {
    dateArr[i] = moment().subtract(6 - i, 'days').format('YYYY-MM-DD');
}

const currencyArray = {
    USD: 145,
    USD1: 431,
    EUR: 292,
    EUR1: 451,
    RUR: 298,
    RUR1: 456
};

async function rates(date) {
    if (moment(date, 'YYYY-MM-DD', true).isValid()) {
        const response = await fetch(`http://www.nbrb.by/api/exrates/rates?ondate=${date}&periodicity=0`, {
            method: 'GET'
        });
        const json = await response.json();
        const ids = Object.values(currencyArray);
        sorted = json.filter(element => ids.includes(element.Cur_ID));
        return await Promise.resolve(sorted);
    }
    return Promise.reject('Wrong date format');
}
let ratesArr = [];
let currencyNum = 0;

function parseRatesData(sorted) {
    let rate;
    for (let i = 0; i < 3; i++) {
        rate = sorted[i].Cur_OfficialRate;
        if (i == currencyNum) {
            ratesArr.push(rate);
        }
    }
}

async function getRates() {
    for (let i = 0; i < dateArr.length; i++) {
        let sorted = await rates(dateArr[i]);
        parseRatesData(sorted);
    }
    callback();
}

function callback() {
    const ratesCanvas = document.getElementById("rates");
    const currSel = document.getElementById("currencySelection");
    const button = document.getElementById("button");
    button.addEventListener("click", changeDate);
    let currency = currSel.options[currSel.selectedIndex].value;
    currSel.addEventListener("click", checkCurrency);

    function updateConfigByMutating() {
        lineChart.data.datasets.forEach((dataset) => {
            dataset.data = ratesArr;
        });
        lineChart.data.labels = dateArr;
        lineChart.update();
    }

    function changeDate() {
        let startDate = moment(document.getElementById("start").value);
        let endDate = moment(document.getElementById("end").value);
        let days = endDate.diff(startDate, 'days');
        if (days > 31 || days < 0 || isNaN(days)) {
            alert('Choose an interval no more than a month')
        } else if (days <= 31 && days >= 0) {
            dateArr = [];
            for (let i = 0; i <= days; i++) {
                dateArr[i] = moment(endDate).subtract(days - i, 'days').format('YYYY-MM-DD');
            }
            getRates();
        }
    }

    let ratesData = {
        labels: dateArr,
        datasets: [{
            label: "exchange rates to the Belarusian ruble",
            data: ratesArr,
            lineTension: 0,
            fill: false,
            borderColor: 'orange',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            pointBorderColor: 'orange',
            pointBackgroundColor: 'rgba(255,150,0,0.5)',
            pointRadius: 5,
            pointHoverRadius: 10,
            pointHitRadius: 30,
            pointBorderWidth: 2,
            pointStyle: 'rectRounded'
        }]
    };

    let chartOptions = {
        legend: {
            display: true,
            position: 'top',
            labels: {
                boxWidth: 80,
                fontColor: 'black'
            }
        }
    };

    let lineChart = new Chart(ratesCanvas, {
        type: 'line',
        data: ratesData,
        options: chartOptions
    });

    let timerId = setInterval(updateConfigByMutating, 500);

    function checkCurrency() {
        currency = currSel.options[currSel.selectedIndex].value;
        if (currency != currencyNum) {
            currencyNum = currency;
            ratesArr = [];
            getRates();
        }
    }
}

getRates();