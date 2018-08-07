import React from 'react';
import {
    Bar, BarChart, CartesianGrid, Legend, Margin, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';

export interface IChartData {
  name: string;
  data: {[key: string]: number};
}

export interface IChartBarStackedProps<T extends IChartData> {
  chartWidht?: number | string;
  chartHeight?: number | string;
  minHeight?: number;
  margin?: Partial<Margin>;
  data: T[];
  barColor?: Array<{ targetKey: string, color: string }>;
  onClick?(args: any): void;
}

export default class ChartBarStacked<T extends IChartData> extends React.Component<IChartBarStackedProps<T>> {
  private bars: JSX.Element[] = [];
  public render() {
    const updateDate = this.props.data.map((mv) => {
      return {
        name: mv.name,
        ...mv.data,
      };
    });

    if (this.bars.length === 0) {
      this.bars = Object.keys(this.props.data[0].data).map(
        (mvKey, index) => {
          if (!!this.props.barColor) {
            const colorObj = this.props.barColor.find((fv) => fv.targetKey === mvKey);
            if (!!colorObj) {
              return <Bar key={index} dataKey={mvKey} fill={colorObj.color} />;
            }
          }
          return <Bar key={index} dataKey={mvKey} />;
        });
    }
    return (
      <ResponsiveContainer width={this.props.chartWidht} minHeight={this.props.minHeight}>
        <BarChart
          layout="vertical"
          data={updateDate}
          margin={this.props.margin}
          onClick={this.props.onClick}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" />
          <Tooltip />
          <Legend />
          {this.bars}
        </BarChart>
      </ResponsiveContainer>
    );
  }
}
