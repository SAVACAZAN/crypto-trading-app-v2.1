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


    <div id="chart" style="height:400px"></div>
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

    Statistics:
    <p v-for="(key, val) in statistics">
      {{ val }}: {{ key }}
    </p>
  </n-card>

</template>

<script setup>
definePageMeta({
    middleware: 'auth'
})
import { dcaBotStrategy } from '~/strategies/customStrategy';
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
  volumeSeries: '',
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
let selectedIndicators = ref(['volume', 'MA12', 'MA21', 'MA50', 'MA100', 'MA200', 'MA50', 'RSI', 'MACD', 'equity']);

let chartTimeframes = app.getAvailableTimeframes;

let selectedTimeframe = ref(['1m']);

let timeframeData = null;

let lastBarTime = null;


const currentTimestamp = Date.now();

let days = 5;
const previousTimestamp = currentTimestamp - days * 24 * 60 * 60 * 1000;

let dateRange = ref([previousTimestamp, currentTimestamp]);

const closedOrdersTablePagination = false;
const closedOrdersTableColumns = [
  {
    title: "Time",
    key: "time"
  },
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
    title: "Amount",
    key: "amount"
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
    title: "Fees",
    key: "fees"
  },
  {
    title: "Balance",
    key: "balance"
  },
  {
    title: "Type",
    key: "type"
  },
];

const closedOrdersTableData = ref([]);

const statistics = ref('');

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
    crosshairMode: 0,
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

    // if(SMA12Res) {
      returnData.MA12.push({
        time:data[i].time,
        value:(SMA12Res) ? SMA12Res : 0,
      });
    // }

    // if(SMA21Res) {
      returnData.MA21.push({
        time:data[i].time,
        value:(SMA21Res) ? SMA21Res : 0,
      });
    // }

    // if(SMA50Res) {
      returnData.MA50.push({
        time:data[i].time,
        value:(SMA50Res) ? SMA50Res : 0,
      });
    // }

    // if(SMA100Res) {
      returnData.MA100.push({
        time:data[i].time,
        value:(SMA100Res) ? SMA100Res : 0,
      });
    // }

    // if(SMA200Res) {
      returnData.MA200.push({
        time:data[i].time,
        value:(SMA200Res) ? SMA200Res : 0,
      });
    // }

    // if(RSIRes) {
      returnData.RSI.push({
        time:data[i].time,
        value:(RSIRes) ? RSIRes : 0,
      });
    // }

    // if(MACDRes) {
      returnData.MACD.push({
        time:data[i].time,
        value:(MACDRes) ? MACDRes.macd : 0,
      });

      returnData.MACDSignal.push({
        time:data[i].time,
        value:(MACDRes) ? MACDRes.signal : 0,
      });

      returnData.MACDHistogram.push({
        time:data[i].time,
        value:(MACDRes) ? MACDRes.histogram : 0,
        color:(MACDRes) ? (MACDRes.histogram > 0) ? 'rgb(38,166,154)' : 'rgb(239,83,80)' : ''
      });
    // }

    // if(BBRes) {
      returnData.BBLower.push({
        time:data[i].time,
        value:(BBRes) ? BBRes.lower : 0,
      });

      returnData.BBMiddle.push({
        time:data[i].time,
        value:(BBRes) ? BBRes.middle : 0,
      });

      returnData.BBUpper.push({
        time:data[i].time,
        value:(BBRes) ? BBRes.upper : 0,
      });
    // }

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
  data['symbol'] = currentSymbol.value;


  let backtester = new CryptoBacktest(data);
  let strategyResult = backtester.executeStrategy(dcaBotStrategy);


  //set data to table
  closedOrdersTableData.value = strategyResult.orders;

  //update statistics
  statistics.value = strategyResult.statistics;

  message.info(
      `Final balance: ${strategyResult.statistics.finalBalance}`,
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
  chartInstance.candlesSeries.setMarkers(strategyResult.markers);//markers

  rsiChartInstance.RSISeries.setData(data.RSI);
  rsiChartInstance.RSISeries.setMarkers(strategyResult.markers);//markers

  macdChartInstance.MACDSeries.setData(data.MACD);
  macdChartInstance.MACDSignalSeries.setData(data.MACDSignal);
  macdChartInstance.MACDHistogramSeries.setData(data.MACDHistogram);
  macdChartInstance.MACDSeries.setMarkers(strategyResult.markers);//markers

  equityChartInstance.equityLineSeries.setData(strategyResult.equity);
  equityChartInstance.equityLineSeries.setMarkers(strategyResult.markers);//markers




  //set last bar tracker
  if (data.candles.length) {
    lastBarTime = data.candles[data.candles.length - 1].time;
  }

  //fit chart to page
  chartInstance.timeScale().fitContent();
}

class CryptoBacktest {
  constructor(data) {
    this.data = data;
    this.orders = [];
    this.markers = [];
  }

  // Add a method to execute a specific trading strategy
  executeStrategy(strategyFunction) {

    const data = strategyFunction(this.data);

    data.signals.forEach(signal => {
      this.enterPosition(signal);
    });


    return {
      orders: this.orders,//for table
      markers: this.markers,//for chart
      equity: data.equity,
      statistics: data.statistics,//for myself ceplm
    };
  }

  enterPosition(signal) {

    this.orders.push(signal);

    if (signal.side === 'BUY') {
      this.markers.push({
        time: signal.time,
        position: 'belowBar',
        color: '#2196F3',
        shape: 'arrowUp',
        text: `${signal.type}`
      });
    }

    if (signal.side === 'SELL') {
      this.markers.push({
        time: signal.time,
        position: 'aboveBar',
        color: '#e91e63',
        shape: 'arrowDown',
        text: `${signal.type}`
      });
    }
  }
}

</script>
