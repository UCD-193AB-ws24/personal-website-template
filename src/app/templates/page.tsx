'use client';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@lib/firebase/firebaseApp';
import { signUserOut } from '@lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { APIResponse } from '@customTypes/apiResponse';
import Navbar from '@components/Navbar';
import LoadingSpinner from '@components/LoadingSpinner';
import DraftItem from '@components/DraftItem';
import { fetchUsername } from '@lib/requests/fetchUsername';
import { fetchPublishedDraftNumber } from '@lib/requests/fetchPublishedDraftNumber';

export default function Templates() {
	const [user] = useAuthState(auth);
	const [username, setUsername] = useState('');
	const [isModalHidden, setIsModalHidden] = useState(true);
	const [newDraftName, setNewDraftName] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [publishedDraftNumber, setPublishedDraftNumber] = useState(0);
	const router = useRouter();

	useEffect(() => {
		if (user) {
			getUsername();
			getPublishedDraftNumber();
		}
		// else {
		//   router.push("/")
		// }
	}, [user]);

	const handleSignOut = async () => {
		try {
			await signUserOut();
			setUsername('');
			router.push('/');
		} catch (error) {
			console.error('Error logging out:', error);
		}
	};

	const getUsername = async () => {
		const name = await fetchUsername();
		if (name === null) {
			setUsername('Unknown');
			router.push('/setusername');
		} else {
			setUsername(name);
		}
	};

	const getPublishedDraftNumber = async () => {
		setIsLoading(true);

		const pubDraftNum = await fetchPublishedDraftNumber();
		setPublishedDraftNumber(pubDraftNum);

		setIsLoading(false);
	};

	const loadEditor = async (draftNumber: string) => {
		router.push('/editor?draftNumber=' + draftNumber);
	};

	const handleNewDraft = async () => {
		const timestamp = Date.now();
		try {
			const res = await fetch('/api/user/update-drafts', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					timestamp: timestamp,
				}),
			});

			const resBody = (await res.json()) as APIResponse<string>;

			if (res.ok && resBody.success) {
				router.push('/editor?draftNumber=' + timestamp);
			} else if (!resBody.success) {
				throw new Error(resBody.error);
			}
		} catch (error: any) {
			console.log('Error creating new draft:', error.message);
		}
	};

	return (
		<div>
			<header>
				{user ? (
					<Navbar
						user={true}
						username={username}
						onSignOut={handleSignOut}
						navLinks={[
							{ label: 'Home', href: '/' },
							{ label: 'Profile', href: '/profile'},
                            { label: "Drafts", href: "/saveddrafts"}
						]}
					/>
				) : (
					<Navbar
						user={false}
						navLinks={[
							{ label: 'Log In', href: '/login' },
							{ label: 'Sign Up', href: '/signup' },
						]}
					/>
				)}
			</header>
			<main className="mx-auto max-w-screen-xl p-8">
				<LoadingSpinner show={isLoading} />
				<div className="flex gap-10">
					<h1 className="text-2xl sm:text-5xl"> Templates </h1>
				</div>

			</main>
			<footer></footer>
		</div>
	);
}
