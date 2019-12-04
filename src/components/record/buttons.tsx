import React from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row
} from 'reactstrap';

import menu from '../../assets/img/menu.svg';
import {
  EN_WORK_TITLE_KR,
  EN_WORK_TYPE
} from '../../models/time_record/interface/EN_WORK_TYPE';
import { circleBtn, floatMenuBtn } from './buttonsStyle';

interface IRecordButtonsProps {
  menuOnOff: { [key: string]: boolean };
  handleClickMenu(menuOption: EN_WORK_TYPE);
}

interface IRecordButtonsStates {
  isOpen: boolean;
}

class RecordButtons extends React.Component<
  IRecordButtonsProps,
  IRecordButtonsStates
> {
  constructor(props: any) {
    super(props);

    this.state = {
      isOpen: false
    };

    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.getBtns = this.getBtns.bind(this);
  }

  public toggleDropdown() {
    this.setState({
      ...this.state,
      isOpen: !this.state.isOpen
    });
  }

  public getBtns() {
    return Object.keys(this.props.menuOnOff)
      .map((key: string) => {
        if (this.props.menuOnOff[key] === true) {
          return (
            <DropdownItem
              key={key}
              onClick={() => {
                this.props.handleClickMenu(EN_WORK_TYPE[key]);
              }}
            >
              {EN_WORK_TITLE_KR[key]}
            </DropdownItem>
          );
        }
        return null;
      })
      .filter(fv => fv !== null);
  }

  public render() {
    const btns = this.getBtns();
    return (
      <Dropdown
        direction="up"
        isOpen={this.state.isOpen}
        toggle={this.toggleDropdown}
      >
        <DropdownToggle className={`${circleBtn}`}>
          <img className={`${floatMenuBtn}`} src={menu} />
        </DropdownToggle>
        <DropdownMenu right={true}>{btns}</DropdownMenu>
      </Dropdown>
    );
  }
}

export default RecordButtons;
