import { TemplateMapping } from "@customTypes/apiResponse";
import { EllipsisVertical, PenLine, Trash2 } from "lucide-react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

interface TemplateItemProps {
  templateMapping: TemplateMapping;
  isAdmin: boolean;
  loadEditor: (templateMapping: TemplateMapping) => void;
  handleDeleteTemplate: (templateMapping: TemplateMapping) => void;
  setIsModalHidden: (isHidden: boolean) => void;
  setSelectedDraft: (templateMapping: TemplateMapping) => void;
}

export default function TemplateItem({
  templateMapping,
  isAdmin,
  loadEditor,
  handleDeleteTemplate,
  setIsModalHidden,
  setSelectedDraft,
}: TemplateItemProps) {
  return (
    <div className="flex flex-col justify-between justify-self-center w-[250px] sm:w-full h-[350px] border-2 border-black shadow-lg hover:bg-[#111827] hover:text-[#f08700] transition duration-300">
      <button
        onClick={() => loadEditor(templateMapping)}
        className="h-full border-none"
      >
        {templateMapping.name}
      </button>
      {isAdmin && (
        <div className="flex relative justify-between items-center p-2 h-[40px] border-t border-black bg-[#1f2c47]">
          <p className="text-white">{templateMapping.name}</p>
          <Menu as="div" className="relative inline-block text-left">
            <div className="flex">
              <MenuButton>
                <EllipsisVertical size={24} color="#f08700" />
              </MenuButton>
            </div>

            <MenuItems
              transition
              className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white ring-1 shadow-lg ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
            >
              <div className="py-1">
                <MenuItem>
                  <div className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden">
                    <button
                      onClick={() => handleDeleteTemplate(templateMapping)}
                      className="flex w-full gap-1 justify-left items-center text-black hover:text-black border-none cursor-pointer hover:bg-gray-100"
                    >
                      <Trash2 size={16} />
                      <p>Remove</p>
                    </button>
                  </div>
                </MenuItem>
                <MenuItem>
                  <div className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden">
                    <button
                      onClick={() => {
                        setIsModalHidden(false);
                        setSelectedDraft(templateMapping);
                      }}
                      className="flex w-full gap-1 justify-left items-center text-black hover:text-black border-none cursor-pointer hover:bg-gray-100"
                    >
                      <PenLine size={16} />
                      <p>Rename</p>
                    </button>
                  </div>
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>
        </div>
      )}
    </div>
  );
}
