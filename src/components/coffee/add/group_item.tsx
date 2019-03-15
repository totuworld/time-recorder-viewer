import React from 'react';
import { Col, ListGroupItem, Row } from 'reactstrap';

import { IGroupInfo } from '../../../models/group/interface/IGroupInfo';

interface Props {
  handleOnClick?(): void;
}

type TProps = Props & IGroupInfo;

class GroupFindItem extends React.PureComponent<TProps> {
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
    return (
      <ListGroupItem onClick={this.handleOnClick} id={this.props.group_id}>
        <Row className="justify-content-start">
          <Col className="col-md-6">
            <div>
              <div>그룹: {this.props.name}</div>
            </div>
          </Col>
        </Row>
      </ListGroupItem>
    );
  }
}

export default GroupFindItem;
