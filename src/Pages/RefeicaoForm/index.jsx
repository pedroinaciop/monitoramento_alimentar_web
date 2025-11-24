import { parseBrazilianDateTimeToISO, formatDateTimeToISO, formatDateTimeToBrazilian } from "../../utils/formatDate";
import { unidadeAlimentoOptions, tipoRefeicaoOptions } from "../../utils/options";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import SelectField from '../../Components/SelectInput';
import { zodResolver } from "@hookform/resolvers/zod";
import { ConfigProvider, Button, Modal, Grid } from "antd";
import HeaderForm from "../../Components/HeaderForm";
import FooterForm from "../../Components/FooterForm";
import InputField from "../../Components/InputField";
import styled from "./RefeicaoForm.module.css";
import ProTable from "@ant-design/pro-table";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import ptBR from "antd/lib/locale/pt_BR";
import { useSnackbar } from "notistack";
import api from "../../services/api";
import { z } from "zod";

const RefeicaoForm = () => {
  const { id } = useParams();
  const updateDate = new Date();
  const { useBreakpoint } = Grid;
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const inputAlimentoRef = useRef(null);
  const [open, setOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [alimentos, setAlimentos] = useState([]);
  const usuarioId = sessionStorage.getItem("usuario_id");
  const [alimentoEditando, setAlimentoEditando] = useState(null);
  const [modal, modalContextHolder] = Modal.useModal();
  const formattedDateTime = `${updateDate.toLocaleDateString('pt-BR')} ${updateDate.toLocaleTimeString('pt-BR')}`;

  const createRefeicaoFormSchema = z.object({
    dataRegistro: z.coerce.date()
    .max(updateDate, "Data futura não permitida")
    .default(new Date()),

    tipoRefeicao: z.enum(["Café da Manhã", "Lanche","Almoço", "Café da Tarde", "Jantar", "Ceia"], {
      errorMap: () => ({ message: "Campo obrigatório" }),
    }),
  });

  const createAlimentoFormSchema = z.object({
    nomeAlimento: z.string().min(1, "Campo obrigatório").max(40, "Máximo de 40 caracteres"),

    unidadeAlimento: z.enum(["Unidade","Miligramas","Gramas", "Quilos", "Mililitros", "Litros", "Copo", "Xícara", "Taça", "Fatia", "Pedaço", "Colher", "Colher de Chá", "Colher de Sopa", "Pitada"], {
      errorMap: () => ({ message: "Campo obrigatório" }),
    }),

    quantidadeAlimento: z.number(),
  });

  const alimentoForm = useForm({
    resolver: zodResolver(createAlimentoFormSchema),
  });

  const { control, register, handleSubmit, formState: { errors },  watch, reset} = useForm({
    resolver: zodResolver(createRefeicaoFormSchema),
  });

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const filterData = (data, keywords) => {
    if (!keywords) return data;
    return data.filter(
      (item) =>
        item.dataRegistro?.toLowerCase().includes(keywords.toLowerCase()) ||
        item.tipoRefeicao?.toLowerCase().includes(keywords.toLowerCase())
    );
  };

  const deleteAlimento = (id) => {
    if (!id) {
      setAlimentos((prev) => prev.filter((item) => item.id !== id));
      enqueueSnackbar("Deletado com sucesso!", { 
        variant: "success",
        anchorOrigin: { vertical: "bottom", horizontal: "right", preventDuplicate: true }
      });
      return;
    } else {
      api.delete(`/alimento/${id}`).then(() => {
        setAlimentos((prev) => prev.filter((item) => item.id !== id));
        enqueueSnackbar("Deletado com sucesso!", {
          variant: "success",
          anchorOrigin: { vertical: "bottom", horizontal: "right", preventDuplicate: true },
        });
      }).catch(() => {
        enqueueSnackbar("Erro ao deletar alimento", {
          variant: "error",
          anchorOrigin: { vertical: "bottom", horizontal: "right", preventDuplicate: true},
        });
      });
    }
  };

  const handleConfirmDelete = (id) => {
    modal.confirm({
      title: "Confirmar exclusão",
      content: "Tem certeza que deseja deletar esse alimento?",
      okText: "Sim",
      okType: "danger",
      cancelText: "Não",
      onOk: () => deleteAlimento(id),
    });
  };

  const columns = [
    { title: "NOME", dataIndex: "nomeAlimento", width: 200 },
    { title: "QUANT.", dataIndex: "quantidadeAlimento" },
    { title: "UNIDADE ALIMENTO", dataIndex: "unidadeAlimento", responsive: ['sm']},
    {
        title: 'AÇÕES',
        render: (_, row) => (
            screens.md ? (
                <div className={styled.botoesGrid}>
                  <Button key="editar" onClick={() => editAlimento(row.id)} icon={<EditOutlined />}>Editar</Button> 
                  <Button key="deletar" onClick={() => handleConfirmDelete(row.id)} icon={<DeleteOutlined />}>Deletar</Button>
                </div>
            ) : (
                <div className={styled.botoesGrid}>
                  <Button key="editar" onClick={() => editAlimento(row.id)} icon={<EditOutlined />} /> 
                  <Button key="deletar" onClick={() => handleConfirmDelete(row.id)} icon={<DeleteOutlined />} />
                </div>
            )
        ), 
    },
  ];

  const handleCancel = () => {
    setOpen(false);
    setAlimentoEditando(null);
    alimentoForm.reset();
    inputAlimentoRef.current?.blur();
  };

  const showModal = () => {
    setOpen(true);
    setAlimentoEditando(null);
    alimentoForm.reset();
  };

  useEffect(() => {
    if (open && inputAlimentoRef.current) {
      setTimeout(() => {
        inputAlimentoRef.current.focus();
      }, 150);
    }
  }, [open]);

  const createRefeicao = (data) => {
    setLoading(true);
    api.post("/cadastro/refeicao/novo", {
          dataRegistro: formatDateTimeToBrazilian(data.dataRegistro),
          tipoRefeicao: data.tipoRefeicao,
          usuario: { 
            id: usuarioId ,
          },
          alimentos: alimentos.map((a) => ({
            nomeAlimento: a.nomeAlimento,
            unidadeAlimento: a.unidadeAlimento,
            quantidadeAlimento: a.quantidadeAlimento,
          })),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then(function () {
        enqueueSnackbar("Cadastro realizado com sucesso!", {
          variant: "success",
          anchorOrigin: { vertical: "bottom", horizontal: "right" , preventDuplicate: true},
        });
        navigate("/refeicao/");
      })
      .catch(function (error) {
        if (api.isAxiosError(error)) {
          if (error.response) {
            enqueueSnackbar(
              `Erro ${error.response.status}: ${error.response.data.message}`,
              { variant: "error", preventDuplicate: true }
            );
          } else if (error.request) {
            enqueueSnackbar("Erro de rede: Servidor não respondeu", {
              variant: "warning", preventDuplicate: true
            });
          } else {
            enqueueSnackbar("Erro desconhecido: " + error.message, {
              variant: "error", preventDuplicate: true
            });
          }
        } else {
          enqueueSnackbar("Erro inesperado", { variant: "error", preventDuplicate: true });
        }
      })
      .finally(function() {
        setLoading(false);
      });
  };

  const editRefeicao = (data) => {
    setLoading(true);
    api.put(`/editar/refeicao/${id}`, {
      id: data.id,
      dataRegistro: formatDateTimeToBrazilian(data.dataRegistro),
      tipoRefeicao: data.tipoRefeicao,
      dataAlteracao: formattedDateTime,
        alimentos: alimentos.map((a) => ({
          id: a.id,
          nomeAlimento: a.nomeAlimento,
          unidadeAlimento: a.unidadeAlimento,
          quantidadeAlimento: a.quantidadeAlimento,
        })),
    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(function() {
        enqueueSnackbar("Cadastro editado com sucesso!", { variant: "success", anchorOrigin: { vertical: "bottom", horizontal: "right", preventDuplicate: true }});
        navigate('/refeicao');
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
    }).finally (function() {
      setLoading(false);
    })
  };

  const editAlimento = (id) => {
    const alimento = alimentos.find((a) => a.id === id);
    setAlimentoEditando(alimento);
    setOpen(true);

    setTimeout(() => {
      alimentoForm.reset(alimento);
      inputAlimentoRef.current?.focus();
    }, 150);
  };

  const handleOk = alimentoForm.handleSubmit((data) => {
    if (alimentoEditando) {
      setAlimentos((prev) =>
        prev.map((a) => (a.id === alimentoEditando.id ? { ...a, ...data } : a))
      );
      setAlimentoEditando(null);
    } else {
      setAlimentos((prev) => [...prev, { ...data, id: Date.now() }]);
    }
    setOpen(false);
    alimentoForm.reset();
  });

  const handleSaveAndContinue = alimentoForm.handleSubmit((data) => {
    if (alimentoEditando) {
      setAlimentos((prev) =>
        prev.map((a) => (a.id === alimentoEditando.id ? { ...a, ...data } : a))
      );
      setAlimentoEditando(null);
    } else {
      setAlimentos((prev) => [...prev, { ...data, id: Date.now() }]);
    }
    alimentoForm.reset();
    inputAlimentoRef.current?.focus();
  });

  useEffect(() => {
    if (id) {
        api.get(`/refeicao/${id}`)
          .then((response) => {
            const refeicao = response.data;
            reset({
              id: refeicao.id,
              dataRegistro: parseBrazilianDateTimeToISO(refeicao.dataRegistro, 3),
              tipoRefeicao: refeicao.tipoRefeicao,
              dataAlteracao: refeicao.dataAlteracao
            });
            setAlimentos(refeicao.alimentos || []);
          })
          .catch((error) => {
            enqueueSnackbar(`Erro ao carregar medidas : ${error}`, {
              variant: "error",
              anchorOrigin: { vertical: "bottom", horizontal: "right", preventDuplicate: true },
            });
          });
      }
  }, [id, reset, enqueueSnackbar]) 

  const dataAlteracaoField = watch("dataAlteracao");

  return (
    <section className={styled.appContainer}>
      <HeaderForm title={"Refeição"} />
      <form
        onSubmit={id ? handleSubmit(editRefeicao) : handleSubmit(createRefeicao)} 
        onKeyDown={handleKeyDown} 
        autoComplete="off"
      >
        <section className={styled.contextForm}>
          <div className={styled.row}>
            <InputField
              obrigatorio
              idInput="dataRegistro"
              autoFocus
              idDiv={styled.dataRegistroCampo}
              label="Data de Registro"
              type="datetime-local"
              register={register}
              defaultValue={formatDateTimeToISO(new Date())}
              readOnly={id ? true : false}
              error={errors.dataRegistro}
            />

            <SelectField
              id={styled.tipoRefeicaoCampo}
              name="tipoRefeicao"
              label="Tipo de Refeição"
              control={control}
              options={tipoRefeicaoOptions}
              placeholder="Selecione uma opção"
              required
              error={errors.tipoRefeicao}
            />
          </div>
          <p className={styled.tituloTabelaAlimentos}>Alimentos</p>

          <div className={styled.tabelaAlimentos}>
            <ConfigProvider locale={ptBR}>
              {modalContextHolder}
              <ProTable
                rowKey="id"
                size="small"
                options={false}
                search={false}
                bordered={true}
                columns={columns}
                dataSource={filterData(alimentos, keywords)}
                params={{ keywords }}
                pagination={{
                  pageSize: 3,
                  showQuickJumper: true,
                }}
              />
            </ConfigProvider>
            <Modal
              keyboard={false}
              destroyOnHidden
              width={800}
              title="Alimento da refeição"
              open={open}
              onOk={handleOk}
              okText="Salvar"
              cancelText="Cancelar"
              onCancel={handleCancel}
              footer={(_, { CancelBtn, OkBtn }) => (
                <>
                  <CancelBtn />
                  <Button onClick={handleSaveAndContinue}>
                    Salvar e Continuar
                  </Button>
                  <OkBtn />
                </>
              )}
            >
              <form onSubmit={alimentoForm.handleSubmit(handleOk)}>
                <div className={styled.rowModal}>
                  <InputField
                    ref={inputAlimentoRef}
                    idInput="nomeAlimento"
                    idDiv={styled.nomeAlimentoCampo}
                    label="Alimento"
                    type="text"
                    maxLength={40}
                    obrigatorio={true}
                    register={alimentoForm.register}
                    error={alimentoForm.formState.errors.nomeAlimento}
                  />

                  <SelectField
                      id={styled.unidadeAlimentoCampo}
                      name="unidadeAlimento"
                      label="Unidade Alimento"
                      control={alimentoForm.control}
                      options={unidadeAlimentoOptions}
                      placeholder="Selecione uma opção"
                      required
                      error={alimentoForm.formState.errors.unidadeAlimento}
                  />

                  <InputField
                    idInput="quantidadeAlimento"
                    idDiv={styled.quantidadeAlimentoCampo}
                    label="Quantidade"
                    type="number"
                    obrigatorio={true}
                    valueAsNumber={true}
                    defaultValue={1}
                    min={1}
                    register={alimentoForm.register}
                    error={alimentoForm.formState.errors.quantidadeAlimento}
                  />
                </div>
              </form>
            </Modal>
            <button className={styled.btnAddAlimento} type="button" onClick={showModal}>
              Adicionar Alimento
            </button>
          </div>
        </section>
        <FooterForm title={id ? ( loading ? "Editando..." : "Editar" ) : (loading ? "Cadastrando..." : "Cadastrar")} updateDateField={dataAlteracaoField} disabled={loading}/>
      </form>
    </section>
  );
};

export default RefeicaoForm;