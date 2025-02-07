import Image from 'next/image';
import arrowIcon from '@/../../Public/assets/arrowIcon.svg';

export interface getDashboardsProps {
	page: number;
	cursorId: number;
	size: number;
	navigationMethod: 'infiniteScroll' | 'pagination';
}

function PaginationButton({
	paginationPage,
	setPaginationPage,
	totalCount,
}: {
	paginationPage: number;
	setPaginationPage: React.Dispatch<React.SetStateAction<number>>;
	totalCount: string;
}) {
	const handleHover = (e: React.MouseEvent<HTMLDivElement>) => {
		e.currentTarget.style.filter = 'invert(0%)';
	};

	const handleLeave = (e: React.MouseEvent<HTMLDivElement>) => {
		e.currentTarget.style.filter = 'invert(100%)';
	};

	const handlePreviousPage = () => {
		if (paginationPage > 1) {
			setPaginationPage(paginationPage - 1);
		}
	};

	const totalPages = Math.ceil(+totalCount / 5);
	const handleNextPage = () => {
		if (paginationPage < totalPages) {
			setPaginationPage(paginationPage + 1);
		}
	};

	return (
		<div className='flex items-center justify-end gap-[1.6rem]'>
			<div className='text-14-500 text-black-3  sm:text-12-500'>
				{totalPages} 페이지중 {paginationPage}
			</div>
			<div className='flex'>
				<button
					onClick={() => handlePreviousPage()}
					className='flex h-[4rem] w-[4rem] items-center justify-center rounded-l-lg border border-gray-D bg-white sm:h-[3.6rem] sm:w-[3.6rem]'
				>
					<Image
						onMouseEnter={handleHover}
						onMouseLeave={handleLeave}
						style={{ filter: 'invert(100%)' }}
						className='scale-x-[-1] transform'
						src={arrowIcon}
						alt='화살표 아이콘'
					/>
				</button>
				<button
					onClick={() => handleNextPage()}
					className='flex h-[4rem] w-[4rem] scale-x-[-1] transform items-center justify-center rounded-l-lg border border-gray-D bg-white sm:h-[3.6rem] sm:w-[3.6rem]'
				>
					<Image
						onMouseEnter={handleHover}
						onMouseLeave={handleLeave}
						style={{ filter: 'invert(100%)' }}
						className='scale-x-[-1] transform'
						src={arrowIcon}
						alt='화살표 아이콘'
					/>
				</button>
			</div>
		</div>
	);
}

export default PaginationButton;
