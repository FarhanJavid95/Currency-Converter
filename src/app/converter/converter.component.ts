import { Component, ViewChild } from '@angular/core';
import { CurrencyService } from '../currency-service.service';
import { LocalHistoryService } from '../local-history-service.service';
import { AgGridAngular } from 'ag-grid-angular';
import { CellClickedEvent, ColDef, GridReadyEvent } from 'ag-grid-community';
import * as moment from 'moment';
import * as Highcharts from 'highcharts';

interface TableRow {
  date: string;
  from: string;
  to: string;
  amount: number;
  convertedAmount: number;
  rate: number;
}

@Component({
  selector: 'app-converter',
  templateUrl: './converter.component.html',
  styleUrls: ['./converter.component.scss']
})
export class ConverterComponent {
  timeLaps: { name: string; days: number; }[];
  currencies: { symbol: string; name: string; symbol_native: string; decimal_digits: number; rounding: number; code: string; name_plural: string; }[];

  fromCurrency = 'PKR';
  toCurrency = 'USD';
  selectedLap = 7;
  amount: number | undefined;
  convertedAmount: number | undefined;

  historyTableColumnDefs: ColDef[] = [
    { headerName: 'From', field: 'from' },
    { headerName: 'TO', field: 'to' },
    { headerName: 'Amount', field: 'amount' },
    { headerName: 'Converted Amoount', field: 'convertedAmount' },
    { headerName: 'Rate', field: 'rate' },
    { headerName: 'Data', field: 'date' },
  ];
  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
  };
  historyTableData: Array<TableRow> = [];
  // For accessing the Grid's API
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;

  //Currency Table
  currencyRateTableColumnDefs: ColDef[] = [
    { field: 'from' },
    { field: 'to' },
    { field: 'rate' },
    { field: 'date' },
    { field: 'day' },
  ];
  currencyRateTableData: any = [];
  pageSize: number = 0;


  Highcharts: typeof Highcharts = Highcharts;
  chartData: any = []
  chart = document.getElementById('chart');
  chartOptions: Highcharts.Options = {
    chart: {
      // zoomType: 'x',
      width: this.chart?.offsetWidth,
      height: 300
    },
    title: {
      text: `${this.fromCurrency} Exchange Rate For Current Day`,
    },
    xAxis: {
      categories: [], // Add more currency types here...
    },
    yAxis: {
      title: {
        text: 'Exchange Rate',
      },
    },
    legend: {
      enabled: false
    },
    series: [
      {
        type: 'column',
        name: 'Exchange Rate',
        data: [] // Add more data points here...
      },
    ],
  };
  isGraph: boolean = false;


  constructor(private _currencyService: CurrencyService, private _localHistoryService: LocalHistoryService) {
    this.currencies = this._currencyService.currencies
    this.timeLaps = this._currencyService.timeLaps
  }

  ngOnInit() {
    this.getExchangeRatesHistroy();
    this.getHistoryTableData();
  }

  // Example load data from sever
  onGridReady(params: GridReadyEvent) {

  }

  // Example of consuming Grid Event
  onCellClicked(e: CellClickedEvent): void {
    console.log('cellClicked', e);
  }

  // Example using Grid's API
  clearSelection(): void {
    this.agGrid.api.deselectAll();
  }

  updateTable(): void {
    const newData = this.historyTableData;
    this._localHistoryService.update(newData);
    this.getHistoryTableData();
  }

  getHistoryTableData(): void {
    this.historyTableData = this._localHistoryService.getData();
  }

  getExchangeRatesHistroy(): void {
    let start_date = moment().subtract(this.selectedLap - 1, 'days').format('YYYY-MM-DD');
    let end_date = moment().format('YYYY-MM-DD');

    this._currencyService.getExchangeRatesHistroy(start_date, end_date, this.fromCurrency).subscribe(
      response => {
        if (response) {
          this.currencyRateTableData = this._currencyService.prepareRecord(response).data?.reverse();
          this.pageSize = this._currencyService.prepareRecord(response).pageSize;
          this.chartData = this._currencyService.prepareRecord(response).chartData;
        }
      },
      error => {
        console.log(error)
      }
    );
  }

  swapConversions() {
    let temp = this.toCurrency;
    this.toCurrency = this.fromCurrency;
    this.fromCurrency = temp;
    this.resetInput();
  }

  toggleGraph() {
    this.isGraph = !this.isGraph;
    setTimeout(() => {
      var chart = document.getElementById('chart');
      this.chartOptions = {
        chart: {
          // zoomType: 'x',
          width: chart?.offsetWidth,
          height: 300
        },
        title: {
          text: `${this.fromCurrency} Exchange Rate For Current Day`,
        },
        xAxis: {
          categories: this.chartData.map((x: { key: any; value: any; }) => x.key),
        },
        yAxis: {
          title: {
            text: 'Exchange Rate',
          },
        },
        series: [
          {
            type: 'column',
            name: 'Exchange',
            data: this.chartData.map((x: {
              key: any; value: any;
            }) => x.value),
          },
        ],
      };
    }, 100);

  }

  resetInput() {
    this.amount = 0;
    this.convertedAmount = 0;
  }

  convertCurrency() {
    this._currencyService.convertAmount(this.fromCurrency, this.toCurrency, this.amount ?? 0).subscribe(
      response => {
        if (response) {
          this.convertedAmount = response?.result
          let row: TableRow = {
            date: response?.date ?? 'N/A',
            from: this.fromCurrency ?? 'N/A',
            to: this.toCurrency ?? 'N/A',
            amount: this.amount ?? 0,
            convertedAmount: response?.result ?? 0,
            rate: response?.info?.rate ?? 0
          }
          if (this.historyTableData === null) {
            let temp = [row];
            this.historyTableData = temp;
          } else {
            this.historyTableData.push(row);
          }

          this.updateTable();
        }
      },
      error => {
        console.log(error)
      }
    );
  }

  //Extra
  getExchangeRatesByCountry(): void {
    this._currencyService.getExchangeRatesByCountry(this.fromCurrency).subscribe(
      response => {
        console.log(response)
      },
      error => {
        console.log(error)
      }
    );
  }

}


