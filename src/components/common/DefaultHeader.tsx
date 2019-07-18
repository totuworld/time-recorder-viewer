import * as luxon from 'luxon';
import React from 'react';
import {
  Container,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Nav,
  NavItem,
  NavLink
} from 'reactstrap';

import avatar from '../../assets/img/avatar.svg';
import worklog from '../../assets/img/worklog.svg';
import { IUserInfo } from '../../models/user/interface/IUserInfo';

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

class DefaultHeader extends React.Component<
  IDefaultHeaderProps,
  IDefaultHeaderStates
> {
  constructor(props: IDefaultHeaderProps) {
    super(props);

    this.state = {
      isOpen: false,
      isLoginPopover: false
    };
    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.onClickLogin = this.onClickLogin.bind(this);
    this.todayMenu = this.todayMenu.bind(this);
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

  public todayMenu() {
    const userInfo = this.props.userInfo;
    if (this.props.isLogin === true && !!userInfo === true) {
      const today = luxon.DateTime.local().toFormat('yyyy-LL-dd');
      const url = `/records/${
        userInfo!.id
      }?startDate=${today}&endDate=${today}`;
      return (
        <>
          <DropdownItem
            onClick={() => {
              window.location.href = url;
            }}
          >
            오늘 기록
          </DropdownItem>
          <DropdownItem
            onClick={() => {
              window.location.href = '/my/overload';
            }}
          >
            초과 근무 내역
          </DropdownItem>
          <DropdownItem
            onClick={() => {
              window.location.href = `/queue/add/${userInfo!.id}`;
            }}
          >
            받은 저기요 목록
          </DropdownItem>
          <DropdownItem
            onClick={() => {
              window.location.href = '/queue';
            }}
          >
            🛎저기요
          </DropdownItem>
        </>
      );
    }
    return null;
  }

  public render() {
    const imgUrl =
      this.props.isLogin === true && !!this.props.userInfo
        ? this.props.userInfo.profile_url
        : avatar;
    const isLogin = this.props.isLogin === true && !!this.props.userInfo;
    const userName =
      this.props.isLogin === true && !!this.props.userInfo
        ? this.props.userInfo.real_name
        : '';
    const todayMenu = this.todayMenu();
    const groupList =
      this.props.isLogin === true ? (
        <NavLink href="/groups">그룹 목록</NavLink>
      ) : null;
    const coffee = (
      <NavLink href="/coffeebreak" alt="커피투게더">
        ☕️타임
      </NavLink>
    );
    return (
      <header className="app-header navbar">
        <Container>
          <img
            src={worklog}
            height="20"
            alt="Work Logger"
            className="navbar-brand-minimized clickable"
            onClick={() => {
              window.location.href = '/';
            }}
          />
          <Nav className="ml-auto" navbar={true}>
            <NavItem className="px-3">{coffee}</NavItem>
            <NavItem className="px-3">{groupList}</NavItem>
            <Dropdown
              nav={true}
              isOpen={this.state.isOpen}
              toggle={this.toggleDropdown}
            >
              <DropdownToggle nav={true}>
                <span className="circle-border">
                  <img src={imgUrl} className="img-avatar" alt={userName} />
                </span>
                {isLogin && (
                  <span className="header-username d-none d-sm-inline-block">
                    {userName}
                  </span>
                )}
              </DropdownToggle>
              <DropdownMenu right={true} style={{ right: 'auto' }}>
                {todayMenu}
                <DropdownItem onClick={this.onClickLogin}>
                  {this.props.isLogin === true ? ' Logout' : ' Login'}
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
