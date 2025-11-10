import { DownloadOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ConfigProvider, Input, Button } from 'antd';
import { NavLink, useNavigate } from 'react-router-dom';
import { confirmDelete } from '../../utils/delete';
import styled from './UsuarioInfoPage.module.css';
import { downloadExcel } from '../../utils/downloadExcel';
import ProTable from '@ant-design/pro-table';
import { useState, useEffect } from 'react';
import ptBR from 'antd/lib/locale/pt_BR';
import { useSnackbar } from 'notistack';
import api from '../../services/api';

const UsuarioInfoPage = () => {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [keywords, setKeywords] = useState('');
    const [userInfo, setUserInfo] = useState([]);
    const usuario_id = sessionStorage.getItem("usuario_id");

    const filterData = (data, keywords) => {
        if (!keywords) return data;
    
        return data.filter((item) =>
            item.dataRegistro?.toLowerCase().includes(keywords.toLowerCase()) 
        );
    };     

    const columns = [
        { title: 'DATA DE REGISTRO', dataIndex: 'dataRegistro', width: 200},
        { title: 'IDADE', dataIndex: 'idade'},
        { title: 'GÊNERO', dataIndex: 'sexoBiologico'},
        { title: 'NÍVEL ATIVIDADE FÍSICA', dataIndex: 'nivelAtividadeFisica'},
        {
            title: 'EDITAR',
            width: 140,
            render: (_, row) => (
                <Button key="editar" onClick={() => navigate(`/editar/info/usuario/${row.id}`)} icon={<EditOutlined />}>
                    Editar
                </Button>
            ), 
        },
        {
            title: 'DELETAR',
            width: 140,
            render: (_, row) => (
               <Button key="deletar" onClick={() => confirmDelete(row.id, setUserInfo, "/info/usuarios/", enqueueSnackbar)} icon={<DeleteOutlined />}>
                    Deletar
                </Button>
            ),
        },
    ];

    useEffect(() => {
        api.get(`info/usuarios/${usuario_id}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(function (resposta) {
                const data = Array.isArray(resposta.data) ? resposta.data : [resposta.data];
                if (data.length === null || data.length === 0 || resposta.data === "") {
                    setUserInfo([]);
                } else {
                    setUserInfo(data);
                }
            })
            .catch(function (error) {
                console.error("Erro:", error);
            });
    }, [usuario_id])

    return (
        <>
            <section className={styled.mainContent}>
                <header className={styled.header}>
                    <h1>Minhas Informações</h1>
                    <p>{userInfo.length} Registro(s) encontrado(s)</p>
                </header>
                <div className={styled.functions}>
                    <Input.Search
                        className={styled.input}
                        placeholder="Procure um registro"
                        onSearch={(value) => setKeywords(value)}
                    />
                    <div className={styled.buttons}>
                        <Button className={styled.button} type="primary" icon={<DownloadOutlined />} size="large" onClick={() => downloadExcel('informacao_usuario', userInfo, enqueueSnackbar)}>
                            Baixar Dados
                        </Button>
                        {userInfo.length > 0 ? (
                            <Button className={styled.button} type="primary" icon={<PlusOutlined />} size="large" onClick={() => enqueueSnackbar('Informações já cadastradas. Edite o registro existente para fazer alterações.', { variant: 'info', anchorOrigin: { vertical: "bottom", horizontal: "right" } })}>
                                Registro
                             </Button>
                        ) : (
                            <NavLink to={"novo"}>
                                <Button className={styled.button} type="primary" icon={<PlusOutlined />} size="large" >
                                    Registro
                                </Button>
                            </NavLink>
                        )}
                    </div>
                </div>
            </section>
            <ConfigProvider locale={ptBR}>
                <ProTable
                    rowKey="id"
                    size="large"
                    search={false}
                    bordered={true}
                    columns={columns}
                    dataSource={filterData(userInfo, keywords)}
                    params={{ keywords }}
                    pagination={{
                        pageSize: 5,
                        showQuickJumper: true,
                    }}
                />
            </ConfigProvider>
        </>
    );
}

export default UsuarioInfoPage;