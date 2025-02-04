import { ReactNode } from "react";

type SidebarItem = {
  name: string,
  description: string,
  icon: ReactNode,
  type: string
}

const SidebarItem = ({ name, description, icon, type }: SidebarItem) => {
  return (
    <div
      className="flex items-start p-3 bg-white rounded-lg shadow-sm cursor-pointer hover:bg-gray-200"
    >
      <div className="mr-3 text-blue-500">{icon}</div>
      <div>
        <h3 className="font-semibold text-sm">{name}</h3>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
    </div>
  );
};

export default SidebarItem;

