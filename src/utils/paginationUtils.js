export const getSerialNumber = (rowIndex, currentPage = 1, pageSize = 10) => {
  const page = Math.max(1, Number(currentPage) || 1);
  const limit = Math.max(1, Number(pageSize) || 10);
  return (page - 1) * limit + rowIndex + 1;
};
