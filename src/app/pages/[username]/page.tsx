import FullWindow from '@components/FullWindow';
import { ComponentItem } from '@customTypes/componentTypes';
import NavigationBar from '@components/NavigationBar';

import { componentMap } from '@utils/componentUtils';

interface PublishedPageProps {
	params: Promise<{ username: string }>;
}

export default async function PublishedPage({ params }: PublishedPageProps) {
	const username = (await params).username;
        let components: ComponentItem[] = [];
        let pages: { pageName: string, components: ComponentItem[] }[] = [];

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

		pages = resBody.data.pages;
		const firstPage = pages[0];
		components = firstPage.components;

	} catch (error) {
		console.log("Error:", error)
		return (
			<div>
				<h1>Error 404: Page not found</h1>
			</div>
		)
	}

        const renderComponent = (comp: ComponentItem) => {
            if (comp.type === "navBar") {
                return (
                    <NavigationBar
                        username={username}
                        key={comp.id}
                        pages={pages}
                        activePageIndex={0} // render first page
                        isPublish={true}
                    />
                );
            }

            const Component = componentMap[comp.type];

            return Component ? (
                <Component
                    key={comp.id}
                    id={comp.id}
                    initialPos={comp.position}
                    initialSize={comp.size}
                    content={comp?.content}
                    isPreview={true}
                />
            ) : null;
        };

	return (
		<div className="flex justify-center bg-white min-h-screen h-auto">
			<FullWindow>
				{ components.map(renderComponent) }
			</FullWindow>
		</div>
	);
}
