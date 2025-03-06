import { useState } from "react";

interface DraftNameModalProps {
  isHidden: boolean;
  submitCallback: (newDraftName: string) => void;
  setIsModalHidden: (isModalHidden: boolean) => void;
}

export default function DraftNameModal({
  isHidden,
  submitCallback,
  setIsModalHidden,
}: DraftNameModalProps) {
  const [newDraftName, setNewDraftName] = useState("");

  return (
    <div
      style={{ display: isHidden ? "none" : "flex" }}
      className="fixed inset-0 flex flex-col justify-center items-center bg-gray-900 bg-opacity-50 z-50"
    >
      <div className="center flex flex-col gap-4 mt-5 w-3/4 md:w-1/3 lg:w-1/4 mx-auto bg-gray-100 p-10 rounded-lg">
        <p className="text-lg">Name your draft</p>
        <form
          className="grid gap-4 w-full"
          onSubmit={(e) => {
            e.preventDefault();
            setIsModalHidden(true);
            setNewDraftName("");
            submitCallback(newDraftName);
          }}
        >
          <input
            type="text"
            placeholder="New Name"
            value={newDraftName}
            onChange={(e) => setNewDraftName(e.target.value)}
            required
            className="p-2 border rounded w-full"
          />
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => {
                setIsModalHidden(true);
                setNewDraftName("");
              }}
              className="px-4 py-2 border border-red-500 text-red-500 rounded-md cursor-pointer hover:bg-red-200 transition duration-200 ease-in-out"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-md cursor-pointer hover:bg-green-600 transition duration-200 ease-in-out"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
