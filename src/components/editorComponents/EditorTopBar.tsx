import Link from "next/link";
import { GridIcon, CircleHelpIcon } from "lucide-react";

interface EditorTopBarProps {
  draftName: string;
  isGridVisible: boolean;
  setIsGridVisible: React.Dispatch<React.SetStateAction<boolean>>;
  isPreview: boolean;
  setIsPreview: React.Dispatch<React.SetStateAction<boolean>>;
  handlePublish: () => void;
}

export default function EditorTopBar({
  draftName,
  isGridVisible,
  setIsGridVisible,
  isPreview,
  setIsPreview,
  handlePublish,
}: EditorTopBarProps) {
  return (
    <div className="fixed top-0 left-[16rem] w-[calc(100vw-16rem)] z-50 bg-gray-100 flex justify-between items-center px-6 py-3 h-[64px]">
      <div className="flex items-center gap-10">
        <Link
          href="/saveddrafts"
          className="text-large font-semibold px-4 py-2 rounded-md border border-gray-500 transition-all duration-300 hover:bg-gray-500 hover:text-white shadow-md hover:shadow-lg"
        >
          Drafts
        </Link>
        <p className="font-bold">{draftName}</p>
      </div>
      <div className="flex">
        <a
          href="/help"
          target="_blank"
          className="text-large font-semibold flex items-center gap-2 px-3 py-1 mr-4 border border-gray-500 hover:bg-gray-500 hover:text-white rounded-md shadow-md transition-all"
        >
          <CircleHelpIcon size={18} />
          Help
        </a>
        <button
          onClick={() => setIsGridVisible((prev) => !prev)}
          className="text-large font-semibold flex items-center gap-2 px-3 py-1 mr-4 border border-gray-500 hover:bg-gray-500 hover:text-white rounded-md shadow-md transition-all"
        >
          <GridIcon size={18} />
          <span className="text-sm">
            {isGridVisible ? "Grid On" : "Grid Off"}
          </span>
        </button>
        <button
          className={`text-large font-semibold px-4 py-2 rounded-md mr-4 border border-blue-500 transition-all duration-300 hover:bg-blue-500 hover:text-white shadow-md hover:shadow-lg`}
          onClick={() => setIsPreview(!isPreview)}
        >
          Preview
        </button>

        <button
          className={`text-white text-large font-semibold px-4 py-2 rounded-md bg-blue-500 transition-all duration-300 hover:bg-blue-700 shadow-md hover:shadow-lg`}
          onClick={handlePublish}
        >
          Publish
        </button>
      </div>
    </div>
  );
}
