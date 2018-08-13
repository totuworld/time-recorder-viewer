import React from 'react';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'reactstrap';

import menu from '../../assets/img/menu.svg';
import { EN_WORK_TYPE } from '../../models/time_record/interface/EN_WORK_TYPE';
import { floatMenuBtn } from './buttonsStyle';

interface IRecordButtonsProps {
  handleClickMenu(menuOption: EN_WORK_TYPE);
}

interface IRecordButtonsStates {
  isOpen: boolean;
}

class RecordButtons extends React.Component<IRecordButtonsProps, IRecordButtonsStates> {

  constructor(props: any) {
    super(props);

    this.state = {
      isOpen: false,
    };

    this.toggleDropdown = this.toggleDropdown.bind(this);
  }

  public toggleDropdown() {
    this.setState({
      ...this.state,
      isOpen: !this.state.isOpen
    });
  }

  public render() {
    return (
      <Dropdown
        isOpen={this.state.isOpen}
        toggle={this.toggleDropdown}
      >
        <DropdownToggle>
          <img className={`${floatMenuBtn}`} src={menu} />
        </DropdownToggle>
        <DropdownMenu right={true} style={{ right: 'auto' }}>
          <DropdownItem onClick={() => { this.props.handleClickMenu(EN_WORK_TYPE.WORK); }}>
            출근
          </DropdownItem>
          <DropdownItem onClick={() => { this.props.handleClickMenu(EN_WORK_TYPE.BYEBYE); }}>
            퇴근
          </DropdownItem>
          <DropdownItem onClick={() => { this.props.handleClickMenu(EN_WORK_TYPE.REST); }}>
            휴식
          </DropdownItem>
          <DropdownItem onClick={() => { this.props.handleClickMenu(EN_WORK_TYPE.EMERGENCY); }}>
            긴급대응
          </DropdownItem>
          <DropdownItem onClick={() => { this.props.handleClickMenu(EN_WORK_TYPE.DONE); }}>
            완료
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );
  }
}

export default RecordButtons;