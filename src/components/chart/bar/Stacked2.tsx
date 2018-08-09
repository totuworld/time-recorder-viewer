import React from 'react';
import { HorizontalBar } from 'react-chartjs-2';

export interface IChartBarStacked2Props {
  labels: string[];
  datasets: IChartDatasetItem[];
  height?: number;
  width?: number;
  onClickBar?(labelStr: string);
}

export interface IChartDatasetItem {
  label: string;
  data: number[];
}

// tslint:disable
export default class ChartBarStacked2 extends React.Component<IChartBarStacked2Props> {
  public render() {
    const options = {
      scales: { xAxes: [{stacked: true}], yAxes: [{stacked: true}] },
      legend: { position: 'bottom' },
      onClick: (e, a) => { console.log(a.lenght > 0 ? JSON.stringify(a[0]) : null); }
    };
    return (
      <HorizontalBar
        data={{labels: this.props.labels, datasets: this.props.datasets}}
        options={{ scales: { xAxes: [{stacked: true}], yAxes: [{stacked: true}] }, legend: { position: 'bottom' }, onClick: (e, a: { _model:any }[]) => { if (!!a && !!this.props.onClickBar && a.length > 0) { this.props.onClickBar(a[0]._model.label); } }}}
        width={this.props.width}
        height={this.props.height}
      />
    );
  }
}