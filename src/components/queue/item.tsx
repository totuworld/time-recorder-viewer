import * as luxon from 'luxon';
import React from 'react';
import { Button, Col, ListGroupItem, Row } from 'reactstrap';

import { IQueue } from '../../models/user/interface/IQueue';

interface Props {
  isOwned: boolean;
  orderNo: number;
  onClickDeleteBtn?(id: string): void;
}

type TProps = Props & IQueue;

class QueueItem extends React.PureComponent<TProps> {

  constructor(props: TProps) {
    super(props);

    this.handleOnClickDeleteBtn = this.handleOnClickDeleteBtn.bind(this);
  }

  private handleOnClickDeleteBtn() {
    if (this.props.onClickDeleteBtn) {
      this.props.onClickDeleteBtn(this.props.id);
    }
  }

  public render() {
    const date = luxon.DateTime.fromISO(this.props.created).toLocaleString(luxon.DateTime.DATETIME_SHORT);
    const deleteBtn = this.props.isOwned === true ?
      <span className="list-group-button">
        <Button className="btn-danger" onClick={this.handleOnClickDeleteBtn}>삭제</Button>
      </span> :
      null;
    return (
      <ListGroupItem className="justify-content-between">
        <span
          className={`float-right badge badge-${this.props.orderNo === 1 ? 'primary' : 'secondary'} badge-pill`}
        >
          {this.props.orderNo}
        </span>
        <div>{this.props.real_name}</div>
        <div className="small text-muted">{date}</div>
        {deleteBtn}
      </ListGroupItem>
    );
  }
}

export default QueueItem;