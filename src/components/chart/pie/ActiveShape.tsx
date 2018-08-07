import React from 'react';
import { Pie, PieChart, ResponsiveContainer, Sector } from 'recharts';

export interface IChartPieActiveShapeProps {
  data: object[];
  dataKey: string;
  fill?: string;
  chartWidht?: number | string;
  chartHeight?: number | string;
  minHeight?: number;
  cx?: number | string;
  cy?: number | string;
  innerRadius?: number | string;
  outerRadius?: number | string;
}

export interface IChartPieActiveShapeStates {
  activeIndex: number;
}

export default class ChartPieActiveShape
  extends React.Component<IChartPieActiveShapeProps, IChartPieActiveShapeStates> {
  constructor(props: IChartPieActiveShapeProps) {
    super(props);

    this.state = {
      activeIndex: 0
    };
  }

  public onPieEnter(_: any, index: number) {
    this.setState({
      ...this.state,
      activeIndex: index,
    });
  }

  public render() {
    return (
      <ResponsiveContainer width={this.props.chartWidht} minHeight={this.props.minHeight}>
        <PieChart>
          <Pie
            dataKey={this.props.dataKey}
            activeIndex={this.state.activeIndex}
            // activeShape={renderActiveShape}
            data={this.props.data}
            cx={this.props.cx}
            cy={this.props.cy}
            innerRadius={this.props.innerRadius}
            outerRadius={this.props.outerRadius}
            fill={this.props.fill}
            onMouseEnter={this.onPieEnter}
          >
            {this.props.children}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    );
  }
}
