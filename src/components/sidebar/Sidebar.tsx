import { useState } from 'react';
import { ChevronLeft, ChevronRight, SchoolIcon, TextIcon } from 'lucide-react';

import SidebarItem from './SidebarItem';

const sidebarItems = [
  { type: 'textbox', name: 'Textbox', description: 'Add a text box.', icon: <TextIcon /> },
  { type: 'schoolInfo', name: 'School Information', description: 'Add information about your schooling.', icon: <SchoolIcon /> },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <div className={`flex ${collapsed ? 'w-12' : 'w-64'} bg-gray-100 h-screen relative transition-width duration-300`}>
    {!collapsed && (
      <div className="w-64 bg-gray-100 p-4 border-r h-screen">
        <h2 className="text-lg font-bold mb-4">Components</h2>
        <div className="space-y-4">
          {sidebarItems.map(item => (
            <SidebarItem
              type={item.type}
              name={item.name}
              description={item.description}
              icon={item.icon}
            />
          ))}
        </div>
      </div>
    )}
     <button
        className="absolute top-1/2 transform -translate-y-1/2 right-0 bg-white border rounded-l-lg py-3 shadow"
        onClick={toggleSidebar}
      >
        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>
    </div>
  );
};

export default Sidebar;
