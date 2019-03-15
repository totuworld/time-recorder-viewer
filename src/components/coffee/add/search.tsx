import React from 'react';
import { Button, CardBody, Input, InputGroup, Label } from 'reactstrap';

const ENTER_KEY = 13;

export const Search = (props: {
  title: string;
  onChangeInput(e: React.ChangeEvent<HTMLInputElement>): void;
  handleSubmit(): void;
}) => {
  return (
    <CardBody>
      <Label>
        <span className="font-weight-bold">{props.title}</span>의 참가자 추가
      </Label>
      <InputGroup>
        <Input
          id="searchText"
          name="title"
          placeholder="검색어 입력 (ex - 야놀자)"
          type="text"
          onChange={props.onChangeInput}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.keyCode === ENTER_KEY) {
              props.handleSubmit();
            }
          }}
        />
        <Button color="primary" onClick={props.handleSubmit}>
          검색
        </Button>
      </InputGroup>
    </CardBody>
  );
};
