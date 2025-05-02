import Link from "next/link";
import Image from "next/image";
import {
  BaselineIcon,
  BriefcaseIcon,
  CircleArrowRightIcon,
  ContactIcon,
  FileUserIcon,
  ImagesIcon,
  QuoteIcon,
  SchoolIcon,
  RectangleEllipsisIcon,
  TextIcon,
  VideoIcon,
  AppWindowIcon,
  Rows2Icon,
  Columns2Icon,
  StarIcon,
  PresentationIcon,
} from "lucide-react";

import SidebarItem from "./SidebarItem";
import Accordion from "./Accordion"; 
import AccordionItem from "./AccordionItem";

const categorizedItems = {
  "Text & Structure": [
    {
      id: 1,
      type: "textBlock",
      name: "Text Block",
      description: "Add paragraphs of text to describe your story or work.",
      icon: <TextIcon />,
    },
    {
      id: 2,
      type: "sectionTitle",
      name: "Section Title",
      description: "Add a bold title to separate different sections.",
      icon: <BaselineIcon />,
    },
    {
      id: 10,
      type: "icon",
      name: "Icon",
      description: "Choose from a variety of icons to add.",
      icon: <StarIcon />,
    },
    {
      id: 15,
      type: "projectCard",
      name: "Project Card",
      description: "Describe project(s) you worked on.",
      icon: <PresentationIcon />,
    },
    {
      id: 8,
      type: "horizontalLine",
      name: "Horizontal Line",
      description: "Add a line to separate sections horizontally.",
      icon: <Rows2Icon />,
    },
    {
      id: 9,
      type: "verticalLine",
      name: "Vertical Line",
      description: "Add a line to separate sections vertically.",
      icon: <Columns2Icon />,
    }
  ],
  Navigation: [
    {
      id: 3,
      type: "navBar",
      name: "Navigation Bar",
      description: "Add a customizable menu for easy site navigation.",
      icon: <RectangleEllipsisIcon />,
    },
    {
      id: 11,
      type: "navButton",
      name: "Navigation Button",
      description: "Add a button to link to other pages or sections.",
      icon: <CircleArrowRightIcon />,
    },
  ],
  Media: [
    {
      id: 4,
      type: "image",
      name: "Image",
      description: "Upload and display an image.",
      icon: <ImagesIcon />,
    },
    {
      id: 5,
      type: "file",
      name: "File",
      description: "Upload and embed a PDF.",
      icon: <FileUserIcon />,
    },
    {
      id: 6,
      type: "video",
      name: "Video",
      description: "Upload and embed a video.",
      icon: <VideoIcon />,
    },
    {
      id: 7,
      type: "webPage",
      name: "Web Page",
      description: "Display a web page.",
      icon: <AppWindowIcon />,
    },
  ],
  "Profile & Experience": [
    {
      id: 12,
      type: "aboutMeCard",
      name: "About Me Card",
      description: "Create a quick bio with your photo and contact info.",
      icon: <ContactIcon />,
    },
    {
      id: 13,
      type: "academicEntry",
      name: "Academic Entry",
      description:
        "Highlight information about an academic institution, degree, and duration",
      icon: <SchoolIcon />,
    },
    {
      id: 14,
      type: "workEntry",
      name: "Work Entry",
      description: "Describe a job role, company, and time period.",
      icon: <BriefcaseIcon />,
    },
    {
      id: 16,
      type: "endoresment",
      name: "Endoresment",
      description: "Add quotes or recommendations from colleagues.",
      icon: <QuoteIcon />,
    },
  ]
};

export default function Sidebar() {
  return (
    <div className="flex w-64 bg-gray-100 max-h-screen fixed left-0 top-0 transition-width duration-300">
      <div className="overflow-y-auto w-64 bg-gray-100 px-4 pt-3 pb-4 border-r h-screen">
        <Link href="/" className="flex items-center gap-x-3 mb-4">
          <Image src="/logo.png" width={32} height={32} alt="Profesite Logo" />
          <span className="self-center text-4xl font-light tracking-wide whitespace-nowrap iceland-font">
            PROFESITE
          </span>
        </Link>

        <h1 className="text-lg font-bold mb-4">Components</h1>

        <Accordion>
          {Object.entries(categorizedItems).map(([category, items]) => (
            <AccordionItem key={category} title={category}>
              <div className="space-y-2">
                {items.map((item) => (
                  <SidebarItem
                    key={item.id}
                    type={item.type}
                    name={item.name}
                    description={item.description}
                    icon={item.icon}
                  />
                ))}
              </div>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}

