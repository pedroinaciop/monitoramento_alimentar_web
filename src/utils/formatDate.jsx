//Retorno data no formato (dd/mm/yyyy)
export function formatDateToBrazilian(data, daysToAdd = 0) {
  if (!data) return "";

  if (typeof data === "string" && data.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    return data;
  }

  const dateObj = new Date(data);
  dateObj.setDate(dateObj.getDate() + Number(daysToAdd));
  if (isNaN(dateObj.getTime())) return "";

  return dateObj.toLocaleDateString("pt-BR");
}

// Retorna data no formato (yyyy-mm-dd)
export function formatDateToISODate(data, daysToAdd = 0, daysToDelete = 0) {
  if (!data) return "";

  let dateObj;

  if (typeof data === "string" && data.includes("/")) {
    const [dia, mes, ano] = data.split("/");
    dateObj = new Date(`${ano}-${mes}-${dia}T00:00:00`);
  } else {
    dateObj = new Date(data);
  }

  if (isNaN(dateObj.getTime())) return "";

  if (daysToDelete > 0) {
    dateObj.setDate(dateObj.getDate() - Number(daysToDelete));
  }
  dateObj.setDate(dateObj.getDate() + Number(daysToAdd));

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

//Retorno data no formato (dd/mm/yyyy HH:mm)
export function formatDateTimeToBrazilian(data, daysToAdd = 0) {
   if (!data) return "";

  const dateObj = new Date(data);
  dateObj.setDate(dateObj.getDate() + Number(daysToAdd));

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  const hours = String(dateObj.getHours()).padStart(2, "0");
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

//Retorno data no formato (yyyy-mm-ddTHH:mm)
export function formatDateTimeToISO(data, daysToAdd = 0) {
   if (!data) return "";

  const dateObj = new Date(data);
  dateObj.setDate(dateObj.getDate() + Number(daysToAdd));

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  const hours = String(dateObj.getHours()).padStart(2, "0");
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

//Retorno data no formato (yyyy-mm-ddHH:mm)
export function parseBrazilianDateTimeToISO(data, hoursToDelete = 0) {
  if (!data) return "";

  const [datePart, timePart] = data.split(" ");
  const [day, month, year] = datePart.split("/").map(Number);
  const [hours, minutes] = timePart ? timePart.split(":").map(Number) : [0, 0];

  const dateObj = new Date(year, month - 1, day, hours, minutes);
  dateObj.setHours(dateObj.getHours() - Number(hoursToDelete));

  const formatted = dateObj.toISOString().slice(0, 16);
  return formatted;
}

//Retorno data no formato (dd-yyyy-mm)
export function formatDateToInverted(data, daysToAdd = 0) {
  if (!data) return "";

  const dateObj = new Date(data);
  dateObj.setDate(dateObj.getDate() + Number(daysToAdd));

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");


  return `${day}-${year}-${month}`;
}