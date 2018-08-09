import React from 'react';
import { Doughnut } from 'react-chartjs-2';

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

export default class ChartPieDonut extends React.Component<IChartBarStacked2Props> {
  public render() {
    return (
      <Doughnut
        data={{labels: this.props.labels, datasets: this.props.datasets}}
        options={{ legend: { position: 'bottom' } }}
        width={this.props.width}
        height={this.props.height}
      />
    );
  }
}