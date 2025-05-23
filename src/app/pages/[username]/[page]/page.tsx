import FullWindow from "@components/FullWindow";
import { ComponentItem } from "@customTypes/componentTypes";
import NavigationBar from "@components/editorComponents/NavigationBar";
import Custom404 from "@components/Custom404";

import { componentMap } from "@utils/componentUtils";
import PublishContextProvider from "@contexts/PublishContext";
import PagesContextProvider from "@contexts/PagesContext";
import {
  getMaxRight,
  getLowestY,
  splitComponentsAtFirstProjectCard,
  renderGroupedRows,
} from "@utils/publishRenderUtils";

interface PublishedPageProps {
  params: Promise<{ username: string; page: string }>;
}

export default async function PublishedPage({ params }: PublishedPageProps) {
  const { username, page } = await params;
  const decodedPageName = decodeURIComponent(page).replace(/-/g, " ");
  let components: ComponentItem[] = [];
  let pages: { pageName: string; components: ComponentItem[] }[] = [];

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/db/drafts/published-draft?username=${username}`,
      {
        headers: { "Content-Type": "application/json" },
      },
    );

    const resBody = await response.json();

    if (!resBody.success || !resBody.data.pages.length) {
      return <Custom404 />;
    }

    pages = resBody.data.pages;
    const matchedPage = pages.find((p) => p.pageName === decodedPageName);

    if (!matchedPage) {
      return <Custom404 />;
    }

    components = matchedPage.components;
  } catch (error) {
    console.error("Error fetching data:", error);
    return <h1>Error 500: Failed to load page</h1>;
  }

  const activePageIndex =
    pages.findIndex((p) => p.pageName === decodedPageName) || 0;

  const renderComponent = (comp: ComponentItem) => {
    if (comp.type === "navBar") {
      return (
        <NavigationBar
          username={username}
          key={comp.id}
          pages={pages}
          activePageIndex={activePageIndex}
          isPublish={true}
          components={components}
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

  const maxRight = getMaxRight(components);
  const lowestY = getLowestY(components);

  const { beforeProjectCard, fromProjectCardOn } =
    splitComponentsAtFirstProjectCard(components);

  return (
    <>
      <PublishContextProvider isPublish={true}>
        <PagesContextProvider pages={pages}>
          {/* Full-screen background to cover the body::before */}
          <div className="fixed inset-0 z-0 bg-white" />

          <div className="absolute h-screen w-screen overflow-auto">
            <FullWindow width={maxRight} lowestY={lowestY}>
              {beforeProjectCard.map(renderComponent)}
              {renderGroupedRows(fromProjectCardOn)}
            </FullWindow>
          </div>
        </PagesContextProvider>
      </PublishContextProvider>
    </>
  );
}
