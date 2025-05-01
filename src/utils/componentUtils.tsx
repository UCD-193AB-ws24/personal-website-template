import DraggableResizableTextbox from "@components/editorComponents/DraggableResizableTextbox";
import SectionTitleTextbox from "@components/editorComponents/SectionTitle";
import NavigationBar from "@components/editorComponents/NavigationBar";
import ImageComponent from "@components/editorComponents/ImageComponent";
import FileComponent from "@components/editorComponents/FileComponent";
import VideoComponent from "@components/editorComponents/VideoComponent";
import AcademicEntry from "@components/editorComponents/AcademicEntry";
import WebPageComponent from "@components/editorComponents/WebPageComponent";
import WorkEntry from "@components/editorComponents/WorkEntry";
import HorizontalLine from "@components/editorComponents/HorizontalLine";
import VerticalLine from "@components/editorComponents/VerticalLine";
import IconComponent from "@components/editorComponents/IconComponent";
import AboutMeCard from "@components/editorComponents/AboutMeCard";
import ProjectCard from "@components/editorComponents/ProjectCard";

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
  academicEntry: AcademicEntry,
  webPage: WebPageComponent,
  workEntry: WorkEntry,
  horizontalLine: HorizontalLine,
  verticalLine: VerticalLine,
  icon: IconComponent,
  aboutMeCard: AboutMeCard,
  projectCard: ProjectCard,
};

export const componentSizes: Record<string, { width: number; height: number }> =
{
  textBlock: { width: 200, height: 150 },
  sectionTitle: { width: 350, height: 30 },
  image: { width: 200, height: 150 },
  file: { width: 425, height: 550 },
  video: { width: 450, height: 250 },
  navBar: { width: 100000, height: 48 },
  academicEntry: { width: 620, height: 70 },
  webPage: { width: 800, height: 600 },
  workEntry: { width: 750, height: 150 },
  horizontalLine: { width: 350, height: 2 },
  verticalLine: { width: 2, height: 350 },
  icon: { width: 50, height: 50 },
  aboutMeCard: { width: 600, height: 70 },
  projectCard: { width: 100000, height: 200 },
};

export const renderOverlayContent = (activeType: string | null) => {
  switch (activeType) {
    case "textBlock":
      return <DraggableResizableTextbox isDragOverlay={true} />;
    case "sectionTitle":
      return <SectionTitleTextbox isDragOverlay={true} />;
    case "navBar":
      return <NavigationBar />;
    case "image":
      return <ImageComponent />;
    case "file":
      return <FileComponent />;
    case "video":
      return <VideoComponent />;
    case "academicEntry":
      return <AcademicEntry />;
    case "webPage":
      return <WebPageComponent />;
    case "workEntry":
      return <WorkEntry />;
    case "horizontalLine":
      return <HorizontalLine />;
    case "verticalLine":
      return <VerticalLine />;
    case "aboutMeCard":
      return <AboutMeCard />
    case "icon":
      return <IconComponent isDragOverlay={true} />;
    case "aboutMeCard":
      return <AboutMeCard />
    case "projectCard":
      return <ProjectCard />;
    default:
      return null;
  }
};
