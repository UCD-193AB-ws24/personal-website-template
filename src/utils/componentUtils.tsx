import DraggableResizableTextbox from "@components/editorComponents/DraggableResizableTextbox";
import SectionTitleTextbox from "@components/editorComponents/SectionTitle";
import NavigationBar from "@components/editorComponents/NavigationBar";
import ImageComponent from "@components/editorComponents/ImageComponent";
import FileComponent from "@components/editorComponents/FileComponent";
import VideoComponent from "@components/editorComponents/VideoComponent";

import { ComponentItem } from "@customTypes/componentTypes";

export const componentMap: Record<
  string,
  React.ComponentType<Partial<ComponentItem>>
> = {
  textBlock: DraggableResizableTextbox,
  sectionTitle: SectionTitleTextbox,
  navBar: NavigationBar,
  image: ImageComponent,
  file: FileComponent,
  video: VideoComponent,
};

export const componentSizes: Record<string, { width: number; height: number }> =
  {
    textBlock: { width: 200, height: 150 },
    sectionTitle: { width: 350, height: 30 },
    image: { width: 200, height: 150 },
    file: { width: 425, height: 550 },
    video: { width: 450, height: 250 },
    navBar: { width: 100000, height: 48 },
  };

export const renderOverlayContent = (activeType: string | null) => {
  switch (activeType) {
    case "textBlock":
      return <DraggableResizableTextbox />;
    case "sectionTitle":
      return <SectionTitleTextbox />;
    case "navBar":
      return <NavigationBar />;
    case "image":
      return <ImageComponent />;
    case "file":
      return <FileComponent />;
    case "video":
      return <VideoComponent />;
    default:
      return null;
  }
};
