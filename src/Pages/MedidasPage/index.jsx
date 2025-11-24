import { DownloadOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { downloadExcel } from "../../utils/downloadExcel";
import { NavLink, useNavigate } from "react-router-dom";
import { ConfigProvider, Input, Button, Grid, Modal } from "antd";
import styled from "./MedidasPage.module.css";
import ProTable from "@ant-design/pro-table";
import { useState, useEffect } from "react";
import ptBR from "antd/lib/locale/pt_BR";
import { useSnackbar } from "notistack";
import api from "../../services/api";

const deleteRegistro = async (id, setList, path, enqueueSnackbar) => {
  try {
    await api.delete(`${path}${id}`);
    setList((prev) => prev.filter((item) => item.id !== id));
    enqueueSnackbar("Deletado com sucesso!", { 
      variant: "success", 
      anchorOrigin: { vertical: "bottom", horizontal: "right", preventDuplicate: true } 
    });
  } catch (error) {
    enqueueSnackbar(error, "Erro ao deletar registro!", { 
      variant: "error", 
      anchorOrigin: { vertical: "bottom", horizontal: "right", preventDuplicate: true } 
    });
  }
};

const MedidasPage = () => {
  const { useBreakpoint } = Grid;
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const { enqueueSnackbar } = useSnackbar();
  const [medidas, setMedidas] = useState([]);
  const [keywords, setKeywords] = useState("");
  const [modal, contextHolder] = Modal.useModal();
  const usuario_id = sessionStorage.getItem("usuario_id");

  const handleConfirmDelete = (id, setList, path, enqueueSnackbar) => {
    modal.confirm({
      title: "Confirmar exclusão",
      content: "Tem certeza que deseja deletar esse registro?",
      okText: "Sim",
      okType: "danger",
      cancelText: "Não",
      onOk: () => deleteRegistro(id, setList, path, enqueueSnackbar),
    });
  };

  const columns = [
    { title: "DATA DE REGISTRO", dataIndex: "dataRegistro", width: screens.sm ? 200 : 155},
    { title: "PESO ATUAL", dataIndex: "pesoAtual", responsive: ['sm']},
    { title: "PESO DESEJADO", dataIndex: "pesoDesejado", responsive: ['sm']},
    { title: "ALTURA", dataIndex: "altura", responsive: ['lg']},
    {
            title: 'AÇÕES',
            render: (_, row) => (
                screens.md ? (
                    <div className={styled.botoesGrid}>
                    <Button key="editar" onClick={() => navigate(`/editar/medidas/${row.id}`)} icon={<EditOutlined />}>Editar</Button>
                    <Button key="deletar" onClick={() => handleConfirmDelete(row.id, setMedidas, "/medida/", enqueueSnackbar)} icon={<DeleteOutlined />}>Deletar</Button>
                    </div>
                ) : (
                    <div className={styled.botoesGrid}>
                      <Button key="editar" onClick={() => navigate(`/editar/medidas/${row.id}`)} icon={<EditOutlined />}></Button>
                      <Button key="deletar" onClick={() => handleConfirmDelete(row.id, setMedidas, "/medida/", enqueueSnackbar)} icon={<DeleteOutlined />}></Button>
                    </div>
                )
                
            ), 
        },
  ];

  const filterData = (data, keywords) => {
    if (!keywords) return data;

    return data.filter(
      (item) =>
        item.dataRegistro?.toLowerCase().includes(keywords.toLowerCase()) ||
        item.pesoAtual?.toLowerCase().includes(keywords.toLowerCase())
    );
  };

  useEffect(() => {
    api.get(`/medidas/${usuario_id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then(function (resposta) {
        setMedidas(resposta.data);
      })
      .catch(function (error) {
        console.error("Erro:", error);
      });
  }, [usuario_id]);

  return (
    <>
      <section className={styled.mainContent}>
        <header className={styled.header}>
          <h1>Medidas</h1>
          <p>{medidas.length} Registro(s) encontrado(s)</p>
        </header>
        <div className={styled.functions}>
          <Input.Search 
            style={{
              display: screens.xl ? "block" : "none"
             }}
            className={styled.input} 
            placeholder="Procure um registro" 
            onSearch={(value) => setKeywords(value)}
          />
          <div className={styled.buttons}>
            <Button className={styled.button} type="primary" icon={<DownloadOutlined />} size="large" onClick={() => downloadExcel("medidas", medidas, enqueueSnackbar)}>
              Baixar Dados
            </Button>
            <NavLink to={"novo"}>
              <Button className={styled.button} type="primary" icon={<PlusOutlined />} size="large">
                Registro
              </Button>
            </NavLink>
          </div>
        </div>
      </section>
      <ConfigProvider locale={ptBR}>
        {contextHolder}
        <ProTable
          rowKey="id"
          size="large"
          search={false}
          bordered={true}
          columns={columns}
          dataSource={filterData(medidas, keywords)}
          params={{ keywords }}
          pagination={{
            pageSize: 5,
            showQuickJumper: true,
          }}
        />
      </ConfigProvider>
    </>
  );
};

export default MedidasPage;