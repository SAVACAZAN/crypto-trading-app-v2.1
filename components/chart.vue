<script setup>
import {SMA, RSI, MACD} from 'technicalindicators';
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

let chartIndicators = ['volume', 'MA12', 'MA21', 'MA50', 'MA100', 'MA200', 'RSI', 'MACD'];
let selectedIndicators = ref(['volume', 'MA12', 'MA21', 'MA50', 'MA100', 'MA200', 'RSI', 'MACD']);

let chartTimeframes = app.getAvailableTimeframes;

let selectedTimeframe = ref(['1m']);

let ohlcvInterval = null;

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
  });

  //add candles series
  chartCandlesSeries = chartInstance.addCandlestickSeries({
    autoScale:false,
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

  chartMA12Series = chartInstance.addLineSeries({
      color:'#FF9800',
      lineWidth:1,
      priceLineVisible: false,
      lastValueVisible: false,
      rightPriceScale: {
          visible: false,
      },
  });

  chartMA21Series = chartInstance.addLineSeries({
      color:'#AB47BC',
      lineWidth:1,
      priceLineVisible: false,
      lastValueVisible: false,
      rightPriceScale: {
          visible: false,
      },
  });

  chartMA50Series = chartInstance.addLineSeries({
      color:'#5B9CF6',
      lineWidth:1,
      priceLineVisible: false,
      lastValueVisible: false,
      rightPriceScale: {
          visible: false,
      },
  });

  chartMA100Series = chartInstance.addLineSeries({
    color:'#5B9CF6',
    lineWidth:1,
    priceLineVisible: false,
    lastValueVisible: false,
    rightPriceScale: {
      visible: false,
    },
  });

  chartMA200Series = chartInstance.addLineSeries({
    color:'#5B9CF6',
    lineWidth:1,
    priceLineVisible: false,
    lastValueVisible: false,
    rightPriceScale: {
      visible: false,
    },
  });

  chartRSISeries = chartInstance.addLineSeries({
      priceScaleId: 'rsi',
      // priceLineVisible: false,
      // lastValueVisible: false,
      scaleMargins: {
          top: 0.8,
          bottom: 0,
      },
  });

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

  //load OHLCV historical data
  let data = await fetchOHLCVRecentData(selectedTimeframe.value[0]);

  console.log(data);

  //set data to chart
  chartCandlesSeries.setData(data.candles);
  chartVolumeSeries.setData(data.volume);
  chartMA12Series.setData(data.ma12);
  chartMA21Series.setData(data.ma21);
  chartMA50Series.setData(data.ma50);
  chartMA100Series.setData(data.ma100);
  chartMA200Series.setData(data.ma200);
  chartRSISeries.setData(data.RSI);
  chartMACDSeries.setData(data.MACD);
  chartMACDSignalSeries.setData(data.MACDSignal);
  chartMACDHistogramSeries.setData(data.MACDHistogram);

  //fit chart to page
  chartInstance.timeScale().fitContent();

  //load OHLCV pooling
  ohlcvInterval = setIntervalAsync(fetchOHLCVLivePricePooling, 500);

})

onUnmounted(() => {
  clearIntervalAsync(ohlcvInterval);
});

async function fetchOHLCVRecentData(timeframe) {

  let timeframeData = await $fetch('/api/v1/fetchTimeframeDuration', {
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

  return formatCandlesData(candlesData);
}
async function fetchOHLCVLivePricePooling() {
  let candlesData = await $fetch('/api/v1/fetchOHLCVLivePrice', {
    query:{
      userID:userID.value,
      exchange:currentExchange.value,
      symbol:currentSymbol.value,
      timeframe:selectedTimeframe.value[0],
    }
  });

  if (candlesData.length) {
    let formattedData = formatCandlesData(candlesData);
    chartCandlesSeries.update(formattedData.candles[formattedData.candles.length - 1]);
    chartVolumeSeries.update(formattedData.volume[formattedData.volume.length - 1]);
  }
}

async function updateAvailableIndicators(indicator) {
  // selectedTimeframe.value = [timeframe];

  console.log(indicator);

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
}

async function updateCurrentTimeframe(timeframe) {
  selectedTimeframe.value = [timeframe];

  console.log(timeframe);

  //stop live pooling
  await clearIntervalAsync(ohlcvInterval);

  //load OHLCV historical data
  let data = await fetchOHLCVRecentData(timeframe);

  //set data to chart
  chartCandlesSeries.setData(data.candles);
  chartVolumeSeries.setData(data.volume);

  //start live pooling
  ohlcvInterval = setIntervalAsync(fetchOHLCVLivePricePooling, 500);
}


function formatCandlesData(data) {
  let close = [];
  let returnData = {
    candles:[],
    volume:[],
    ma12:[],
    ma21:[],
    ma50:[],
    ma100:[],
    ma200:[],
    RSI:[],
    MACD:[],
    MACDSignal:[],
    MACDHistogram:[],
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

    close.push(data[i].close);
  }


  //sma data
  let ma12 = new SMA({period : 12, values : close});
  let results12 = ma12.getResult();
  let offset12 = close.length - results12.length;
  console.log(offset12);
  for (let i = 0; i < results12.length; i++) {
    returnData.ma12.push({
      time:data[i+offset12].time,
      value:results12[i],
    });
  }

  let ma21 = new SMA({period : 21, values : close});
  let results21 = ma21.getResult();
  let offset21 = close.length - results21.length;
  console.log(offset21);
  for (let i = 0; i < results21.length; i++) {
    returnData.ma21.push({
      time:data[i+offset21].time,
      value:results21[i],
    });
  }

  let ma50 = new SMA({period : 50, values : close});
  let results50 = ma50.getResult();
  let offset50 = close.length - results50.length;
  console.log(offset50);
  for (let i = 0; i < results50.length; i++) {
    returnData.ma50.push({
      time:data[i+offset50].time,
      value:results50[i],
    });
  }

  let ma100 = new SMA({period : 100, values : close});
  let results100 = ma100.getResult();
  let offset100 = close.length - results100.length;
  console.log(offset100);
  for (let i = 0; i < results100.length; i++) {
    returnData.ma100.push({
      time:data[i+offset100].time,
      value:results100[i],
    });
  }

  let ma200 = new SMA({period : 200, values : close});
  let results200 = ma200.getResult();
  let offset200 = close.length - results200.length;
  console.log(offset200);
  for (let i = 0; i < results200.length; i++) {
    returnData.ma200.push({
      time:data[i+offset200].time,
      value:results200[i],
    });
  }

  let rsi = new RSI({period : 14, values : close});
  let resultsRsi = rsi.getResult();
  let offsetRsi = close.length - resultsRsi.length;
  console.log(offsetRsi);
  for (let i = 0; i < resultsRsi.length; i++) {
    returnData.RSI.push({
      time:data[i+offsetRsi].time,
      value:resultsRsi[i],
    });
  }

  let resultsMACD = MACD.calculate({
    values:close,
    fastPeriod        : 12,
    slowPeriod        : 26,
    signalPeriod      : 9,
    SimpleMAOscillator: false,
    SimpleMASignal    : false
  });
  let offsetMACD = close.length - resultsMACD.length;
  console.log(offsetMACD);
  for (let i = 0; i < resultsMACD.length; i++) {
    returnData.MACD.push({
      time:data[i+offsetMACD].time,
      value:resultsMACD[i].MACD,
    });
    returnData.MACDSignal.push({
      time:data[i+offsetMACD].time,
      value:resultsMACD[i].signal
    });
    returnData.MACDHistogram.push({
      time:data[i+offsetMACD].time,
      value:resultsMACD[i].histogram,
      color: (resultsMACD[i].histogram > 0) ? 'rgb(38,166,154)' : 'rgb(239,83,80)'
    });
  }

  return returnData;
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
