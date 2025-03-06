import {
  EllipsisVertical,
  PenLine,
  Trash2,
  Star,
  LucideUserRoundX,
  Globe,
} from "lucide-react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

interface DraftItemProps {
  id: number;
  name: string;
  isPublished: boolean;
  isAdmin: boolean;
  loadEditor: (id: string) => void;
  handleDeleteDraft: (id: number, name: string) => void;
  setIsModalHidden: (hidden: boolean) => void;
  setSelectedDraft: ({ id, name }: { id: number; name: string }) => void;
  unpublish: () => void;
  publishAsTemplate: (id: number, name: string) => void;
}

export default function DraftItem({
  id,
  name,
  isPublished,
  isAdmin,
  loadEditor,
  handleDeleteDraft,
  setIsModalHidden,
  setSelectedDraft,
  unpublish,
  publishAsTemplate,
}: DraftItemProps) {
  return (
    <div className="flex flex-col justify-between justify-self-center w-[250px] sm:w-full h-[350px] border-2 border-black shadow-lg hover:bg-[#111827] hover:text-[#f08700] transition duration-300">
      {isPublished && (
        <div className="flex justify-end">
          <Star size={24} fill="#ffff00" color="#000000" strokeWidth={1.5} />
        </div>
      )}
      <button
        onClick={() => loadEditor(id.toString())}
        className="h-full border-none"
      >
        {name}
      </button>
      <div className="flex relative justify-between items-center p-2 h-[40px] border-t border-black bg-[#1f2c47]">
        <p className="text-white truncate">{name}</p>
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
                    onClick={() => handleDeleteDraft(id, name)}
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
                      setSelectedDraft({ id, name });
                    }}
                    className="flex w-full gap-1 justify-left items-center text-black hover:text-black border-none cursor-pointer hover:bg-gray-100"
                  >
                    <PenLine size={16} />
                    <p>Rename</p>
                  </button>
                </div>
              </MenuItem>
              {isPublished && (
                <MenuItem>
                  <div className="block gap-1 px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden">
                    <button
                      onClick={unpublish}
                      className="flex w-full gap-1 justify-left items-center text-black hover:text-black border-none cursor-pointer hover:bg-gray-100"
                    >
                      <LucideUserRoundX size={16} />
                      <p>Unpublish</p>
                    </button>
                  </div>
                </MenuItem>
              )}
              {isAdmin && (
                <MenuItem>
                  <div className="block gap-1 px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden">
                    <button
                      onClick={() => {
                        publishAsTemplate(id, name);
                      }}
                      className="flex w-full gap-1 justify-left items-center text-black hover:text-black border-none cursor-pointer hover:bg-gray-100"
                    >
                      <Globe size={16} />
                      <p>Publish as template</p>
                    </button>
                  </div>
                </MenuItem>
              )}
            </div>
          </MenuItems>
        </Menu>
      </div>
    </div>
  );
}
