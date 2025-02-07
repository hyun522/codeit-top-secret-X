import { CardData } from '@/constants/types';
import Layout from './Layout';
import { format } from 'date-fns';
import Image from 'next/image';
import { useForm, SubmitHandler, Controller, FieldErrors } from 'react-hook-form';
import FormInput from '@/components/common/Input/FormInput';
import DatePicker from 'react-datepicker';
import addIcon from '@/../../Public/assets/addIcon.svg';
import 'react-datepicker/dist/react-datepicker.css';
import Button from '@/components/common/Buttons/Button';
import TagInput from '@/components/common/Input/TagInput';
import DropDownManager from '@/components/dropdown/DropDownManager';
import { CardItemPost } from '@/constants/types';
import { postCardImage, putCardItem } from '@/lib/api';
import { ChangeEvent, Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/router';
import DropDownProgress from '../dropdown/DropDownProgress';
import { useDashboardContext } from '@/context/DashboardContext';

export interface FormValue extends Omit<CardItemPost, 'dueDate'> {
	dueDate: Date;
}

const RULES = {
	title: {
		required: '필수값 입니다.',
		maxLength: { value: 20, message: '최대 20자를 넘을 수 없습니다.' },
	},
	description: {
		required: '필수값 입니다.',
		maxLength: { value: 20, message: '최대 20자를 넘을 수 없습니다.' },
	},
};

interface TaskEditModalProps {
	editModalControl: {
		isTaskCardEditModalOpen: boolean;
		setIsTaskCardEditModalOpen: Dispatch<SetStateAction<boolean>>;
	};
	cardItem: CardData;
	columnInfo: { id: number; title: string };
}

export default function TaskEditModal({ editModalControl, cardItem, columnInfo }: TaskEditModalProps) {
	const router = useRouter();
	const boardId = +(router.query?.boardid ?? '');

	const { value } = useDashboardContext();

	const {
		control,
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm<FormValue>({
		mode: 'onBlur',
		defaultValues: {
			title: cardItem.title,
			description: cardItem.description,
			tags: cardItem.tags,
			assigneeUserId: cardItem?.assignee?.id,
			dueDate: new Date(cardItem.dueDate),
			imageUrl: cardItem?.imageUrl,
			columnId: columnInfo.id,
		},
		shouldUnregister: true,
	});

	const onSubmit: SubmitHandler<FormValue> = async (data) => {
		//1 - 마감일이 지정된 경우 fomatting을 진행, 그렇지 않다면 undefined로 초기화
		const formattedDueDate = data.dueDate ? format(data.dueDate, 'yyyy-MM-dd HH:mm') : undefined;
		const newData = {
			...data,
			dueDate: formattedDueDate,
			dashboardId: boardId,
			imageUrl: watch('imageUrl'),
		};

		//2 - 값이 지정되지 않은 Field의 값 (undefined, imageUrl의 경우 file length가 0)을 제외하고 put 요청
		const filteredData = Object.fromEntries(
			Object.entries(newData).filter(([key, value]) => {
				if (key === 'imageUrl' && value instanceof FileList) {
					return value.length > 0;
				}
				return value !== undefined;
			}) as any,
		);

		try {
			await putCardItem(cardItem.id, filteredData as CardItemPost);
			editModalControl.setIsTaskCardEditModalOpen(false);
			router.reload();
		} catch (err) {
			/**
			 * @TODO 수정에 실패했습니다 alert
			 */
		}
	};

	async function handleChangeImageInput(e: ChangeEvent<HTMLInputElement>) {
		if (!e.target.files) return;
		const uploadedImage = await postCardImage(columnInfo.id, e.target?.files[0]);
		setValue('imageUrl', uploadedImage.imageUrl);
	}

	const isNoError = (obj: FieldErrors<FormValue>) => Object.keys(obj).length === 0;

	return (
		<Layout
			$modalType='Modal'
			title='할 일 수정'
			isOpen={editModalControl.isTaskCardEditModalOpen}
			setOpen={editModalControl.setIsTaskCardEditModalOpen}
		>
			<form onSubmit={handleSubmit(onSubmit)}>
				<div className='flex flex-col gap-[3.2rem] sm:gap-[2.4rem]'>
					<div className='flex items-center gap-[1.6rem]'>
						<div className='w-[50%] sm:container'>
							<DropDownManager<FormValue>
								name='assigneeUserId'
								dashboardMemberList={value.memberList}
								control={control}
							/>
						</div>
						<div className='w-[50%] sm:container'>
							<DropDownProgress<FormValue> name='columnId' columnList={value.columnList} control={control} />
						</div>
					</div>
					<FormInput<FormValue>
						label='제목'
						name='title'
						control={control}
						rules={RULES.title}
						required={!!('required' in RULES.title)}
					/>
					<FormInput<FormValue>
						label='설명'
						name='description'
						control={control}
						rules={RULES.description}
						required={!!('required' in RULES.description)}
					/>
					<Controller
						name='dueDate'
						control={control}
						render={({ field: { ref, value, onChange } }) => (
							<div>
								<p className='text-18-500'>마감일</p>
								<div className='container mt-[1rem] flex h-[5rem] flex-row gap-[1rem] rounded-[0.8rem] border border-gray-D bg-white px-[1.5rem] py-[1.2rem] align-top  text-16-400  '>
									<Image
										className='h-auto w-auto'
										width={20}
										height={20}
										src='/assets/calender.svg'
										alt='캘린더 모양 아이콘'
									/>
									<DatePicker
										onKeyDown={(e) => {
											e.preventDefault(); // 수동 입력 방지
										}}
										dateFormat={'YYYY.MM.dd hh:mm'}
										showTimeSelect={true}
										ref={ref}
										selected={value}
										onChange={onChange}
										className='container placeholder:mt-0 placeholder:text-gray-D focus:outline-violet-5'
										wrapperClassName='container'
										calendarClassName='container'
										placeholderText='날짜를 입력해주세요'
									/>
								</div>
							</div>
						)}
					/>
					<TagInput control={control} label='태그' />
					<div>
						<p className='text-18-500'>이미지</p>
						<label className='cursor-pointer' htmlFor='inputFile'>
							<div className='relative mt-[1rem] h-[7.6rem] w-[7.6rem]'>
								{watch('imageUrl')?.length ? (
									<>
										<Image
											fill
											alt='업로드 한 이미지 프리뷰'
											className=' rounded-[0.6rem]'
											style={{ objectFit: 'cover' }}
											src={watch('imageUrl') ?? ''}
										/>
										<div className='flex h-full w-full items-center justify-center rounded-[0.6rem] bg-black-0 opacity-0 hover:opacity-60'>
											<Image
												alt='이미지 인풋창에 hover시 나타나는 연필 모양 아이콘'
												width={30}
												height={30}
												src={'/assets/editPencil.svg'}
											/>
										</div>
									</>
								) : (
									<div className='flex rounded-[0.6rem]  bg-gray-F hover:bg-gray-E'>
										<Image
											className='mx-[2.4rem] my-[2.4rem] px-[0.6rem] py-[0.6rem]'
											width={28}
											height={28}
											src={addIcon}
											alt='추가하기 아이콘'
										/>
									</div>
								)}
							</div>
						</label>
						<input
							{...register('imageUrl')}
							className='hidden'
							id='inputFile'
							type='file'
							accept='image/jpeg, image/jpg, image/png'
							onChange={handleChangeImageInput}
						/>
					</div>
				</div>

				<div className='mt-[2.8rem] flex flex-row justify-end gap-[1.2rem] sm:mt-[2.4rem]'>
					<Button
						onClick={() => {
							editModalControl.setIsTaskCardEditModalOpen(false);
						}}
						color='modalWhite'
						disabled={false}
						variant='modal'
					>
						취소
					</Button>
					<Button disabled={!isNoError(errors)} type='submit' color='modalViolet' variant='modal'>
						확인
					</Button>
				</div>
			</form>
		</Layout>
	);
}
