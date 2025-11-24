import InputPassword from '../../Components/InputPassword';
import { zodResolver } from '@hookform/resolvers/zod';
import HeaderForm from '../../Components/HeaderForm';
import FooterForm from '../../Components/FooterForm';
import InputField from '../../Components/InputField';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styled from './UserForm.module.css';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import api from '../../services/api'
import { z } from 'zod';

const UserForm = () => {
    const { id } = useParams();
    const updateDate = new Date();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const usuario_id = sessionStorage.getItem("usuario_id");
     const formattedDateTime = `${updateDate.toLocaleDateString('pt-BR')} ${updateDate.toLocaleTimeString('pt-BR')}`;

    const createUserFormSchema = z.object({
        nomeCompleto: z.string()
            .nonempty("O nome é obrigatório")
            .min(3, "O nome precisa de no mínimo 3 caracteres")
            .transform(name => {
                return name.trim().split(' ').map(word => {
                    return word[0].toLocaleUpperCase().concat(word.substring(1));
                }).join(' ');
            }),

        email: z.string()
            .toLowerCase()
            .nonempty("O e-mail é obrigatório")
            .email('Formato de e-mail inválido'),

        senha: z.string()
            .max(64, "A senha não pode ultrapassar 64 caracteres"),

        confirmarSenha: z.string()
            .max(64, "A senha não pode ultrapassar 64 caracteres"),
    }).refine(data => data.senha === data.confirmarSenha, {
        message: "As senhas não conferem",
        path: ["confirmarSenha"]
    });

    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
        resolver: zodResolver(createUserFormSchema),
    });

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
        }
    };

    const editUsuario = (data) => {
        setLoading(true);
        api.put(`/editar/usuario/${id}`, {
            nomeCompleto: data.nomeCompleto,
            senha: data.senha,
            dataUpdate: formattedDateTime,
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(function() {
            enqueueSnackbar("Cadastro editado com sucesso!", { variant: "success", anchorOrigin: { vertical: "bottom", horizontal: "right", preventDuplicate: true }});
            navigate('/usuario');
        }).catch(function(error) {
            if (api.isAxiosError(error)) {
                if (error.response) {
                    enqueueSnackbar(`Erro ${error.response.status}: ${error.response.data.message}`, { variant: "error", anchorOrigin: { vertical: "bottom", horizontal: "right", preventDuplicate: true } });
                } else if (error.request) {
                    enqueueSnackbar("Erro de rede: Servidor não respondeu", { variant: "warning", anchorOrigin: { vertical: "bottom", horizontal: "right", preventDuplicate: true } });
                } else {
                    enqueueSnackbar("Erro desconhecido: " + error.message, { variant: "error", anchorOrigin: { vertical: "bottom", horizontal: "right", preventDuplicate: true } });
                }
            } else {
                enqueueSnackbar("Erro inesperado", { variant: "error", preventDuplicate: true });
            }
        })
        .finally(function() {
            setLoading(false);
        });
    };

    useEffect(() => {
    if (id) {
        api.get(`usuario/${usuario_id}`)
            .then((response) => {
                const usuario = response.data;
                reset({
                    nomeCompleto: usuario.nomeCompleto,
                    email: usuario.email,
                    dataUpdate: usuario.dataUpdate
                });
            })
            .catch((error) => 
                {enqueueSnackbar(`Erro ao carregar usuário : ${error}`, {variant: "error",anchorOrigin: { vertical: "bottom", horizontal: "right", preventDuplicate: true },
            });
        });
    }
    }, []) 

  const dataAlteracaoField = watch("dataUpdate");

    return (
        <section className={styled.appContainer}>
            <HeaderForm title={"Editar Usuário"} />
            <form onSubmit={handleSubmit(editUsuario)} onKeyDown={handleKeyDown} autoComplete="off">
                <div className={styled.row}>
                    <InputField
                        obrigatorio
                        idInput="nomeCompleto"
                        idDiv={styled.fullNameField}
                        label="Nome Completo"
                        type="text"
                        register={register}
                        error={errors?.nomeCompleto}
                    />
                    <InputField
                        obrigatorio
                        idInput="email"
                        readOnly
                        idDiv={styled.emailField}
                        label="E-mail"
                        type="email"
                        register={register}
                        error={errors?.email}
                    />
                </div>

                <div className={styled.row}>
                    <InputPassword
                        idInput="senha"
                        idDiv={styled.passwordField}
                        label="Senha (Se não quiser alterar a senha, deixe  em branco)"
                        type="password"
                        autoComplete="new-password"
                        register={register}
                        error={errors?.senha}
                    />
                    <InputPassword
                        idInput="confirmarSenha"
                        idDiv={styled.confirmPasswordField}
                        label="Confirme a Senha"
                        type="password"
                        register={register}
                        autoComplete="new-password"
                        error={errors?.confirmarSenha}
                    />
                </div>
                <FooterForm title={loading ? "Editando..." : "Editar"} updateDateField={dataAlteracaoField} disabled={loading}/>
            </form>
        </section>
    );
}

export default UserForm;