import { Controller } from 'react-hook-form';
import { Select } from 'antd';
import styled from './SelectField.module.css';

function SelectField({ 
  id,
  mode,
  name, 
  control, 
  options, 
  label, 
  placeholder, 
  required = false, 
  error 
}) {
  return (
    <div className={styled.formGroup} id={id}>
      {label && (<label htmlFor={name}>{label}{required && <span className={styled.obrigatorio}>*</span>}</label>)}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            size="large"
            mode={mode}
            placeholder={placeholder}
            options={options}
            value={field.value}
            onChange={(val) => field.onChange(val)}
            allowClear
          />
        )}
      />

      {error && <p className={styled.errorMessage}>{error.message}</p>}
    </div>
  );
}

export default SelectField;
