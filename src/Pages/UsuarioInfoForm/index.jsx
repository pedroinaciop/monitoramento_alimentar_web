import { alergiasOptions, doencasPreExistentesOptions, intoleranciasOptions, nivelAtividadeFisicaOptions, sexoBiologicoOptions, caracteristicaAlimentarOptions } from '../../utils/options';
import { formatDateToISODate } from '../../utils/formatDate';
import { useNavigate, useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import HeaderForm from '../../Components/HeaderForm';
import SelectField from '../../Components/SelectInput'
import FooterForm from '../../Components/FooterForm';
import InputField from '../../Components/InputField';
import styled from './UsuarioInfoForm.module.css';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import api from '../../services/api';
import { useMemo } from 'react';
import { z } from 'zod';

const UsuarioInfoForm = () => {
    const { id } = useParams();
    const updateDate = new Date();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const usuario_id = sessionStorage.getItem("usuario_id");
    const [loading, setLoading] = useState(false);
    const formattedDateTime = `${updateDate.toLocaleDateString('pt-BR')} ${updateDate.toLocaleTimeString('pt-BR')}`;

    const createUserFormSchema = z.object({
        dataNascimento: z.coerce.date({
            invalid_type_error: "Data inválida",
        }).refine((d) => d <= new Date(), { message: "A data não pode ser no futuro" }),

        idade: z.string(),

        sexoBiologico: z.enum(['Masculino', 'Feminino', 'Não especificar'], {
            errorMap: () => ({ message: "Campo obrigatório" })
        }),  
        
        objetivo: z.string()
            .max(255, "O objetivo não pode ultrapassar 255 caracteres")
            .nonempty("Campo obrigatório"),

        nivelAtividadeFisica: z.enum(['Sedentário', 'Leve', 'Moderado', 'Intenso'], {
            errorMap: () => ({ message: "Campo obrigatório" })
        }),

        caracteristicaAlimentar: z.enum(['Vegetariano', 'Vegano', 'Pescetariano', 'Onívoro', 'Ovolactovegetariano'], {
            errorMap: () => ({ message: "Campo obrigatório" })
        }),

        alergias: z.array(z.string())
            .optional(),

        intolerancias: z.array(z.string())
            .optional(),

        doencasPreExistentes: z.array(z.string())
            .optional(),
    });

    const { control, register, handleSubmit, formState: { errors }, watch, reset, setValue } = useForm({
        resolver: zodResolver(createUserFormSchema),
    });

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
        }
    };

    const idadeCalculada = useMemo(() => {
        const dataNascimento = watch("dataNascimento");
        if (!dataNascimento) return 0;

        const nasc = new Date(dataNascimento);
        const hoje = new Date();
        let idade = hoje.getFullYear() - nasc.getFullYear();
        if (
            hoje.getMonth() < nasc.getMonth() ||
            (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate())
        ) idade--;

        return idade;
    }, [watch("dataNascimento")]);
    useEffect(() => setValue("idade", idadeCalculada), [idadeCalculada, setValue]);

    const editInfoUsuario = (data) => {
        setLoading(true);
        api.put(`/editar/info/usuarios/${id}`, {
            dataNascimento: formatDateToISODate(data.dataNascimento, 1),
            idade: data.idade,
            sexoBiologico: data.sexoBiologico,
            nivelAtividadeFisica: data.nivelAtividadeFisica,
            objetivo: data.objetivo,
            caracteristicaAlimentar: data.caracteristicaAlimentar,
            alergias: (data.alergias && data.alergias.length > 0) ? data.alergias.join(", ") : 'Sem alergias',
            doencasPreExistentes: (data.doencasPreExistentes && data.doencasPreExistentes.length > 0) ? data.doencasPreExistentes.join(", ") : 'Sem doenças pré-existentes',
            intolerancias: (data.intolerancias && data.intolerancias.length > 0) ? data.intolerancias.join(", ") : 'Sem intolerâncias',
            dataAlteracao: formattedDateTime
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(function() {
            enqueueSnackbar("Cadastro editado com sucesso!", { variant: "success", anchorOrigin: { vertical: "bottom", horizontal: "right", preventDuplicate: true }});
            navigate('/info/usuario');
        }).catch(function(error) {
            if (api.isAxiosError(error)) {
                if (error.response) {
                    enqueueSnackbar(`Erro ${error.response.status}: ${error.response.data.message}`, { variant: "error", anchorOrigin: { vertical: "bottom", horizontal: "right", preventDuplicate: true }});
                } else if (error.request) {
                    enqueueSnackbar("Erro de rede: Servidor não respondeu", { variant: "warning", anchorOrigin: { vertical: "bottom", horizontal: "right", preventDuplicate: true } });
                } else {
                    enqueueSnackbar("Erro desconhecido: " + error.message, { variant: "error", anchorOrigin: { vertical: "bottom", horizontal: "right", preventDuplicate: true } });
                }
            } else {
                enqueueSnackbar("Erro inesperado", { variant: "error", preventDuplicate: true });
            }
        }).finally(function() {
            setLoading(false);
        })
    };

    const createInfoUser = (data) => {
        setLoading(true);
        api.post('cadastros/info/usuarios/novo', {
            dataRegistro: formattedDateTime,
            dataNascimento: formatDateToISODate(data.dataNascimento, 1),
            idade: data.idade,
            sexoBiologico: data.sexoBiologico,
            nivelAtividadeFisica: data.nivelAtividadeFisica,
            objetivo: data.objetivo,
            caracteristicaAlimentar: data.caracteristicaAlimentar,
            alergias: (data.alergias && data.alergias.length > 0) ? data.alergias.join(", ") : 'Sem alergias',
            doencasPreExistentes: (data.doencasPreExistentes && data.doencasPreExistentes.length > 0) ? data.doencasPreExistentes.join(", ") : 'Sem doenças pré-existentes',
            intolerancias: (data.intolerancias && data.intolerancias.length > 0) ? data.intolerancias.join(", ") : 'Sem intolerâncias',
            usuario: {
                id: usuario_id
            }
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(function () {
            enqueueSnackbar("Cadastro realizado com sucesso!", { variant: "success", anchorOrigin: { vertical: "bottom", horizontal: "right", preventDuplicate: true }});
            navigate('/info/usuario/')
        })
        .catch(function (error) {
            if (api.isAxiosError(error)) {
                if (error.response) {
                    enqueueSnackbar(`Erro ${error.response.status}: ${error.response.data.message}`, { variant: "error", preventDuplicate: true });
                } else if (error.request) {
                    enqueueSnackbar("Erro de rede: Servidor não respondeu", { variant: "warning", preventDuplicate: true });
                } else {
                    enqueueSnackbar("Erro desconhecido: " + error.message, { variant: "error", preventDuplicate: true });
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
            api.get(`info/usuarios/${usuario_id}`)
                .then(response => {
                    const infoUser = response.data;
                    const parseToArray = (field) => {
                        if (!field) return [];
                        if (typeof field === "string") {
                            if (field.startsWith("Sem ")) return [];
                            return field.split(",").map(item => item.trim());
                        }
                        return field;
                    };

                    reset({
                        dataRegistro: infoUser.dataRegistro,
                        dataNascimento: formatDateToISODate(infoUser.dataNascimento, 1),
                        idade: infoUser.idade,
                        sexoBiologico: infoUser.sexoBiologico,
                        nivelAtividadeFisica: infoUser.nivelAtividadeFisica,
                        objetivo: infoUser.objetivo,
                        alergias: parseToArray(infoUser.alergias),
                        intolerancias: parseToArray(infoUser.intolerancias),
                        doencasPreExistentes: parseToArray(infoUser.doencasPreExistentes),
                        caracteristicaAlimentar: infoUser.caracteristicaAlimentar,
                        dataAlteracao: infoUser.dataAlteracao,
                    });
                })
                .catch(error => {
                    enqueueSnackbar(error, "Erro ao carregar categoria", { variant: "error", anchorOrigin: { vertical: "bottom", horizontal: "right", preventDuplicate: true }});
                })
            }
    }, []);

    const dataAlteracaoField = watch("dataAlteracao");
    const dataRegistroField = watch("dataRegistro");

    return (
        <section className={styled.appContainer}>
            <HeaderForm title={"Minhas Informações"} />
            <form onSubmit={id ? handleSubmit(editInfoUsuario) : handleSubmit(createInfoUser)} onKeyDown={handleKeyDown} autoComplete="off">
                <section className={styled.contextForm}>
                    <div className={styled.row}>
                        <InputField
                            idInput="dataNascimento"
                            autoFocus
                            idDiv={styled.dataNascimentoCampo}
                            label="Data de Nascimento"
                            obrigatorio={true}
                            type="date"
                            register={register}
                            error={errors.dataNascimento}
                        />

                        <InputField
                            idInput="idade"
                            idDiv={styled.idadeCampo}
                            label="Idade"
                            type="number"
                            readOnly                                                
                            {...register("idade")}
                        />

                        <SelectField
                            id={styled.sexoBiologicoCampo}
                            name="sexoBiologico"
                            label="Sexo Biológico"
                            control={control}
                            options={sexoBiologicoOptions}
                            placeholder="Selecione uma opção"
                            required
                            error={errors.sexoBiologico}
                        />
                    </div>

                    <div className={styled.row}>
                        <SelectField
                            id={styled.doencasPreExistentesCampo}
                            mode="multiple"
                            name="doencasPreExistentes"
                            label="Doenças Pré-Existentes"
                            control={control}
                            options={doencasPreExistentesOptions}
                            placeholder="Selecione uma opção"
                            required
                            error={errors.doencasPreExistentes}
                        />

                        <SelectField
                            id={styled.alergiasCampo}
                            mode="multiple"
                            name="alergias"
                            label="Alergias"
                            control={control}
                            options={alergiasOptions}
                            placeholder="Selecione uma opção"
                            required
                            error={errors.alergias}
                        />

                        <SelectField
                            id={styled.intoleranciasCampo}
                            mode="multiple"
                            name="intolerancias"
                            label="Intolerâncias"
                            control={control}
                            options={intoleranciasOptions}
                            placeholder="Selecione uma opção"
                            required
                            error={errors.intolerancias}
                        />
                    </div>

                    <div className={styled.row}>
                        <SelectField
                            id={styled.nivelAtividadeFisicaCampo}
                            name="nivelAtividadeFisica"
                            label="Nível de Atividade Física"
                            control={control}
                            options={nivelAtividadeFisicaOptions}
                            placeholder="Selecione uma opção"
                            required
                            error={errors.nivelAtividadeFisica}
                        />

                        <SelectField
                            id={styled.caracteristicaAlimentarCampo}
                            name="caracteristicaAlimentar"
                            label="Característica Alimentar"
                            control={control}
                            options={caracteristicaAlimentarOptions}
                            placeholder="Selecione uma opção"
                            error={errors.caracteristicaAlimentar}
                        />
                    </div>
                    <div className={styled.row}> 
                        <InputField
                            idInput="objetivo"
                            idDiv={styled.objetivoCampo}
                            label="Objetivo"
                            type="text"
                            obrigatorio={true}
                            register={register}
                            error={errors.objetivo}
                        />
                    </div>
                </section>
                <FooterForm title={ id ? (loading ? "Editando..." : "Editar") : (loading ? "Cadastrando..." : "Cadastrar")} includeDateField={dataRegistroField} updateDateField={dataAlteracaoField} disabled={loading}/>
            </form>
        </section>
    );
}

export default UsuarioInfoForm;