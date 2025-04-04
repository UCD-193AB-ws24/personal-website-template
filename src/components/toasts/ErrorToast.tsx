import { toast, ToastContentProps, Flip } from "react-toastify";

export function toastError(message: string) {
  toast(ErrorToast, {
    position: "top-right",
    autoClose: false,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: false,
    progress: undefined,
    theme: "light",
    transition: Flip,
    data: { message },
  });
}

interface ErrorToastProps {
  data: { message: string };
}

export default function ErrorToast({
  closeToast,
  data,
}: ToastContentProps & ErrorToastProps) {
  return (
    <div className="grid grid-cols-[1fr_1px_80px] w-full">
      <div className="flex flex-col p-4">
        <h3 className="font-semibold text-lg text-red-500">Error</h3>
        <p className="text-sm">{data.message}</p>
      </div>
      <div className="bg-zinc-900/20 h-full" />
      <div className="flex flex-col justify-center items-center">
        <button
          className="border-none cursor-pointer"
          onClick={() => closeToast("close")}
        >
          Close
        </button>
      </div>
    </div>
  );
}
