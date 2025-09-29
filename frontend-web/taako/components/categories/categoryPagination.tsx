interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function CategoryPagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisible - 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex gap-5 justify-center items-center">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${currentPage === 1 ? 'text-[#a5a5a5] cursor-not-allowed' : 'text-black hover:text-blue-500 cursor-pointer'}`}
      >
        {`<`}
      </button>

      <ul className="flex gap-4">
        {visiblePages.map((page) => (
          <li
            key={page}
            onClick={() => onPageChange(page)}
            className={`cursor-pointer ${page === currentPage
                ? 'text-black font-bold'
                : 'text-[#a5a5a5] hover:text-blue-500'
              }`}
          >
            {page}
          </li>
        ))}
      </ul>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${currentPage === totalPages ? 'text-[#a5a5a5] cursor-not-allowed' : 'text-black hover:text-blue-500 cursor-pointer'}`}
      >
        {`>`}
      </button>
    </div>
  );
}
