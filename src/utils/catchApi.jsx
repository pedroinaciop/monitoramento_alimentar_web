import api from '../services/api';

export function handleApiError(error, enqueueSnackbar) {
  if (api.isAxiosError(error)) {
    const msg = error.response?.data?.message || "Erro ao processar requisição";
    enqueueSnackbar(`Erro ${error.response?.status || ""}: ${msg}`, { variant: "error" });
  } else {
    enqueueSnackbar("Erro inesperado", { variant: "error" });
  }
}