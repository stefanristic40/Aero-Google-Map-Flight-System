export const formatDateHM = (date) => {
  const newDate = new Date(date);
  const options = {
    hour: "2-digit",
    minute: "2-digit",
  };
  return newDate.toLocaleTimeString("en-US", options);
};
