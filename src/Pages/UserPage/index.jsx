import { EditOutlined } from '@ant-design/icons';
import { ConfigProvider, Button } from 'antd';
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import ProTable from '@ant-design/pro-table';
import styled from './UserPage.module.css';
import ptBR from 'antd/lib/locale/pt_BR';
import api from '../../services/api';
import { Grid } from "antd";

const UserPage = () => {
    const navigate = useNavigate();
    const usuario_id = sessionStorage.getItem("usuario_id");
    const [keywords, setKeywords] = useState('');
    const [users, setUsers] = useState([]);
    const { useBreakpoint } = Grid;
    const screens = useBreakpoint();

    const columns = [
        { title: "DATA DE REGISTRO", dataIndex: "dataCriacao", width: screens.sm ? 200 : 155},
        { title: 'NOME COMPLETO', dataIndex: 'nomeCompleto', responsive: ['sm']},
        { title: 'EMAIL', dataIndex: 'email', responsive: ['sm']},
        {
            title: 'AÇÕES',
            render: (_, row) => (
                screens.md ? (
                    <div className={styled.botoesGrid}>
                        <Button key="editar" onClick={() => navigate(`/editar/usuario/${usuario_id}`)} icon={<EditOutlined />}>Editar</Button>
                    </div>
                ) : (
                    <div className={styled.botoesGrid}>
                         <Button key="editar" onClick={() => navigate(`/editar/usuario/${usuario_id}`)} icon={<EditOutlined />}></Button>
                    </div>
                )
                
            ), 
        },
    ];

    useEffect(() => {
        api.get(`/usuario/${usuario_id}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(function (resposta) {
            setUsers(resposta.data);
        })
        .catch(function (error) {
            console.error("Erro:", error);
        });
    }, [usuario_id])

    return (
        <>
            <section className={styled.mainContent}>
                <header className={styled.header}>
                    <h1>Minha Conta</h1>
                    <p>1 Registro(s) encontrado(s)</p>
                </header>
            </section>
            <ConfigProvider locale={ptBR}>
                <ProTable
                    rowKey="usuario_id"
                    size="large"
                    search={false}
                    bordered={true}
                    columns={columns}
                    dataSource={users ? [users] : []}
                    params={{ keywords }}
                    pagination={{
                        pageSize: 1,
                        showQuickJumper: true,
                    }}
                />
            </ConfigProvider>
        </>
    );
}

export default UserPage;