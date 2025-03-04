import { TemplateMapping } from '@customTypes/apiResponse';
import useComponentVisible from '@lib/hooks/useComponentVisible';
import { EllipsisVertical, PenLine, Trash2 } from 'lucide-react';
import { Ref, useState } from 'react';

interface TemplateItemProps {
	templateMapping: TemplateMapping;
	isAdmin: boolean;
	loadEditor: (templateMapping: TemplateMapping) => void;
	handleDeleteTemplate: (templateMapping: TemplateMapping) => void;
	setIsModalHidden: (isHidden: boolean) => void;
	setSelectedDraft: (templateMapping: TemplateMapping) => void;
}

export default function TemplateItem({
	templateMapping,
	isAdmin,
	loadEditor,
	handleDeleteTemplate,
	setIsModalHidden,
	setSelectedDraft,
}: TemplateItemProps) {
	// Used for clicking outside
	const { ref, isComponentVisible, setIsComponentVisible } =
		useComponentVisible(false);

	const [visible, setVisible] = useState(false);

	return (
		<div className="flex flex-col justify-between justify-self-center w-[250px] sm:w-full h-[350px] border-2 border-black shadow-lg hover:bg-[#111827] hover:text-[#f08700] transition duration-300">
			<button
				onClick={() => loadEditor(templateMapping)}
				className="h-full border-none"
			>
				{templateMapping.name}
			</button>
			{isAdmin && (
				<div className="flex relative justify-between items-center p-2 h-[40px] border-t border-black bg-[#1f2c47]">
					<p className="text-white">{templateMapping.name}</p>
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
							display: isComponentVisible ? 'flex' : 'none',
						}}
						className="flex flex-col justify-evenly absolute z-10 right-[-25px] bottom-[35px] w-[100px] h-[100px] border border-black bg-white"
					>
						<button
							onClick={() =>
								handleDeleteTemplate(templateMapping)
							}
							className="flex justify-evenly items-center text-black hover:text-black border-none cursor-pointer hover:bg-gray-100"
						>
							<Trash2 size={16} />
							<p>Remove</p>
						</button>
						<button
							onClick={() => {
								setIsModalHidden(false);
								setSelectedDraft(templateMapping);
							}}
							className="flex justify-evenly items-center text-black hover:text-black border-none cursor-pointer hover:bg-gray-100"
						>
							<PenLine size={16} />
							<p>Rename</p>
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
