import React, { ReactNode } from 'react';
import { Button, CardBody, Input, InputGroup, Label } from 'reactstrap';
import { Util } from '../../../services/util';

const ENTER_KEY = 13;

export const Search = (props: {
  title: string;
  showTitle: boolean;
  placeHolder?: string;
  disabled?: boolean;
  children?: ReactNode;
  onChangeInput(e: React.ChangeEvent<HTMLInputElement>): void;
  handleSubmit(): void;
}) => {
  const disableValue = Util.isNotEmpty(props.disabled) ? props.disabled : false;
  const titleLabel =
    props.showTitle === true ? (
      <Label>
        <span className="font-weight-bold">{props.title}</span>의 참가자 추가
      </Label>
    ) : null;
  return (
    <CardBody>
      {titleLabel}
      <InputGroup>
        <Input
          id="searchText"
          name="title"
          placeholder={!!props.placeHolder ? props.placeHolder : '검색어 입력'}
          type="text"
          onChange={props.onChangeInput}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.keyCode === ENTER_KEY) {
              props.handleSubmit();
            }
          }}
          disabled={disableValue}
        />
        <Button
          color="primary"
          onClick={props.handleSubmit}
          disabled={disableValue}
        >
          검색
        </Button>
      </InputGroup>
      {props.children}
    </CardBody>
  );
};
