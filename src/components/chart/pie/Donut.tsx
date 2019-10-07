import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Util } from '../../../services/util';

export interface IChartDatasetItem {
  label?: string;
  data: number[];
}

export interface IChartPieDonutProps {
  labels: string[];
  datasets: IChartDatasetItem[];
  height?: number;
  width?: number;
}

const getTimePair = (
  item: Chart.ChartTooltipItem,
  data: Chart.ChartData
): [string, number] => {
  if (!data.datasets) {
    return ['', 0];
  }
  const labels = data.labels! as string[];
  const times = data.datasets[item.datasetIndex!].data as number[];
  return [labels[item.index!], times[item.index!]];
};

export default class ChartPieDonut extends React.Component<
  IChartPieDonutProps
> {
  private readonly options: Chart.ChartOptions = {
    legend: { position: 'left' },
    tooltips: {
      enabled: true,
      callbacks: {
        label(item: Chart.ChartTooltipItem, data: Chart.ChartData) {
          const [label, time] = getTimePair(item, data);
          const [hour, min, sec] = Util.getTimeComponents(time);

          return `${label}: ${hour}시간 ${min}분 ${sec}초`;
        }
      }
    }
  };

  public render() {
    return (
      <Doughnut
        data={{ labels: this.props.labels, datasets: this.props.datasets }}
        options={this.options}
        width={this.props.width}
        height={this.props.height}
      />
    );
  }
}
