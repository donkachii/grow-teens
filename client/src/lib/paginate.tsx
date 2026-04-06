export const usePaginate = (
    {
    total,
    page,
    limit,
    }: {total: number, page: number, limit: number}
) => {
    const getPaginationInfo = () => {
      const startItem = (page - 1) * limit + 1;
      const endItem = Math.min(page * limit, total);
      const paginationText = `${startItem} to ${endItem || 0} of ${total || 0}`;
      return paginationText;
    };
    return {
      getPaginationInfo,
    };
  };