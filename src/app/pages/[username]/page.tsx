import FullWindow from '@components/FullWindow';
import { ComponentItem } from '@customTypes/componentTypes';
import DraggableResizableTextbox from '@components/DraggableResizableTextbox';
import SectionTitleTextbox from '@components/SectionTitle';

interface PublishedPageProps {
	params: Promise<{ username: string }>;
}

export default async function PublishedPage({ params }: PublishedPageProps) {
	const username = (await params).username;
	let components: ComponentItem[] = [];

	const componentMap: Record<string, React.ComponentType<Partial<ComponentItem>>> = {
		textBlock: DraggableResizableTextbox,
		sectionTitle: SectionTitleTextbox,
	};

	const renderComponent = (comp: ComponentItem) => {
		const Component = componentMap[comp.type];

		return Component ? (
			<Component
				key={comp.id}
				id={comp.id}
				initialPos={comp.position}
				initialSize={comp.size}
				components={components}
				content={comp?.content}
				isPreview={true}
			/>
		) : null;
	};

	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_URL}/api/db/drafts/published-draft?username=${username}`,
			{
				headers: {
					'Content-Type': 'application/json',
				},
			}
		)
		const resBody = await response.json();

		if (!resBody.success) {
			throw new Error(resBody.error);
		}
		components = resBody.data;

	} catch (error) {
		console.log("Error:", error)
		return (
			<div>
				<h1>Error 404: Page not found</h1>
			</div>
		)
	}

	return (
		<div className="flex justify-center bg-white min-h-screen h-auto">
			<FullWindow>
				{ components.map(renderComponent) }
			</FullWindow>
		</div>
	);
}
