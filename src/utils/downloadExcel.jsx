import * as XLSX from 'xlsx';

export const downloadExcel = (nomeLista, lista, enqueueSnackbar) => {
    if (lista.length > 0) {
        const today = new Date().getDate();
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();
        const ws = XLSX.utils.json_to_sheet(lista);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Registros');
        XLSX.writeFile(wb, `${nomeLista}_${today}_${month}_${year}.xlsx`);
    } else {
        enqueueSnackbar('Nenhum registro encontrado', { variant: 'info', anchorOrigin: { vertical: "bottom", horizontal: "right" } });
    }
};   