<template>
  <h2>Back Test</h2>
  <TickerBar/>

  <n-card>
    <n-grid x-gap="12" :cols="2">
      <n-gi>
        <n-date-picker v-model:value="dateRange" type="daterange" clearable />
      </n-gi>
      <n-gi>
        <n-button type="primary" @click="submitBacktest">Submit</n-button>
      </n-gi>
    </n-grid>
  </n-card>

  <n-card style="margin-bottom: 10px">

    <n-checkbox-group v-model:value="selectedIndicators">
      <n-space item-style="display: flex;">
        <n-checkbox :value="indicator" :label="indicator" v-for="indicator in chartIndicators" @click="updateAvailableIndicators(indicator)"/>
      </n-space>
    </n-checkbox-group>

    <n-checkbox-group v-model:value="selectedTimeframe">
      <n-space item-style="display: flex;">
        <n-checkbox :value="timeframe" :label="timeframe" v-for="timeframe in chartTimeframes" @click="updateCurrentTimeframe(timeframe)"/>
      </n-space>
    </n-checkbox-group>


    <div id="chart" style="height:600px"></div>
    <div id="rsi" style="height:100px"></div>
    <div id="macd" style="height:100px"></div>
    <div id="equity" style="height:100px"></div>
  </n-card>

  <n-card>
    <n-data-table
        :columns="closedOrdersTableColumns"
        :data="closedOrdersTableData"
        :pagination="closedOrdersTablePagination"
        :max-height="250"
        size="small"
    />

    <p>Final Balance: {{ finalBalance }}</p>
  </n-card>

</template>

<script setup>
definePageMeta({
    middleware: 'auth'
})
import {clearIntervalAsync, setIntervalAsync} from "set-interval-async";
import { CrossUp, CrossDown } from "technicalindicators";
import { SMA, RSI, MACD, BollingerBands } from '@debut/indicators';
import { useAppStore } from '~/stores/app.store';
const app = useAppStore()
let userID = useCookie('userID');
import { useMessage } from 'naive-ui';
const message = useMessage()

await app.loadUserExchangeData(userID.value);

let currentExchange = ref(app.getUserSelectedExchange);
let currentSymbol = ref(app.getUserSelectedMarket);


let chartInstance = {
  candleSeries:'',
  CandlesSeries: '',
  VolumeSeries: '',
  MA12Series: '',
  MA21Series: '',
  MA50Series: '',
  MA100Series: '',
  MA200Series: '',
  BBLowerSeries: '',
  BBMiddleSeries: '',
  BBUpperSeries: '',
};

let rsiChartInstance = {
  RSISeries: ''
};

let macdChartInstance = {
  MACDSeries: '',
  MACDSignalSeries: '',
  MACDHistogramSeries: '',
}

let equityChartInstance = {
  equityLineSeries: ''
};

let chartIndicators = ['volume', 'MA12', 'MA21', 'MA50', 'MA100', 'MA200', 'RSI', 'MACD', 'BB', 'equity'];
let selectedIndicators = ref(['volume', 'MA12', 'MA21', 'MA50', 'RSI', 'MACD', 'equity']);

let chartTimeframes = app.getAvailableTimeframes;

let selectedTimeframe = ref(['1m']);

let timeframeData = null;

let lastBarTime = null;


const currentTimestamp = Date.now();

// Calculate the timestamp of 7 days ago (in milliseconds)
const sevenDaysAgoTimestamp = currentTimestamp - 7 * 24 * 60 * 60 * 1000;

let dateRange = ref([sevenDaysAgoTimestamp, currentTimestamp]);

const closedOrdersTablePagination = false;
const closedOrdersTableColumns = [
  {
    title: "Symbol",
    key: "symbol"
  },
  {
    title: "Side",
    key: "side"
  },
  {
    title: "Price",
    key: "price"
  },
  {
    title: "Quantity",
    key: "quantity"
  },
  {
    title: "Cost",
    key: "cost"
  },
  {
    title: "Profit",
    key: "profit"
  },
  {
    title: "Type",
    key: "type"
  },
];

const closedOrdersTableData = ref([]);

const finalBalance = ref('');

let SMA12Indicator = new SMA(12);
let SMA21Indicator = new SMA(21);
let SMA50Indicator = new SMA(50);
let SMA100Indicator = new SMA(100);
let SMA200Indicator = new SMA(200);
let RSIIndicator = new RSI(14);
let MACDIndicator = new MACD(12, 26, 9);
let BBIndicator = new BollingerBands(20, 2);

onMounted(async () => {
  const { $lightweightCharts } = useNuxtApp()

  //init chart lib
  chartInstance = $lightweightCharts.createChart('chart', {
    autoSize: true,
    timeScale: {
      timeVisible: true,
    },
    rightPriceScale: {
      scaleMargins: {
        top: 0.3,
        bottom: 0.25,
      },
    },
    layout: {
      backgroundColor: '#18181c',
      lineColor: '#2B2B43',
      textColor: '#D9D9D9',
    },
    watermark: {
      color: 'rgba(0, 0, 0, 0)',
    },
    crossHair: {
      color: '#758696',
    },
    grid: {
      vertLines: {
        color: '#2B2B43',
      },
      horzLines: {
        color: '#363C4E',
      },
    },
  });

  //add candles series
  chartInstance.candlesSeries = chartInstance.addCandlestickSeries({
    autoScale:true,
    priceFormat: {
      type: 'price',
      precision: 4,
      minMove: 0.0001,
    },
  });

  //add volume series
  chartInstance.volumeSeries = chartInstance.addHistogramSeries({
    priceFormat: {
      type: 'volume',
    },
    priceScaleId: 'volume',
    priceLineVisible: false,
    scaleMargins: {
      top: 0.8,
      bottom: 0,
    },
  });

  //add MA12 series
  chartInstance.MA12Series = chartInstance.addLineSeries({
    color:'#a821f3',
    lineWidth:1,
    priceLineVisible: false,
    lastValueVisible: false,
    rightPriceScale: {
      visible: false,
    },
  });

  //add MA21 series
  chartInstance.MA21Series = chartInstance.addLineSeries({
    color:'#6921f3',
    lineWidth:1,
    priceLineVisible: false,
    lastValueVisible: false,
    rightPriceScale: {
      visible: false,
    },
  });

  //add MA50 series
  chartInstance.MA50Series = chartInstance.addLineSeries({
    color:'#ffeb3b',
    lineWidth:1,
    priceLineVisible: false,
    lastValueVisible: false,
    rightPriceScale: {
      visible: false,
    },
  });

  //add MA100 series
  chartInstance.MA100Series = chartInstance.addLineSeries({
    color:'#ff9800',
    lineWidth:1,
    priceLineVisible: false,
    lastValueVisible: false,
    rightPriceScale: {
      visible: false,
    },
    visible:false
  });

  //add MA200 series
  chartInstance.MA200Series = chartInstance.addLineSeries({
    color:'#f23645',
    lineWidth:1,
    priceLineVisible: false,
    lastValueVisible: false,
    rightPriceScale: {
      visible: false,
    },
    visible:false
  });

  //add BB series
  chartInstance.BBLowerSeries = chartInstance.addLineSeries({
    // priceScaleId: 'bb',
    color:'#459800',
    lineWidth:1,
    // priceLineVisible: false,
    // lastValueVisible: false,
    // rightPriceScale: {
    //   visible: false,
    // },
    visible:false
  });

  chartInstance.BBMiddleSeries = chartInstance.addLineSeries({
    // priceScaleId: 'bb',
    color:'#459800',
    lineWidth:1,
    // priceLineVisible: false,
    // lastValueVisible: false,
    // rightPriceScale: {
    //   visible: false,
    // },
    visible:false
  });

  chartInstance.BBUpperSeries = chartInstance.addLineSeries({
    // priceScaleId: 'bb',
    color:'#459800',
    lineWidth:1,
    // priceLineVisible: false,
    // lastValueVisible: false,
    // rightPriceScale: {
    //   visible: false,
    // },
    visible:false
  });

  //rsi chart
  rsiChartInstance = $lightweightCharts.createChart('rsi', {
    autoSize: true,
    timeScale: {
      timeVisible: true,
    },
    rightPriceScale: {
      scaleMargins: {
        top: 0.3,
        bottom: 0.25,
      },
    },
    layout: {
      backgroundColor: '#18181c',
      lineColor: '#2B2B43',
      textColor: '#D9D9D9',
    },
    watermark: {
      color: 'rgba(0, 0, 0, 0)',
    },
    crossHair: {
      color: '#758696',
    },
    grid: {
      vertLines: {
        color: '#2B2B43',
      },
      horzLines: {
        color: '#363C4E',
      },
    },
  });

  //add RSI series
  rsiChartInstance.RSISeries = rsiChartInstance.addLineSeries({
    // priceScaleId: 'rsi',
    // priceLineVisible: false,
    // lastValueVisible: false,
    // scaleMargins: {
    //   top: 0.8,
    //   bottom: 0,
    // },
    lineWidth:1
  });

  //macd chart
  macdChartInstance = $lightweightCharts.createChart('macd', {
    autoSize: true,
    timeScale: {
      timeVisible: true,
    },
    rightPriceScale: {
      scaleMargins: {
        top: 0.3,
        bottom: 0.25,
      },
    },
    layout: {
      backgroundColor: '#18181c',
      lineColor: '#2B2B43',
      textColor: '#D9D9D9',
    },
    watermark: {
      color: 'rgba(0, 0, 0, 0)',
    },
    crossHair: {
      color: '#758696',
    },
    grid: {
      vertLines: {
        color: '#2B2B43',
      },
      horzLines: {
        color: '#363C4E',
      },
    },
  });

  //add MACD Series
  macdChartInstance.MACDSeries = macdChartInstance.addLineSeries({
    color: '#2962FF',
    // priceScaleId: 'macd',
    // priceLineVisible: false,
    // lastValueVisible: false,
    lineWidth:1
  });

  macdChartInstance.MACDSignalSeries = macdChartInstance.addLineSeries({
    color: '#FF6D00',
    // priceScaleId: 'macd',
    // priceLineVisible: false,
    // lastValueVisible: false,
    lineWidth:1
  });

  macdChartInstance.MACDHistogramSeries = macdChartInstance.addHistogramSeries({
    // priceScaleId: 'macd',
    // priceLineVisible: false,
    // lastValueVisible: false,
    // scaleMargins: {
    //   top: 0.8,
    //   bottom: 0,
    // },
  });



  // equity chart
  equityChartInstance = $lightweightCharts.createChart('equity', {
    autoSize: true,
    timeScale: {
      timeVisible: true,
    },
    rightPriceScale: {
      scaleMargins: {
        top: 0.3,
        bottom: 0.25,
      },
    },
    layout: {
      backgroundColor: '#18181c',
      lineColor: '#2B2B43',
      textColor: '#D9D9D9',
    },
    watermark: {
      color: 'rgba(0, 0, 0, 0)',
    },
    crossHair: {
      color: '#758696',
    },
    grid: {
      vertLines: {
        color: '#2B2B43',
      },
      horzLines: {
        color: '#363C4E',
      },
    },
  });

  equityChartInstance.equityLineSeries = equityChartInstance.addLineSeries({
    color:'#74ff00',
    // priceScaleId: 'equity',
    // priceLineVisible: false,
    // lastValueVisible: false,
    // scaleMargins: {
    //   top: 0.8,
    //   bottom: 0,
    // },
    lineWidth:1
  });

  chartInstance.timeScale().subscribeVisibleLogicalRangeChange(range => {
    rsiChartInstance.timeScale().setVisibleLogicalRange(range);
    macdChartInstance.timeScale().setVisibleLogicalRange(range);
    equityChartInstance.timeScale().setVisibleLogicalRange(range);
  });

  rsiChartInstance.timeScale().subscribeVisibleLogicalRangeChange(range => {
    chartInstance.timeScale().setVisibleLogicalRange(range);
    macdChartInstance.timeScale().setVisibleLogicalRange(range);
    equityChartInstance.timeScale().setVisibleLogicalRange(range);
  });

  macdChartInstance.timeScale().subscribeVisibleLogicalRangeChange(range => {
    chartInstance.timeScale().setVisibleLogicalRange(range);
    rsiChartInstance.timeScale().setVisibleLogicalRange(range);
    equityChartInstance.timeScale().setVisibleLogicalRange(range);
  });

  equityChartInstance.timeScale().subscribeVisibleLogicalRangeChange(range => {
    chartInstance.timeScale().setVisibleLogicalRange(range);
    rsiChartInstance.timeScale().setVisibleLogicalRange(range);
    macdChartInstance.timeScale().setVisibleLogicalRange(range);
  });

})

async function updateAvailableIndicators(indicator) {
  // selectedTimeframe.value = [timeframe];

  // console.log(indicator);

  /*VOLUME*/
  if (indicator === 'volume'){
    chartInstance.volumeSeries.applyOptions({
      visible: selectedIndicators.value.includes(indicator)
    });
  }

  /*MA12*/
  if (indicator === 'MA12') {
    chartInstance.MA12Series.applyOptions({
      visible: selectedIndicators.value.includes(indicator)
    });
  }

  /*MA21*/
  if (indicator === 'MA21') {
    chartInstance.MA21Series.applyOptions({
      visible: selectedIndicators.value.includes(indicator)
    });
  }

  /*MA50*/
  if (indicator === 'MA50') {
    chartInstance.MA50Series.applyOptions({
      visible: selectedIndicators.value.includes(indicator)
    });
  }

  /*MA100*/
  if (indicator === 'MA100') {
    chartInstance.MA100Series.applyOptions({
      visible: selectedIndicators.value.includes(indicator)
    });
  }

  /*MA200*/
  if (indicator === 'MA200') {
    chartInstance.MA200Series.applyOptions({
      visible: selectedIndicators.value.includes(indicator)
    });
  }

  if (indicator === 'RSI') {
    rsiChartInstance.RSISeries.applyOptions({
      visible: selectedIndicators.value.includes(indicator)
    });
  }


  /*MACD*/
  if (indicator === 'MACD') {
    macdChartInstance.MACDSeries.applyOptions({
      visible: selectedIndicators.value.includes(indicator)
    });
    macdChartInstance.MACDSignalSeries.applyOptions({
      visible: selectedIndicators.value.includes(indicator)
    });
    macdChartInstance.MACDHistogramSeries.applyOptions({
      visible: selectedIndicators.value.includes(indicator)
    });
  }


  /*BB*/
  if (indicator === 'BB') {
    chartInstance.BBLowerSeries.applyOptions({
      visible: selectedIndicators.value.includes(indicator)
    });
    chartInstance.BBMiddleSeries.applyOptions({
      visible: selectedIndicators.value.includes(indicator)
    });
    chartInstance.BBUpperSeries.applyOptions({
      visible: selectedIndicators.value.includes(indicator)
    });
  }

  /*Equity*/
  if (indicator === 'equity') {
    equityChartInstance.equityLineSeries.applyOptions({
      visible: selectedIndicators.value.includes(indicator)
    });
  }
}

function formatCandlesAndCalcIndicators(data, live = false) {
  let prices = [];
  let returnData = {
    candles:[],
    volume:[],
    MA12:[],
    MA21:[],
    MA50:[],
    MA100:[],
    MA200:[],
    RSI:[],
    MACD:[],
    MACDSignal:[],
    MACDHistogram:[],
    BBLower:[],
    BBMiddle:[],
    BBUpper:[],
    close:[]
  }

  for (let i = 0; i < data.length; i++) {
    returnData.candles.push({
      time:data[i].time,
      open:data[i].open,
      high:data[i].high,
      low:data[i].low,
      close:data[i].close,
    });

    returnData.volume.push({
      time:data[i].time,
      value:data[i].volume,
      color: (data[i].open < data[i].close) ? 'rgb(38,166,154)' : 'rgb(239,83,80)'
    });

    returnData.close.push(data[i].close);
  }

  // console.log(prices);

  let i = 0;
  returnData.close.forEach(price => {

    // console.log('prices??: ', price);

    let SMA12Res = 0;
    let SMA21Res = 0;
    let SMA50Res = 0;
    let SMA100Res = 0;
    let SMA200Res = 0;
    let RSIRes = 0
    let MACDRes = 0;
    let BBRes = 0;

    if (live) {

      SMA12Res  = SMA12Indicator.momentValue(price);
      SMA21Res  = SMA21Indicator.momentValue(price);
      SMA50Res  = SMA50Indicator.momentValue(price);
      SMA100Res = SMA100Indicator.momentValue(price);
      SMA200Res = SMA200Indicator.momentValue(price);
      RSIRes    = RSIIndicator.momentValue(price);
      MACDRes   = MACDIndicator.momentValue(price);
      BBRes     = BBIndicator.momentValue(price);

    } else {

      SMA12Res  = SMA12Indicator.nextValue(price);
      SMA21Res  = SMA21Indicator.nextValue(price);
      SMA50Res  = SMA50Indicator.nextValue(price);
      SMA100Res = SMA100Indicator.nextValue(price);
      SMA200Res = SMA200Indicator.nextValue(price);
      RSIRes    = RSIIndicator.nextValue(price);
      MACDRes   = MACDIndicator.nextValue(price);
      BBRes     = BBIndicator.nextValue(price);
    }

    if(SMA12Res) {
      returnData.MA12.push({
        time:data[i].time,
        value:SMA12Res,
      });
    }

    if(SMA21Res) {
      returnData.MA21.push({
        time:data[i].time,
        value:SMA21Res,
      });
    }

    if(SMA50Res) {
      returnData.MA50.push({
        time:data[i].time,
        value:SMA50Res,
      });
    }

    if(SMA100Res) {
      returnData.MA100.push({
        time:data[i].time,
        value:SMA100Res,
      });
    }

    if(SMA200Res) {
      returnData.MA200.push({
        time:data[i].time,
        value:SMA200Res,
      });
    }

    if(RSIRes) {
      returnData.RSI.push({
        time:data[i].time,
        value:RSIRes,
      });
    }

    if(MACDRes) {
      returnData.MACD.push({
        time:data[i].time,
        value:MACDRes.macd,
      });

      returnData.MACDSignal.push({
        time:data[i].time,
        value:MACDRes.signal,
      });

      returnData.MACDHistogram.push({
        time:data[i].time,
        value:MACDRes.histogram,
        color:(MACDRes.histogram > 0) ? 'rgb(38,166,154)' : 'rgb(239,83,80)'
      });
    }

    if(BBRes) {
      returnData.BBLower.push({
        time:data[i].time,
        value:BBRes.lower,
      });

      returnData.BBMiddle.push({
        time:data[i].time,
        value:BBRes.middle,
      });

      returnData.BBUpper.push({
        time:data[i].time,
        value:BBRes.upper,
      });
    }

    i++;
  });


  return returnData;
}

async function submitBacktest() {

  timeframeData = await $fetch('/api/v1/fetchTimeframeDuration', {
    query: {
      userID: userID.value,
      exchange: currentExchange.value,
      timeframe: selectedTimeframe.value,
    }
  });

  let candlesData = await $fetch('/api/v1/fetchOHLCV', {
    query: {
      userID: userID.value,
      exchange: currentExchange.value,
      symbol: currentSymbol.value,
      timeframe: selectedTimeframe.value,
      dateFrom: dateRange.value[0],
      limit: 1000,
    }
  });

  //format data
  let data = formatCandlesAndCalcIndicators(candlesData, false);
  data['symbol'] = currentSymbol;

  //init backTest
  const backTest = new CryptoBacktest(data);

  // Execute a specific strategy
  const strategy = (data) => {

    let signals = [];

    let maOffset = data.MA12.length - data.MA21.length;
    let MA12 = [];
    for (let i = maOffset; i < data.MA12.length; i++) {
      MA12.push(data.MA12[i].value);
    }

    let MA21 = [];
    for (let i = 0; i < data.MA21.length; i++) {
      MA21.push(data.MA21[i].value);
    }

    let crossLines = {
      lineA: MA12,
      lineB: MA21,
    };

    let crossUp = new CrossUp(crossLines);
    let crossDown = new CrossDown(crossLines);
    let crossUpValues = crossUp.getResult();
    let crossDownValues = crossDown.getResult();

    let offset = data.candles.length - crossUpValues.length;

    for (let i = 0; i < crossUpValues.length; i++) {
      if (crossUpValues[i] === true) {
        signals.push({
          symbol:data.symbol,
          time: data.candles[i + offset].time,
          side: 'BUY',
          price: data.candles[i + offset].close,
          type:'CU'
        })
      }

      if (crossDownValues[i] === true) {
        signals.push({
          symbol:data.symbol,
          time: data.candles[i + offset].time,
          side: 'SELL',
          price: data.candles[i + offset].close,
          type:'CD'
        })
      }
    }

    let RSIOffset = data.candles.length - data.RSI.length;
    let overboughtCondition = false;
    let oversoldCondition = false;

    for (let i = 0; i < data.RSI.length; i++) {

      if (data.RSI[i].value > 80 && !overboughtCondition) {

        signals.push({
          symbol:data.symbol,
          time: data.candles[i + RSIOffset].time,
          side: 'SELL',
          price: data.candles[i + RSIOffset].close,
          type:'OB'
        })

      } else {
        // overboughtCondition = false;
      }

      if (data.RSI[i].value < 20 && !oversoldCondition) {

        if (data.RSI[i].value > 80 && !overboughtCondition) {

          signals.push({
            symbol:data.symbol,
            time: data.candles[i + RSIOffset].time,
            side: 'BUY',
            price: data.candles[i + RSIOffset].close,
            type:'OS'
          })

        } else {
          // oversoldCondition = false;
        }

      }

    }

    // console.log(signals[0].time)

    return signals;
  }

  //run the actual strategy
  const result = backTest.executeStrategy(strategy);


  console.log(result);

  //set data to table
  closedOrdersTableData.value = result.orders;

  finalBalance.value = result.balance;
  message.info(
      `Final balance: ${result.balance}`,
      {
        keepAliveOnHover: true
      }
  )

  //set data to chart
  chartInstance.candlesSeries.setData(data.candles);
  chartInstance.volumeSeries.setData(data.volume);
  chartInstance.MA12Series.setData(data.MA12);
  chartInstance.MA21Series.setData(data.MA21);
  chartInstance.MA50Series.setData(data.MA50);
  chartInstance.MA100Series.setData(data.MA100);
  chartInstance.MA200Series.setData(data.MA200);
  chartInstance.BBLowerSeries.setData(data.BBLower);
  chartInstance.BBMiddleSeries.setData(data.BBMiddle);
  chartInstance.BBUpperSeries.setData(data.BBUpper);
  chartInstance.candlesSeries.setMarkers(result.markers);//markers

  rsiChartInstance.RSISeries.setData(data.RSI);
  rsiChartInstance.RSISeries.setMarkers(result.markers);//markers

  macdChartInstance.MACDSeries.setData(data.MACD);
  macdChartInstance.MACDSignalSeries.setData(data.MACDSignal);
  macdChartInstance.MACDHistogramSeries.setData(data.MACDHistogram);
  macdChartInstance.MACDSeries.setMarkers(result.markers);//markers

  equityChartInstance.equityLineSeries.setData(result.equity);
  equityChartInstance.equityLineSeries.setMarkers(result.markers);//markers




  //set last bar tracker
  if (data.candles.length) {
    lastBarTime = data.candles[data.candles.length - 1].time;
  }

  //fit chart to page
  chartInstance.timeScale().fitContent();
}

class CryptoBacktest {
  constructor(data, initialBalance = 1000) {
    this.data = data;
    this.initialBalance = initialBalance;
    this.balance = initialBalance;
    this.position = 0; // 0 for no position, 1 for long, -1 for short
    this.orders = [];
    this.positionSize = this.balance;
    this.equity = [];
    this.markers = [];
  }

  // Add a method to execute a specific trading strategy
  executeStrategy(strategyFunction) {

    const signals = strategyFunction(this.data);

    signals.forEach(signal => {
      if (this.position === 0) {
        if (signal.side === 'BUY') {
          this.enterPosition(signal);
        }
      }

      if (this.position === 1) {
        if (signal.side === 'SELL') {
          this.exitPosition(signal);
        }
      }

      //TODO shorting
    });

    //calc balance
    this.balance = this.initialBalance;
    let entryCost = 0;
    let exitCost = 0;
    let profit = 0;
    let orders = [];

    for (let i = 0; i < this.data.candles.length; i++) {

      for (let j = 0; j < this.orders.length; j++) {

        if (this.data.candles[i].time === this.orders[j].time) {
          let order = this.orders[j];

          if (order.side === 'BUY') {
            entryCost = order.quantity * order.price;

            orders.push({
              // time:order.time,
              side: order.side,
              price:order.price.toFixed(2),
              quantity:order.quantity.toFixed(2),
              cost:entryCost.toFixed(2),
              profit:0,
              balance: this.balance.toFixed(2),
            });
          }

          if (order.side === 'SELL') {
            exitCost = order.quantity * order.price;
            profit = exitCost - entryCost;
            this.balance = this.balance + profit;

            orders.push({
              // time:order.time,
              side: order.side,
              price:order.price.toFixed(2),
              quantity:order.quantity.toFixed(2),
              cost:exitCost.toFixed(2),
              profit:profit.toFixed(2),
              balance: this.balance.toFixed(2),
            });
          }
        }
      }

      this.equity.push({
        time: this.data.candles[i].time,
        value:this.balance,
      })
    }


    return {
      balance: this.balance,
      orders: orders,
      markers: this.markers,
      equity: this.equity
    };
  }

  enterPosition(signal) {
    if (signal.side === 'BUY') {
      this.position = 1;
      const quantity = this.positionSize / signal.price;
      this.orders.push({ time: signal.time, side: 'BUY', price: signal.price, quantity: quantity });
      this.markers.push({ time: signal.time, position: 'belowBar', color: '#2196F3', shape: 'arrowUp', text: `BUY ${signal.type}` });
    }

    if (signal.side === 'SELL') {
      this.position = -1;
      const quantity = this.positionSize / signal.price;
      this.orders.push({ time: signal.time, side: 'SELL', price: signal.price, quantity: quantity });
      this.markers.push({ time: signal.time, position: 'aboveBar', color: '#e91e63', shape: 'arrowDown', text: `SELL ${signal.type}` });
    }
  }

  exitPosition(signal) {
    this.position = 0;

    let lastOrder = this.orders[this.orders.length -1];
    let quantity = lastOrder.quantity;

    this.orders.push({ time: signal.time, side: signal.side, price: signal.price, quantity: quantity });
    this.markers.push({ time: signal.time, position: 'aboveBar', color: '#e91e63', shape: 'arrowDown', text: `SELL ${signal.type}` });
  }
}

</script>
