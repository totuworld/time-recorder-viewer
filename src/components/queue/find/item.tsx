import React from 'react';
import { Col, ListGroupItem, Row } from 'reactstrap';

import { ISlackUserInfo } from '../../../models/user/interface/IUserInfo';
import { Util } from '../../../services/util';
import GroupUserAvatar from '../../group/user/avatar';

interface Props {
  isOwned?: boolean;
}

type TProps = Props & ISlackUserInfo;

class QueueFindItem extends React.PureComponent<TProps> {
  constructor(props: TProps) {
    super(props);

    this.handleOnClick = this.handleOnClick.bind(this);
  }

  private handleOnClick() {
    if (Util.isNotEmpty(window)) {
      window.location.href = `/queue/add/${this.props.id}`;
    }
  }

  public render() {
    return (
      <ListGroupItem onClick={this.handleOnClick}>
        <Row className="justify-content-start">
          <Col className="col-sm-1">
            <GroupUserAvatar
              alt={this.props.real_name}
              img_url={this.props.profile_url}
              badge_status={null}
            />
          </Col>
          <Col className="col-md-6">
            <div>
              <div>{this.props.real_name}</div>
              <div className="small text-muted">
                slack id: {this.props.name}
              </div>
            </div>
          </Col>
        </Row>
      </ListGroupItem>
    );
  }
}

export default QueueFindItem;
