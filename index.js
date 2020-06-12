const av = require('alphavantage');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
let stocks = ['msft', 'aapl']

const writeToCsv = data => {
  console.log("ROWS:", data)

  const csvWriter = createCsvWriter({
    path: 'rsiLogs.csv',
    header: [
      { id: 'date', title: 'DATE' },
      { id: 'name', title: 'NAME' },
      { id: 'rsi', title: 'RSI' }
    ]
  });

  const records = [];
  for (let i = 0; i < data.length; i++) {
    let datum = data[i];
    records.push({
      date: datum.date,
      name: datum.name,
      rsi: datum.rsi
    })
  }

  csvWriter.writeRecords(records)  
    .then(() => {
      console.log('...Done writing csv');
    });
}

const dateToday = () => {
  let date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate() - 1;

  if (day < 10) {
    day = '0' + day;
  }
  if (month < 10) {
    month = '0' + month;
  }

  return formattedDate = year + '-' + month + '-' + day
}

const main = (stocks, avKey) => {

  let a = av({ key: avKey })
  // a.performance.sector().then(data => {
  //   console.log(data)
  // });

  let rows = [];
  let promises = [];
  stocks.forEach(stock => {
    promises.push(
      a.technical.rsi(stock, 'daily', 14, 'close').then(data => {
        let days = data["Technical Analysis: RSI"];
        let today = dateToday();
        let rsi = days[today]['RSI']
        rows.push({
          date: today,
          name: stock,
          rsi: rsi,
        });
      })
    );
  });

  Promise.all(promises).then( values => {
    writeToCsv(rows);
  });

}

main(stocks, process.env.KEY)
