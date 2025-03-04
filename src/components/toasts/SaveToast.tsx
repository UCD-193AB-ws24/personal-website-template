import { toast, ToastContentProps, Flip } from 'react-toastify';

export function toastSaveSuccess() {
	toast(SaveToast, {
		position: 'top-right',
		autoClose: 2500,
		hideProgressBar: true,
		closeOnClick: false,
		pauseOnHover: true,
		draggable: false,
		progress: undefined,
		theme: 'light',
		transition: Flip,
	});
}

export default function SaveToast({ closeToast }: ToastContentProps) {
	return (
		// using a grid with 3 columns
		<div className="grid grid-cols-[1fr_1px_80px] w-full">
			<div className="flex flex-col p-4">
				<h3 className="font-semibold text-lg text-green-500">
					Success!
				</h3>
				<p className="text-sm">Saved successfully</p>
			</div>
			<div className="bg-zinc-900/20 h-full" />
			<div className="flex flex-col justify-center items-center">
				<button
					className="border-none cursor-pointer"
					onClick={() => closeToast('close')}
				>
					Close
				</button>
			</div>
		</div>
	);
}
