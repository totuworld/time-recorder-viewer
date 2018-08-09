import React from 'react';

export interface IGroupUserAvatarProps {
  alt?: string;
  img_url: string;
  badge_status: 'success' | 'info' | 'warning' | 'danger' | null;
}

export default class GroupUserAvatar extends React.PureComponent<IGroupUserAvatarProps> {
  constructor(props: IGroupUserAvatarProps) {
    super(props);
  }

  public render() {
    const badge = this.props.badge_status !== null ?
      <span className={`avatar-status badge-${this.props.badge_status}`} /> :
      null;
    return (
      <div className="avatar">
        <img
          src={this.props.img_url}
          className="img-avatar"
          alt={this.props.alt}
        />
        {badge}
      </div>
    );
  }
}