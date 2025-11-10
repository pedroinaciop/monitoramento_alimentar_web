import { Modal } from 'antd';
import api from '../services/api';

export const confirmDelete = (id, setList, path, enqueueSnackbar) => {
    Modal.confirm({
        title: "Confirmar exclusão",
        content: "Tem certeza que deseja deletar esse registro?",
        okText: "Sim",
        okType: "danger",
        cancelText: "Não",
        onOk: () => deleteRegistro(id, setList, path, enqueueSnackbar),
    });
};

const deleteRegistro = (id, setList, path, enqueueSnackbar) => {
    api.delete(`${path}${id}`)
        .then(() => {
            setList((prev) => prev.filter((item) => item.id !== id));
            enqueueSnackbar("Deletado com sucesso!", { 
                variant: "success", 
                anchorOrigin: { vertical: "bottom", horizontal: "right" } 
            });
        });
};