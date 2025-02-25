import FullWindow from "@components/FullWindow";
import { ComponentItem } from "@customTypes/componentTypes";
import DraggableResizableTextbox from "@components/DraggableResizableTextbox";
import SectionTitleTextbox from "@components/SectionTitle";
import NavigationBar from "@components/NavigationBar";

interface PublishedPageProps {
  params: Promise<{ username: string; page: string }>;
}

export default async function PublishedPage({ params }: PublishedPageProps) {
  const { username, page } = await params;
  const decodedPageName = decodeURIComponent(page).replace(/-/g, " ");
  let components: ComponentItem[] = [];
  let pages: { pageName: string, components: ComponentItem[] }[] = [];

  const componentMap: Record<string, React.ComponentType<Partial<ComponentItem>>> = {
    textBlock: DraggableResizableTextbox,
    sectionTitle: SectionTitleTextbox,
    navBar: NavigationBar,
  };

  try {
    const response = await fetch(`${process.env.URL}/api/db/drafts/published-draft?username=${username}`, {
      headers: { 'Content-Type': 'application/json' },
    });

    const resBody = await response.json();

    if (!resBody.success || !resBody.data.pages.length) {
      return <h1>Error 404: No pages found</h1>;
    }

    pages = resBody.data.pages;
    const matchedPage = pages.find((p) => p.pageName === decodedPageName);

    if (!matchedPage) {
      return <h1>Error 404: Page not found</h1>;
    }

    components = matchedPage.components;
  } catch (error) {
    console.error("Error fetching data:", error);
    return <h1>Error 500: Failed to load page</h1>;
  }

  const activePageIndex = pages.findIndex((p) => p.pageName === decodedPageName) || 0;

  const renderComponent = (comp: ComponentItem) => {
    if (comp.type === "navBar") {
      return (
        <NavigationBar
          username={username}
          key={comp.id}
          pages={pages}
          activePageIndex={activePageIndex}
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
    <div className="flex flex-col items-center bg-white min-h-screen h-auto">
      <FullWindow>{components.map(renderComponent)}</FullWindow>
    </div>
  );
}
