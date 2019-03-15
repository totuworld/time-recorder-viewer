import { Field, Form, Formik, FormikActions, FormikProps } from 'formik';
import React from 'react';
import {
  Button,
  CardBody,
  FormFeedback,
  FormGroup,
  Input,
  Label
} from 'reactstrap';

interface FormValues {
  title: string;
  desc: string;
  private: boolean;
}

export const CreateEventItem = (props: {
  handleSubmit(values: FormValues): void;
}) => {
  return (
    <CardBody>
      <Formik
        initialValues={{
          title: '',
          desc: '',
          private: false
        }}
        validate={(currentValues: FormValues) => {
          let errors = {};
          if (currentValues.title.length <= 3) {
            errors = { title: '4글자 이상 입력해주세요' };
          }
          return errors;
        }}
        onSubmit={(
          currentValues: FormValues,
          { setSubmitting }: FormikActions<FormValues>
        ) => {
          setTimeout(() => {
            props.handleSubmit(currentValues);
            setSubmitting(false);
          }, 15);
        }}
        render={(formProps: FormikProps<FormValues>) => (
          <Form>
            <FormGroup>
              <Label htmlFor="breakTitle">이름</Label>
              <Input
                id="breakTitle"
                name="title"
                placeholder="모임명"
                type="text"
                tag={Field}
                invalid={
                  formProps.touched.title === true && !!formProps.errors.title
                }
              />
              {formProps.touched.title && formProps.errors.title ? (
                <FormFeedback>{formProps.errors.title}</FormFeedback>
              ) : null}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="breakDesc">설명</Label>
              <Input
                id="breakDesc"
                name="desc"
                placeholder="커피 한 잔 마셔요"
                type="text"
                tag={Field}
              />
            </FormGroup>

            <FormGroup check={true}>
              <Label htmlFor="email">
                <Input id="email" name="private" type="checkbox" tag={Field} />{' '}
                비공개
              </Label>
            </FormGroup>

            <Button
              type="submit"
              color={formProps.isValid === false ? '' : 'primary'}
              disabled={formProps.isSubmitting || formProps.isValid === false}
            >
              다음
            </Button>
          </Form>
        )}
      />
    </CardBody>
  );
};
