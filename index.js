const av = require('alphavantage')
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
let stocks = ['msft']

const dateToday = () => {
  let date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate() - 2;

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

  stocks.forEach(stock => {
    a.technical.rsi(stock, 'daily', 14, 'close').then(data => {
      let days = data["Technical Analysis: RSI"];
      let today = dateToday();
      console.log('date: ', today)
      let rsi = days[today]['RSI']
      console.log(rsi)

    });
  });

}

main(stocks, process.env.KEY)
