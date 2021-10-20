import React, {useState, useEffect, StyleHTMLAttributes} from "react";
import axios from "axios";
import styled from 'styled-components'
import { Button, Checkbox, Form, Modal, Dropdown, Placeholder, Grid } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'

type gridOptions = {
  [key: string]: number
}

const Link = styled.a`
background-color: ${({ backgroundColor }) => backgroundColor};
color: ${({ color }) => color};
border-radius: 3px;
width: 150px;
border: none;
padding: 20px;
margin: 0 auto; 
cursor: pointer;
display: flex;
`

const InputContainer = styled.div`
  grid-column-start: ${({ options }) => options.columnStart};
  grid-row-start: ${({ options }) => options.rowStart};
  grid-column-end: span ${({ options, defaultFieldColumns }) => (options.columns ?  options.columns.toString()  : defaultFieldColumns.toString())};
  grid-row-end: span ${({ options }) => ( options.rows ?  options.rows.toString()  : '1')};
  ${({options}) =>
    {
      if(options.responsive){
        const breakpoints = options.responsive.map ((breakpoint, i) => {
           return `
            @media (max-width: ${breakpoint.breakpoint}px) {
              ${breakpoint.columnStart ? ` grid-column-start: ${breakpoint.columnStart}` : ''};
              ${breakpoint.rowStart ? ` grid-row-start: ${breakpoint.rowStart}` : ''};
              ${breakpoint.columns ? ` grid-column-end: span ${breakpoint.columns}` : ''};
              ${breakpoint.rows ? ` grid-row-end: span ${breakpoint.rows}` : ''};
            }
           `
        })
        return breakpoints;
      }
    }
  }
  
`

const TextField = styled.input`
  height: ${({options, getInputHeight}) => getInputHeight(options?.rows)};

  ${({options, getInputHeight}) =>
    {
      if(options.responsive){
        const breakpoints = options.responsive.map ((breakpoint, i) => {
           return `
            @media (max-width: ${breakpoint.breakpoint}px) {
              height: ${getInputHeight(breakpoint.rows)};
            }
           `
        })
        return breakpoints;
      }
    }
  }
  
`

const TextArea = styled.textarea`
  height: ${({options, getInputHeight}) => getInputHeight(options?.rows)} !important;

  ${({options, getInputHeight}) =>
    {
      if(options.responsive){
        const breakpoints = options.responsive.map ((breakpoint, i) => {
          return `
            @media (max-width: ${breakpoint.breakpoint}px) {
              height: ${getInputHeight(breakpoint.rows)} !important;
            }
          `
        })
        return breakpoints;
      }
    }
  }
`

export const InlineForm = (props: IProps) => {
  
  const [values, setValues] = useState(new Array(props.fields.length));
  const [errors, setErrors] = useState(new Array(props.fields.length));
  const [sent, setSent] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const booleanTypes = ['checkbox', 'radio', 'switch']

  useEffect(() => {
    var defaultValues = props.fields.map((field, i) => 
    {
      if(booleanTypes.includes(field.type)){
        return false;
      } else {
        return '';
      }
    });
    setValues(defaultValues)
  }, [])

  useEffect(() => {
    if(sent){
      setErrors(validateForm());
    }
  }, [values])

  const updateValue = (value, i) => {
    var currentValues = [...values];
    currentValues[i] = value;
    setValues(currentValues);
  }

  const postContact  = async () => {
    setSent(true);
    const currentErrors = validateForm();
    if(!currentErrors.includes(true) && !currentErrors.includes('required') ){
      var data = {};
      props.fields.map((field, i) => 
      data[field.name] = values[i]
      );
      setSent(false);
      props.onSuccess(data);
      if(props.API){
        var apiResponse = await axios.post(props.API, data);
        setModalOpen(true);
      } else if (props.successModal) {
        setModalOpen(true);
      }
      var defaultValues = props.fields.map((field, i) => 
      {
        if(booleanTypes.includes(field.type)){
          return false;
        } else {
          return '';
        }
      });
      setValues(defaultValues);
    }
  }

  const validateForm = () => {
    var error = false;
    var currentErrors = props.fields.map((field, i) => 
    {
      //validateRequired
      if(field.required && values[i] == ''){
        error = true;
        return 'required';
      }
      if(!booleanTypes.includes(field.type)){
        //validateMaxWidth
        if(field.maxLength && values[i].length > field.maxLength){
          return true;
        }
        //validateRegex
        return testRegex(field, values[i])
      }
      return false
    }
    );
    setErrors(currentErrors);
    return(currentErrors);
  }


  const testRegex = (field, value) => {
    switch(field.type) {
      case 'email':
        return !value.match(field.regex ? field.regex : /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/);
      default:
        return !value.match(field.regex ? field.regex : /.*/);
    }
  }

  const getInputHeight = (fieldRows) => {
    // multiply the absolute height by the number of rows
    var height = props.fieldsHeight * (fieldRows ? fieldRows : 1)
    // add de rowGat to Height to fill the Row as 2 singles inputs
    height = height + (props.rowGap * ((fieldRows ? fieldRows : 1) -1));
    // return value as pixel format
    return height + 'px';
  }


  const renderInput = (field, i) => {
    switch(field.type) {
      case 'email':
        return <TextField options={field.gridOptions} getInputHeight={(rows) => getInputHeight(rows)} type="email" placeholder={field.placeHolder} value={values[i]} onChange={(e) => updateValue(e.target.value, i)} />;
      case 'phone':
        return <TextField options={field.gridOptions} getInputHeight={(rows) => getInputHeight(rows)} type="tel" placeholder={field.placeHolder} value={values[i]} onChange={(e) => updateValue(e.target.value, i)} />;
      case 'url':
        return <TextField options={field.gridOptions} getInputHeight={(rows) => getInputHeight(rows)} type="url" placeholder={field.placeHolder} value={values[i]} onChange={(e) => updateValue(e.target.value, i)} />;
      case 'text':
        return <TextField options={field.gridOptions} getInputHeight={(rows) => getInputHeight(rows)} type="text" placeholder={field.placeHolder} value={values[i]} onChange={(e) => updateValue(e.target.value, i)} />;
      case 'textArea':
        return <TextArea options={field.gridOptions} getInputHeight={(rows) => getInputHeight(rows)} placeholder={field.placeHolder} value={values[i]} onChange={(e) => updateValue(e.target.value, i)} />;
      case 'checkbox':
        return <Checkbox label={field.label} checked={values[i]} onChange={(e) => updateValue(!values[i], i)} />;
      case 'switch':
        return <Checkbox label={field.label} toggle checked={values[i]} onChange={(e) => updateValue(!values[i], i)} />;
      case 'dropdown':
        return <Dropdown placeholder={field.placeHolder} fluid selection options={field.options} onChange={(e, { value }) => updateValue(value.toString(), i)}/>
      default:
        return <TextField options={field.gridOptions} getInputHeight={(rows) => getInputHeight(rows)} placeholder={field.placeHolder} value={values[i]} onChange={(e) => updateValue(e.target.value, i)} />;
    }
  }

  return (
      <Form style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${props.gridColumns.toString()}, 1fr)`,
        columnGap: props.columnGap + 'px',
        rowGap: props.rowGap + 'px',
      }}>
        {props.fields.map((field, i) =>
        
          <InputContainer
            options={field.gridOptions}
            defaultFieldColumns={props.defaultFieldColumns}
            key={i}
            
            // style={{
            //   textAlign: 'right',
            //   gridColumnStart: field.gridOptions?.columnStart,
            //   gridRowStart: field.gridOptions?.rowStart,
            //   gridColumnEnd: 'span ' + (field.gridOptions?.columns ? field.gridOptions?.columns.toString()  : props.defaultFieldColumns.toString()),
            //   gridRowEnd: 'span ' + (field.gridOptions?.rows ? field.gridOptions?.rows.toString()  : '1'),
            // }}
          >
            <Form.Field style={{height: '100%'}} error={errors[i]}>
              { !booleanTypes.includes(field.type) && field.label &&
                <label style={{}}>{field.label}</label>
              }
              {
                renderInput(field, i)
              }
            </Form.Field>
          </InputContainer>
        )
        }
        <div
          className="buttonContainer"
          style={{
            gridColumnStart: props.submitGridOptions.columnStart,
            gridRowStart: props.submitGridOptions.rowStart,
            gridColumnEnd: 'span ' + (props.submitGridOptions.columns ?  props.submitGridOptions.columns.toString()  : props.defaultFieldColumns.toString()),
            gridRowEnd: 'span ' + ( props.submitGridOptions.rows ?  props.submitGridOptions.rows.toString()  : '1'),
          }}
        >
          <Button style={props.submitStyles} type='submit' onClick={
            () => {
              postContact();
            }
            }>{props.submitText}</Button>
        </div>
      <Modal
        onMount={() => setTimeout(function(){ setModalOpen(false); }, 2000)}
        open={modalOpen}
      >
        <Modal.Header>{props.successModalText}</Modal.Header>
      </Modal>
    </Form>
  )
}

interface IProps {
  API?: string;
  fields: any[];
  onSuccess?: (data) => void;
  submitText?: string;
  subtitle?: string;
  successModal?: boolean;
  successModalText?: string;
  title?: string;
  gridColumns: number,
  columnGap: number,
  submitStyles: React.CSSProperties,
  submitGridOptions: gridOptions,
  rowGap: number,
  object: myobjecttype,
  defaultFieldColumns: number, //number of columns that a field take
  fieldsHeight: number, // height (on px) of a single-row input. (if a input has more rows, its multiply by this number) 
}

interface myobjecttype {
  name: string,
  date: dateTime;
}


InlineForm.defaultProps = {
  API: '',
  onSuccess: null,
  submitText: 'Submit',
  subtitle: 'Complete the following form',
  successModal: true,
  successModalText: 'Success!',
  title: 'Form',
  gridColumns: 1,
  defaultFieldColumns: 1,
  columnGap: 3,
  rowGap: 3,
  fieldsHeight: '50',
}