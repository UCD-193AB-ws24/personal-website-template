import { toast, ToastContentProps, Flip } from "react-toastify";

export function toastSuccess(message: string) {
  toast(SuccessToast, {
    position: "top-right",
    autoClose: 2500,
    hideProgressBar: true,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: false,
    progress: undefined,
    theme: "light",
    transition: Flip,
    data: { message },
  });
}

interface SuccessToastProps {
  data: { message: string };
}

export default function SuccessToast({
  closeToast,
  data,
}: ToastContentProps & SuccessToastProps) {
  return (
    <div className="grid grid-cols-[1fr_1px_80px] w-full">
      <div className="flex flex-col p-4">
        <h3 className="font-semibold text-lg text-green-500">Success!</h3>
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
