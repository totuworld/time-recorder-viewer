import React from 'react';
import { HorizontalBar } from 'react-chartjs-2';

export interface IChartBarStacked2Props {
  labels: string[];
  datasets: IChartDatasetItem[];
  height?: number;
  width?: number;
}

export interface IChartDatasetItem {
  label?: string;
  data: number[];
}

export default class ChartBarStacked2 extends React.Component<IChartBarStacked2Props> {
  public render() {
    return (
      <HorizontalBar
        data={{labels: this.props.labels, datasets: this.props.datasets}}
        options={{ scales: { xAxes: [{stacked: true}], yAxes: [{stacked: true}] }, legend: { position: 'bottom' } }}
        width={this.props.width}
        height={this.props.height}
      />
    );
  }
}