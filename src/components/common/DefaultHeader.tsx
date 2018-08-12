import React from 'react';
import {
    Container, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Nav, NavItem, NavLink
} from 'reactstrap';

import avatar from '../../assets/img/avatar.svg';
import logo from '../../assets/img/brand/logo.svg';
import sygnet from '../../assets/img/brand/sygnet.svg';
import { IUserInfo } from '../../models/user/interface/IUserInfo';
import { Auth } from '../../services/auth';

export interface IDefaultHeaderProps {
  isLogin: boolean;
  userInfo: IUserInfo | null;
  onClickLogout(): void;
  onClickLogin(): void;
}

interface IDefaultHeaderStates {
  isOpen: boolean;
  isLoginPopover: boolean;
}

class DefaultHeader extends React.Component<IDefaultHeaderProps, IDefaultHeaderStates> {
  constructor(props: IDefaultHeaderProps) {
    super(props);

    this.state = {
      isOpen: false,
      isLoginPopover: false,
    };
    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.onClickLogin = this.onClickLogin.bind(this);
  }

  public toggleDropdown() {
    this.setState({
      ...this.state,
      isOpen: !this.state.isOpen
    });
  }

  public onClickLogin() {
    if (this.props.isLogin === false) {
      this.props.onClickLogin();
    } else {
      this.props.onClickLogout();
    }
  }

  public render() {
    const imgUrl = this.props.isLogin === true && !!this.props.userInfo ?
      this.props.userInfo.profile_url :
      avatar;
    return (
      <header className="app-header navbar">
        <Container>
          <Nav className="d-md-down-none" navbar={true}>
            <NavItem className="px-3">
              <NavLink href="#">Today</NavLink>
            </NavItem>
            <NavItem className="px-3">
              <NavLink href="/groups">Groups</NavLink>
            </NavItem>
            <NavItem className="px-3">
              <NavLink href="/records">Records</NavLink>
            </NavItem>
          </Nav>
          <Nav className="ml-auto" navbar={true}>
            <Dropdown
              nav={true}
              isOpen={this.state.isOpen}
              toggle={this.toggleDropdown}
            >
              <DropdownToggle nav={true}>
                <img
                  src={imgUrl}
                  className="img-avatar"
                  alt={this.props.isLogin === true && !!this.props.userInfo ? this.props.userInfo.real_name : 'empty'}
                />
              </DropdownToggle>
              <DropdownMenu right={true} style={{ right: 'auto' }}>
                <DropdownItem onClick={this.onClickLogin}>
                  <i className="fa fa-lock" /> {this.props.isLogin === true ? ' Logout' : ' Login'}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </Nav>
        </Container>
      </header>
    );
  }
}

export default DefaultHeader;