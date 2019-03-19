import React from 'react';
import { ListGroupItem } from 'reactstrap';

import { IUserInfo } from '../../../models/user/interface/IUserInfo';
import { Util } from '../../../services/util';

interface Props {
  isOwned?: boolean;
  handleOnClick?(): void;
}
type TProps = Props & {
  title: string;
  option?: string;
  beverage_id: string;
  count: number;
  isMine?: boolean;
} & {
  users: IUserInfo[];
};

class OrderItem extends React.PureComponent<TProps> {
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
    const text = Util.isEmpty(this.props.option)
      ? this.props.title
      : `${this.props.title} (${this.props.option})`;
    const users = this.props.users.reduce((acc: string[], cur) => {
      acc.push(cur.real_name);
      return acc;
    }, []);
    return (
      <ListGroupItem
        onClick={this.handleOnClick}
        color={this.props.isMine === true ? 'info' : ''}
      >
        <div>
          <span className="badge badge-light badge-pill">
            {this.props.count}
          </span>{' '}
          {text}
        </div>
        <div className="small text-muted">{users.join(', ')}</div>
      </ListGroupItem>
    );
  }
}

export default OrderItem;
