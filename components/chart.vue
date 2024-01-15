<script setup>
import { CrossUp, CrossDown } from "technicalindicators";
import { SMA, RSI, MACD, BollingerBands } from '@debut/indicators';
import { useAppStore } from '~/stores/app.store';
const app = useAppStore()

let userID = useCookie('userID');

// import {createChart, LineStyle} from "lightweight-charts";
import {clearIntervalAsync, setIntervalAsync} from "set-interval-async";

let currentExchange = ref(app.getUserSelectedExchange);
let currentSymbol = ref(app.getUserSelectedMarket);

let chartInstance = '';
let chartCandlesSeries = '';
let chartVolumeSeries = '';
let chartMA12Series = '';
let chartMA21Series = '';
let chartMA50Series = '';
let chartMA100Series = '';
let chartMA200Series = '';
let chartRSISeries = '';
let chartMACDSeries = '';
let chartMACDSignalSeries = '';
let chartMACDHistogramSeries = '';
let chartBBLowerSeries = '';
let chartBBMiddleSeries = '';
let chartBBUpperSeries = '';

let SMA12Indicator = new SMA(12);
let SMA21Indicator = new SMA(21);
let SMA50Indicator = new SMA(50);
let SMA100Indicator = new SMA(100);
let SMA200Indicator = new SMA(200);
let RSIIndicator = new RSI(14);
let MACDIndicator = new MACD(12, 26, 9);
let BBIndicator = new BollingerBands(20, 2);



let chartIndicators = ['volume', 'MA12', 'MA21', 'MA50', 'MA100', 'MA200', 'RSI', 'MACD', 'BB'];
let selectedIndicators = ref(['volume', 'MA12', 'MA21', 'MA50', 'MA100', 'MA200', 'RSI', 'MACD', 'BB']);

let chartTimeframes = app.getAvailableTimeframes;

let selectedTimeframe = ref(['1m']);

let ohlcvInterval = null;

let timeframeData = null;
let lastBarTime = null;

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
  chartCandlesSeries = chartInstance.addCandlestickSeries({
    autoScale:true,
    priceFormat: {
      type: 'price',
      precision: 4,
      minMove: 0.0001,
    },
  });

  //add volume series
  chartVolumeSeries = chartInstance.addHistogramSeries({
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
  chartMA12Series = chartInstance.addLineSeries({
      color:'#a821f3',
      lineWidth:1,
      priceLineVisible: false,
      lastValueVisible: false,
      rightPriceScale: {
          visible: false,
      },
  });

  //add MA21 series
  chartMA21Series = chartInstance.addLineSeries({
      color:'#6921f3',
      lineWidth:1,
      priceLineVisible: false,
      lastValueVisible: false,
      rightPriceScale: {
          visible: false,
      },
  });

  //add MA50 series
  chartMA50Series = chartInstance.addLineSeries({
      color:'#ffeb3b',
      lineWidth:1,
      priceLineVisible: false,
      lastValueVisible: false,
      rightPriceScale: {
          visible: false,
      },
  });

  //add MA100 series
  chartMA100Series = chartInstance.addLineSeries({
    color:'#ff9800',
    lineWidth:1,
    priceLineVisible: false,
    lastValueVisible: false,
    rightPriceScale: {
      visible: false,
    },
  });

  //add MA200 series
  chartMA200Series = chartInstance.addLineSeries({
    color:'#f23645',
    lineWidth:1,
    priceLineVisible: false,
    lastValueVisible: false,
    rightPriceScale: {
      visible: false,
    },
  });

  //add RSI series
  chartRSISeries = chartInstance.addLineSeries({
      priceScaleId: 'rsi',
      // priceLineVisible: false,
      // lastValueVisible: false,
      scaleMargins: {
          top: 0.8,
          bottom: 0,
      },
      lineWidth:1
  });

  //add MACD Series
  chartMACDSeries = chartInstance.addLineSeries({
      color: '#2962FF',
      priceScaleId: 'macd',
      priceLineVisible: false,
      // lastValueVisible: false,
      lineWidth:1
  });

  chartMACDSignalSeries = chartInstance.addLineSeries({
      color: '#FF6D00',
      priceScaleId: 'macd',
      priceLineVisible: false,
      // lastValueVisible: false,
      lineWidth:1
  });

  chartMACDHistogramSeries = chartInstance.addHistogramSeries({
      priceScaleId: 'macd',
      priceLineVisible: false,
      lastValueVisible: false,
      scaleMargins: {
          top: 0.8,
          bottom: 0,
      },
  });

  //add BB series
  chartBBLowerSeries = chartInstance.addLineSeries({
    // priceScaleId: 'bb',
    color:'#459800',
    lineWidth:1,
    priceLineVisible: false,
    lastValueVisible: false,
    rightPriceScale: {
      visible: false,
    },
  });

  chartBBMiddleSeries = chartInstance.addLineSeries({
    // priceScaleId: 'bb',
    color:'#459800',
    lineWidth:1,
    priceLineVisible: false,
    lastValueVisible: false,
    rightPriceScale: {
      visible: false,
    },
  });

  chartBBUpperSeries = chartInstance.addLineSeries({
    // priceScaleId: 'bb',
    color:'#459800',
    lineWidth:1,
    priceLineVisible: false,
    lastValueVisible: false,
    rightPriceScale: {
      visible: false,
    },
  });

  //load OHLCV historical data
  let data = await fetchOHLCVRecentData(selectedTimeframe.value[0]);

  // console.log(data);

  //set data to chart
  chartCandlesSeries.setData(data.candles);
  chartVolumeSeries.setData(data.volume);
  chartMA12Series.setData(data.MA12);
  chartMA21Series.setData(data.MA21);
  chartMA50Series.setData(data.MA50);
  chartMA100Series.setData(data.MA100);
  chartMA200Series.setData(data.MA200);
  chartRSISeries.setData(data.RSI);
  chartMACDSeries.setData(data.MACD);
  chartMACDSignalSeries.setData(data.MACDSignal);
  chartMACDHistogramSeries.setData(data.MACDHistogram);
  chartBBLowerSeries.setData(data.BBLower);
  chartBBMiddleSeries.setData(data.BBMiddle);
  chartBBUpperSeries.setData(data.BBUpper);

  let markers = checkForCrossOvers(data);
  chartCandlesSeries.setMarkers(markers);


  //set last bar tracker
  if (data.candles.length) {
    lastBarTime = data.candles[data.candles.length - 1].time;
  }

  const chartDiv = document.getElementById('chart');

  //fit chart to page
  chartInstance.applyOptions({
    width: chartDiv.offsetWidth,
    height: chartDiv.offsetHeight
  });

  window.onresize = function() {
    chartInstance.applyOptions({
      width: chartDiv.offsetWidth,
      height: chartDiv.offsetHeight
    });
  }

  //load OHLCV pooling
  ohlcvInterval = setIntervalAsync(fetchOHLCVLivePricePooling, 500);
})



onUnmounted(() => {
  clearIntervalAsync(ohlcvInterval);
});

async function fetchOHLCVRecentData(timeframe) {

  timeframeData = await $fetch('/api/v1/fetchTimeframeDuration', {
    query:{
      userID:userID.value,
      exchange:currentExchange.value,
      timeframe:timeframe,
    }
  });


  // const oneWeekFromNow = currentTimestamp - 7 * 24 * 60 * 60 * 1000;
  // const fiveMinutesFromNow = currentDate.getTime() - 60 * 1000;
  // console.log(currentTimestamp, fiveMinutesFromNow);

  const currentDate = new Date();
  const currentTimestamp = currentDate.getTime();
  const last100Bars = currentTimestamp - ((timeframeData * 1000) * 1000);

  let candlesData = await $fetch('/api/v1/fetchOHLCV', {
    query:{
      userID:userID.value,
      exchange:currentExchange.value,
      symbol:currentSymbol.value,
      timeframe:timeframe,
      dateFrom:last100Bars,
      limit:1000,
    }
  });

  return formatCandlesData(candlesData, false);
}
async function fetchOHLCVLivePricePooling() {

  // console.log(`pooling ${selectedTimeframe.value[0]}`)

  let candlesData = await $fetch('/api/v1/fetchOHLCVLivePrice', {
    query:{
      userID:userID.value,
      exchange:currentExchange.value,
      symbol:currentSymbol.value,
      timeframe:selectedTimeframe.value[0],
    }
  });

  if (candlesData.length) {

    let live = true;
    if (lastBarTime < candlesData[candlesData.length - 1].time) {
      lastBarTime = candlesData[candlesData.length - 1].time;
      live = false;
    } else {
      live = true;
    }

    let formattedData = formatCandlesData(candlesData, live);

    chartCandlesSeries.update(formattedData.candles[formattedData.candles.length - 1]);
    chartVolumeSeries.update(formattedData.volume[formattedData.volume.length - 1]);
    chartMA12Series.update(formattedData.MA12[formattedData.MA12.length - 1]);
    chartMA21Series.update(formattedData.MA21[formattedData.MA21.length - 1]);
    chartMA50Series.update(formattedData.MA50[formattedData.MA50.length - 1]);
    chartMA100Series.update(formattedData.MA100[formattedData.MA100.length - 1]);
    chartMA200Series.update(formattedData.MA200[formattedData.MA200.length - 1]);
    chartRSISeries.update(formattedData.RSI[formattedData.RSI.length - 1]);
    chartMACDSeries.update(formattedData.MACD[formattedData.MACD.length - 1]);
    chartMACDSignalSeries.update(formattedData.MACDSignal[formattedData.MACDSignal.length - 1]);
    chartMACDHistogramSeries.update(formattedData.MACDHistogram[formattedData.MACDHistogram.length - 1]);
    chartBBLowerSeries.update(formattedData.BBLower[formattedData.BBLower.length - 1]);
    chartBBMiddleSeries.update(formattedData.BBMiddle[formattedData.BBMiddle.length - 1]);
    chartBBUpperSeries.update(formattedData.BBUpper[formattedData.BBUpper.length - 1]);
  }
}

async function updateAvailableIndicators(indicator) {
  // selectedTimeframe.value = [timeframe];

  // console.log(indicator);

  /*VOLUME*/
  if (indicator === 'volume'){
    chartVolumeSeries.applyOptions({
      visible: selectedIndicators.value.includes(indicator)
    });
  }

  /*MA12*/
  if (indicator === 'MA12') {
    chartMA12Series.applyOptions({
      visible: selectedIndicators.value.includes(indicator)
    });
  }

  /*MA21*/
  if (indicator === 'MA21') {
    chartMA21Series.applyOptions({
      visible: selectedIndicators.value.includes(indicator)
    });
  }

  /*MA50*/
  if (indicator === 'MA50') {
    chartMA50Series.applyOptions({
      visible: selectedIndicators.value.includes(indicator)
    });
  }

  /*MA100*/
  if (indicator === 'MA100') {
    chartMA100Series.applyOptions({
      visible: selectedIndicators.value.includes(indicator)
    });
  }

  /*MA200*/
  if (indicator === 'MA200') {
    chartMA200Series.applyOptions({
      visible: selectedIndicators.value.includes(indicator)
    });
  }

  if (indicator === 'RSI') {
    chartRSISeries.applyOptions({
      visible: selectedIndicators.value.includes(indicator)
    });
  }


  /*MACD*/
  if (indicator === 'MACD') {
    chartMACDSeries.applyOptions({
      visible: selectedIndicators.value.includes(indicator)
    });
    chartMACDSignalSeries.applyOptions({
      visible: selectedIndicators.value.includes(indicator)
    });
    chartMACDHistogramSeries.applyOptions({
      visible: selectedIndicators.value.includes(indicator)
    });
  }


  /*BB*/
  if (indicator === 'BB') {
    chartBBLowerSeries.applyOptions({
      visible: selectedIndicators.value.includes(indicator)
    });
    chartBBMiddleSeries.applyOptions({
      visible: selectedIndicators.value.includes(indicator)
    });
    chartBBUpperSeries.applyOptions({
      visible: selectedIndicators.value.includes(indicator)
    });
  }
}

async function updateCurrentTimeframe(timeframe) {
  selectedTimeframe.value = [timeframe];

  // console.log(timeframe);

  //stop live pooling
  clearIntervalAsync(ohlcvInterval);

  //reset indicators?
  // SMA12Indicator = new SMA(12);
  // SMA21Indicator = new SMA(21);
  // SMA50Indicator = new SMA(50);
  // SMA100Indicator = new SMA(100);
  // SMA200Indicator = new SMA(200);
  // RSIIndicator = new RSI(14);
  // MACDIndicator = new MACD(12, 26, 9);
  // BBIndicator = new BollingerBands(20, 2);

  //load OHLCV historical data
  let data = await fetchOHLCVRecentData(timeframe);

  //set data to chart
  chartCandlesSeries.setData(data.candles);
  chartVolumeSeries.setData(data.volume);
  chartMA12Series.setData(data.MA12);
  chartMA21Series.setData(data.MA21);
  chartMA50Series.setData(data.MA50);
  chartMA100Series.setData(data.MA100);
  chartMA200Series.setData(data.MA200);
  chartRSISeries.setData(data.RSI);
  chartMACDSeries.setData(data.MACD);
  chartMACDSignalSeries.setData(data.MACDSignal);
  chartMACDHistogramSeries.setData(data.MACDHistogram);
  chartBBLowerSeries.setData(data.BBLower);
  chartBBMiddleSeries.setData(data.BBMiddle);
  chartBBUpperSeries.setData(data.BBUpper);

  //start live pooling
  ohlcvInterval = setIntervalAsync(fetchOHLCVLivePricePooling, 500);
}


function formatCandlesData(data, live = false) {
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

    prices.push(data[i].close);
  }

  // console.log(prices);

  let i = 0;
  prices.forEach(price => {

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

function checkForCrossOvers(data) {

  // console.log(data);

  let maOffset = data.MA12.length - data.MA21.length;
  let markers = [];
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

  // console.log(maOffset, crossLines);

  for (let i = 0; i < crossUpValues.length; i++) {
    if (crossUpValues[i] === true) {
      markers.push({ time: data.candles[i+offset].time, position: 'belowBar', color: '#2196F3', shape: 'arrowUp', text: 'BUY' });
    }

    if (crossDownValues[i] === true) {
      markers.push({ time: data.candles[i+offset].time, position: 'aboveBar', color: '#e91e63', shape: 'arrowDown', text: 'SELL' });
    }
  }

  let RSIOffset = data.candles.length - data.RSI.length;
  let overboughtCondition = false;
  let oversoldCondition = false;

  for (let i = 0; i < data.RSI.length; i++) {
    if (data.RSI[i].value > 80 && !overboughtCondition) {
      markers.push({ time: data.candles[i + RSIOffset].time, position: 'aboveBar', color: '#e91e63', shape: 'circle', text: 'OB' });
      overboughtCondition = true;
    } else {
      overboughtCondition = false;
    }
    if (data.RSI[i].value < 20 && !oversoldCondition) {
      markers.push({ time: data.candles[i + RSIOffset].time, position: 'belowBar', color: '#2196F3', shape: 'circle', text: 'OS' });
      oversoldCondition = true;
    } else {
      oversoldCondition = false;
    }
  }

  return markers;
}
</script>

<template>
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


    <div id="chart" style="height:400px"></div>
  </n-card>
</template>

<style scoped>

</style>
