import { BaselineIcon, BriefcaseIcon, CircleArrowRightIcon, ContactIcon, FileUserIcon, ImagesIcon, QuoteIcon, SchoolIcon, SquareMenuIcon, TextIcon } from 'lucide-react';

import SidebarItem from './SidebarItem';

const sidebarItems = [
  { id: 1, type: 'textBlock', name: 'Text Block', description: 'Add paragraphs of text to describe your story or work.', icon: <TextIcon /> },
  { id: 2, type: 'sectionTitle', name: 'Section Title', description: 'Add a bold title to separate different sections.', icon: <BaselineIcon /> },
  { id: 3, type: 'navButton', name: 'Navigation Button', description: 'Add a button to link to other pages or sections.', icon: <CircleArrowRightIcon /> },
  { id: 4, type: 'navBar', name: 'Navigation Bar', description: 'Add a customizable menu for easy site navigation.', icon: <SquareMenuIcon /> },
  { id: 5, type: 'aboutMeCard', name: 'About Me Card', description: 'Create a quick bio with your photo and contact info.', icon: <ContactIcon /> },
  { id: 6, type: 'academicEntry', name: 'Academic Entry', description: 'Highlight information about an academic institution, degree, and duration', icon: <SchoolIcon /> },
  { id: 7, type: 'workEntry', name: 'Work Entry', description: 'Describe a job role, company, and time period.', icon: <BriefcaseIcon /> },
  { id: 8, type: 'resumeUpload', name: 'Resume Upload', description: 'Upload or embed your resume directly on your site.', icon: <FileUserIcon /> },
  { id: 9, type: 'endoresment', name: 'Endoresment', description: 'Add quotes or recommendations from colleagues.', icon: <QuoteIcon /> },
  { id: 10, type: 'imageGallery', name: 'Image Gallery', description: 'Display multiple photos in a grid or slideshow format.', icon: <ImagesIcon /> },
];

export default function Sidebar() {
  return (
    <div className={`flex w-64 bg-gray-100 h-screen sticky top-0 transition-width duration-300`}>
        <div className="overflow-y-auto w-64 bg-gray-100 p-4 border-r h-screen">
          <h2 className="text-lg font-bold mb-4">Components</h2>
          <div className="space-y-4">
            {sidebarItems.map(item => (
              <SidebarItem
                key={item.id}
                type={item.type}
                name={item.name}
                description={item.description}
                icon={item.icon}
              />
            ))}
          </div>
        </div>
    </div>
  );
}
