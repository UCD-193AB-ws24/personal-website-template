import { toast, ToastContentProps, Flip } from 'react-toastify';
import { fetchUsername } from '@lib/requests/fetchUsername';

export async function toastPublish() {
	const username = await fetchUsername();

	toast(PublishToast, {
		position: 'top-right',
		autoClose: false,
		hideProgressBar: true,
		closeOnClick: false,
		pauseOnHover: true,
		draggable: false,
		progress: undefined,
		theme: 'light',
		transition: Flip,
		onClose: (reason) => {
			switch (reason) {
				case 'view':
					window.open(`/pages/${username}`, '_blank')?.focus();
				default:
			}
		},
	});
}

export default function PublishToast({ closeToast }: ToastContentProps) {
	return (
		// using a grid with 3 columns
		<div className="grid grid-cols-[1fr_1px_80px] w-full">
			<div className="flex flex-col p-4">
				<h3 className="font-semibold text-lg text-green-500">
					Success!
				</h3>
				<p className="text-sm">See your published website</p>
			</div>
			{/* that's the vertical line which separate the text and the buttons*/}
			<div className="bg-zinc-900/20 h-full" />
			<div className="grid grid-rows-[1fr_1px_1fr] h-full">
				{/*specifying a custom closure reason that can be used with the onClose callback*/}
				<button
					onClick={() => closeToast('view')}
					className="border-none text-purple-600 cursor-pointer"
				>
					View
				</button>
				<div className="bg-zinc-900/20 w-full" />
				{/*specifying a custom closure reason that can be used with the onClose callback*/}
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
