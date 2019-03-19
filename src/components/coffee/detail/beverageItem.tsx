import React from 'react';
import { Badge, ListGroupItem } from 'reactstrap';

import { IBeverage } from '../../../models/beverage/interface/IBeverage';

interface Props {
  count?: number;
  option?: string;
  isOwned?: boolean;
  handleOnClick?(): void;
}

type TProps = Props & IBeverage;

class BeverageFindItem extends React.PureComponent<TProps> {
  constructor(props: TProps) {
    super(props);

    this.handleOnClick = this.handleOnClick.bind(this);
  }

  private handleOnClick() {
    if (!!this.props.handleOnClick) {
      return this.props.handleOnClick();
    }
  }

  public render() {
    const badge = !!this.props.count ? <Badge>{this.props.count}</Badge> : null;
    const option = !!this.props.option ? (
      <div className="small text-muted">옵션: {this.props.option}</div>
    ) : null;
    return (
      <ListGroupItem onClick={this.handleOnClick}>
        <div>
          {this.props.title} ({this.props.alias}) {badge}
        </div>
        {option}
      </ListGroupItem>
    );
  }
}

export default BeverageFindItem;
