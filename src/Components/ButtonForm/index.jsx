import styled from './ButtonForm.module.css';
const ButtonForm = ({ text, type, disabled }) => {
    return (
        <button type={type} className={text === "Limpar" ? styled.btnLimpar : styled.btnRegister} disabled={disabled} >
            {text}
        </button>
    ); 
}

export default ButtonForm;