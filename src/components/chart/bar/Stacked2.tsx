import React from 'react';
import { HorizontalBar } from 'react-chartjs-2';
import { Util } from '../../../services/util';

export interface IChartDatasetItem {
  label: string;
  data: number[];
}

export interface IChartBarStacked2Props {
  labels: string[];
  datasets: IChartDatasetItem[];
  height?: number;
  width?: number;
  onClickBar?(labelStr: string): void;
}

const getTimePair = (
  item: Chart.ChartTooltipItem,
  data: Chart.ChartData
): [string, number] => {
  if (!data.datasets) {
    return ['', 0];
  }
  const dataset = data.datasets[item.datasetIndex!];
  const times = dataset.data as number[];
  return [dataset.label!, times[item.index!]];
};

export default class ChartBarStacked2 extends React.Component<
  IChartBarStacked2Props
> {
  private readonly options: Chart.ChartOptions = {
    scales: {
      xAxes: [{ stacked: true }],
      yAxes: [{ stacked: true }]
    },
    legend: { position: 'bottom' },
    onClick: (_: any, a: Array<{ _model: any }>) => {
      if (!!a && !!this.props.onClickBar && a.length > 0) {
        this.props.onClickBar(a[0]._model.label);
      }
    },
    tooltips: {
      enabled: true,
      filter: (item: Chart.ChartTooltipItem, data: Chart.ChartData) => {
        const [_, time] = getTimePair(item, data);
        return time > 0;
      },
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
      <HorizontalBar
        data={{ labels: this.props.labels, datasets: this.props.datasets }}
        options={this.options}
        width={this.props.width}
        height={this.props.height}
      />
    );
  }
}
