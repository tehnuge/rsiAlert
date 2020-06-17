const av = require('alphavantage');
const {stocks} = require('./stocks');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const util = require('util');
fs = require('fs');

const avApiLim = 5;
const TIMEOUT = 300000;
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const writeToCsv = data => {
  console.log("ROWS:", data)

  const csvWriter = createCsvWriter({
    path: 'rsiLogs.csv',
    header: [
      { id: 'date', title: 'DATE' },
      { id: 'name', title: 'NAME' },
      { id: 'rsi', title: 'RSI' }
    ],
    append: true
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

const resolvePromise = stocks => {
  let promises = [];
  stocks.forEach(stock => {
    promises.push(callAv(stock))
  }
  )
  Promise.all(promises).then(() => {
    writeToCsv(rows);
    rows = [];
  }).catch(err => { console.log("ERR: ", err)})
}

const resolvePromises = allStocks => {
  if(allStocks.length === 0){
    return;
  }
  setTimeout(() => {
    let temp = allStocks.pop();
    let promises = [];
    temp.forEach(stock => {
      promises.push(callAv(stock))
    })
    Promise.all(promises).then(() => {
      writeToCsv(rows);
      rows = []
      resolvePromises(allStocks);
    }).catch(err => { console.log("ERR! ", err)})
  }, TIMEOUT);
}

const callAv = stock => (
  a.technical.rsi(stock, 'daily', 14, 'close').then(data => {
    if (!data){
      console.log('no data for ', stock);
      return;
    }
    let days = data["Technical Analysis: RSI"];
    let today = dateToday();
    let rsi = days[today]['RSI']
    rows.push({
      date: today,
      name: data["Meta Data"]["1: Symbol"],
      rsi: rsi,
    });
  }).catch(err => {console.log("ERRORRR on :",data["Meta Data"]["1: Symbol"], err)})
)

let rows = [];
let a = av({ key: process.env.KEY })

const main = (stocks) => {
  let allStocks = [];
  let stocksChunk = [];
  for(let i = 0; i<stocks.length; i++){
    if(stocksChunk.length < avApiLim){
      stock = stocks[i];
      stocksChunk.push(stock);
    }
    else{
      allStocks.push(stocksChunk);
      stocksChunk = [];
    }
  }

  if(stocksChunk.length > 0){
    allStocks.push(stocksChunk)
  }
  let firstStocks = allStocks.pop();
  resolvePromise(firstStocks);
  resolvePromises(allStocks);
}

main(stocks)
// let a = av({ key: process.env.KEY })
//   a.performance.sector().then(data => {
//     console.log(data)
//   });
