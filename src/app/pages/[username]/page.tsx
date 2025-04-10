import FullWindow from "@components/FullWindow";
import { ComponentItem } from "@customTypes/componentTypes";
import NavigationBar from "@components/editorComponents/NavigationBar";
import Custom404 from "@components/Custom404";

import { componentMap } from "@utils/componentUtils";
import { getMaxRight, getLowestY, splitComponentsAtFirstProjectCard, renderGroupedRows } from "@utils/publishRenderUtils";

interface PublishedPageProps {
  params: Promise<{ username: string }>;
}

export default async function PublishedPage({ params }: PublishedPageProps) {
  const username = (await params).username;
  let components: ComponentItem[] = [];
  let pages: { pageName: string; components: ComponentItem[] }[] = [];

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/db/drafts/published-draft?username=${username}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    const resBody = await response.json();

    if (!resBody.success) {
      throw new Error(resBody.error);
    }

    pages = resBody.data.pages;
    const firstPage = pages[0];
    components = firstPage.components;
  } catch (error) {
    console.log("Error:", error);
    return <Custom404 />;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/db/drafts/increase-view-count?username=${username}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const resBody = await response.json();
    if (!resBody.success) {
      throw new Error(resBody.error);
    }
  } catch (error) {
    console.log("Error:", error);
    return <Custom404 />;
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

  const { beforeProjectCard, fromProjectCardOn } = splitComponentsAtFirstProjectCard(components);

  return (
    <>
      {/* Full-screen background to cover the body::before */}
      <div className="fixed inset-0 z-0 bg-white" />

      <div className="absolute h-screen w-screen overflow-auto">
        <FullWindow width={maxRight} lowestY={lowestY}>
          {beforeProjectCard.map(renderComponent)}
          {renderGroupedRows(fromProjectCardOn)}
        </FullWindow>
      </div>
    </>
  );
}
