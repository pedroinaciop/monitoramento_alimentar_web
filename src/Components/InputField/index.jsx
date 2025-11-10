import styled from './InputField.module.css';
import { forwardRef } from "react";

const InputField = forwardRef(({
    readOnly,
    obrigatorio,
    idInput,
    idDiv,
    label,
    type,
    min,
    max,
    defaultValue,
    register,
    validation,
    error,
    maxLength,
    autoFocus,
    placeholder,
    className,
    valueAsNumber = false,
    autoComplete,
    ...rest
}, ref) => {
    return (
        <div className={styled.formGroup} id={idDiv}>
            <label htmlFor={idInput}>{label}{obrigatorio=== true ? <span className={styled.obrigatorio}>*</span> : null}</label>
                <input
                    readOnly={readOnly}
                    ref={ref}
                    min={min}
                    max={max}
                    defaultValue={defaultValue ?? ""}      
                    id={idInput}
                    type={type}
                    maxLength={maxLength}
                    autoFocus={autoFocus}
                    autoComplete={autoComplete}
                    className={`${className} ${error ? styled.inputError : ''}`}
                    placeholder={placeholder}
                    {...(register ? register(idInput, { validation, valueAsNumber }) : {})}
                    {...rest}
                />
            {error && <span className={styled.errorMessage}>{error.message}</span>}
        </div>
    );
});

export default InputField;