import useComponentVisible from '@lib/hooks/useComponentVisible';
import {
	EllipsisVertical,
	PenLine,
	Trash2,
	Star,
	LucideUserRoundX,
} from 'lucide-react';
import { Ref, useState } from 'react';

interface DraftItemProps {
	id: number;
	name: string;
	isPublished: boolean;
	isAdmin: boolean;
	loadEditor: (id: string) => void;
	handleDeleteDraft: (id: number, name: string) => void;
	setIsModalHidden: (hidden: boolean) => void;
	setSelectedDraft: ({ id, name }: { id: number; name: string }) => void;
	unpublish: () => void;
	publishAsTemplate: (id: number, name: string) => void;
}

export default function DraftItem({
	id,
	name,
	isPublished,
	isAdmin,
	loadEditor,
	handleDeleteDraft,
	setIsModalHidden,
	setSelectedDraft,
	unpublish,
	publishAsTemplate,
}: DraftItemProps) {
	// Used for clicking outside
	const { ref, isComponentVisible, setIsComponentVisible } =
		useComponentVisible(false);

	const [visible, setVisible] = useState(false);

	return (
		<div className="flex flex-col justify-between justify-self-center w-[250px] sm:w-full h-[350px] border-2 border-black shadow-lg hover:bg-[#111827] hover:text-[#f08700] transition duration-300">
			{isPublished && (
				<div className="flex justify-end">
					<Star
						size={24}
						fill="#ffff00"
						color="#000000"
						strokeWidth={1.5}
					/>
				</div>
			)}
			<button
				onClick={() => loadEditor(id.toString())}
				className="h-full border-none"
			>
				{name}
			</button>
			<div className="flex relative justify-between items-center p-2 h-[40px] border-t border-black bg-[#1f2c47]">
				<p className="text-white">{name}</p>
				<button
					className="text-white border-none"
					onClick={() => {
						setIsComponentVisible(!isComponentVisible);
						setVisible(!visible);
					}}
				>
					<EllipsisVertical size={24} color="#f08700" />
				</button>
				<div
					ref={ref as Ref<HTMLDivElement> | undefined}
					style={{
						display:
							isComponentVisible && visible ? 'flex' : 'none',
					}}
					className="flex flex-col justify-evenly absolute z-10 right-[-25px] bottom-[35px] w-[100px] h-[100px] border border-black bg-white"
				>
					<button
						onClick={() => handleDeleteDraft(id, name)}
						className="flex justify-evenly items-center text-black hover:text-black border-none cursor-pointer hover:bg-gray-100"
					>
						<Trash2 size={16} />
						<p>Remove</p>
					</button>
					<button
						onClick={() => {
							setIsModalHidden(false);
							setSelectedDraft({ id, name });
						}}
						className="flex justify-evenly items-center text-black hover:text-black border-none cursor-pointer hover:bg-gray-100"
					>
						<PenLine size={16} />
						<p>Rename</p>
					</button>
					{isPublished && (
						<button
							onClick={unpublish}
							className="flex justify-evenly items-center text-black hover:text-black border-none cursor-pointer hover:bg-gray-100"
						>
							<LucideUserRoundX size={16} />
							<p>Unpublish</p>
						</button>
					)}
					{isAdmin && (
						<button
							onClick={() => {
								publishAsTemplate(id, name);
							}}
							className="flex justify-evenly items-center text-black hover:text-black border-none cursor-pointer hover:bg-gray-100"
						>
							<LucideUserRoundX size={16} />
							<p>Publish as template</p>
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
