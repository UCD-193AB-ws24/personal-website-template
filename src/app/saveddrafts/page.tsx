'use client';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@lib/firebase/firebaseApp';
import { signUserOut } from '@lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { Ref, useEffect, useState } from 'react';
import { APIResponse } from '@customTypes/apiResponse';
import Navbar from '@components/Navbar';
import LoadingSpinner from '@components/LoadingSpinner';
import { EllipsisVertical, PenLine, Trash2 } from "lucide-react";
import useComponentVisible from '@lib/hooks/useComponentVisible';


export default function SavedDrafts() {
	const [user] = useAuthState(auth);
	const [username, setUsername] = useState('');
	const [draftMappings, setDraftMappings] = useState<Array<{id: number, name: string}>>([]);
	const [isModalHidden, setIsModalHidden] = useState(true);
  const [isSpecificEditMenuVisible, setIsSpecificEditMenuVisible] = useState(-1);
  const [selectedDraft, setSelectedDraft] = useState<{id: number, name: string}>();
  const [newDraftName, setNewDraftName] = useState("");
	const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {ref, isComponentVisible: isEditMenuVisible, setIsComponentVisible: setIsEditMenuVisible} = useComponentVisible(false);

	useEffect(() => {
		if (user) {
			getDraftMappings();
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
		try {
			const response = await fetch('/api/user/username', {
				headers: {
					'Content-Type': 'application/json',
				},
			});

			const resBody = (await response.json()) as APIResponse<string>;

			if (response.ok && resBody.success) {
				setUsername(resBody.data);
			} else {
				throw new Error('Unknown username');
			}
		} catch (error: any) {
			setUsername('Unknown');
			router.push('/setusername');
			console.log(error.message);
		}
	};

	const getDraftMappings = () => {
    setIsLoading(true);
		fetch('/api/user/get-drafts', {
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.success) {
					setDraftMappings(res.data);
          setIsLoading(false);
				} else {
					throw new Error(res.error);
				}
			})
			.catch((error) => {
				console.log(error.message);
        setIsLoading(false);
			});
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

  const handleDeleteDraft = async (draftNumber: number) => {
    setIsLoading(true);
    try {
			const res = await fetch('/api/user/delete-draft', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					draftNumber: draftNumber,
				}),
			});

			const resBody = (await res.json()) as APIResponse<string>;

			if (res.ok && resBody.success) {
				setDraftMappings((original) => original.filter((d) => d.id !== draftNumber));
			} else if (!resBody.success) {
				throw new Error(resBody.error);
			}
      setIsLoading(false);
		} catch (error: any) {
			console.log('Error creating new draft:', error.message);
      setIsLoading(false);
		} 
  }

  const handleRenameDraft = async (draftNumber: number, oldName: string, newName: string) => {
    setIsLoading(true);
    try {
			const res = await fetch('/api/user/rename-draft', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					number: draftNumber,
          oldName: oldName,
          newName: newName,
				}),
			});

			const resBody = (await res.json()) as APIResponse<string>;

			if (res.ok && resBody.success) {
				setDraftMappings((original) => original.map((d) => {
          if (d.id === draftNumber) {
            d.name = newName
          }
          return d
        }));
			} else if (!resBody.success) {
				throw new Error(resBody.error);
			}
      setIsLoading(false);
		} catch (error: any) {
			console.log('Error creating new draft:', error.message);
      setIsLoading(false);
		} 
    setIsModalHidden(true);
    setNewDraftName("");
    setSelectedDraft(undefined);
  }

	return (
		<div>
			<header>
				{user ? (
					<Navbar
						user={true}
						onSignOut={handleSignOut}
						navLinks={[{ label: 'Home', href: '/' }]}
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
					<p className="text-2xl sm:text-5xl"> Saved Drafts </p>
					<button
						onClick={handleNewDraft}
						className="bg-[#f08700] hover:bg-[#d67900] transition duration-300 text-white font-bold py-2 px-4 rounded-full border-none text-[#111827]"
					>
						New Draft
					</button>
				</div>

				<div
					id="draftsContainer"
					className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 justify-evenly gap-4 mt-12"
				>
					{draftMappings.map((d, i) => {
						return (
              <div 
                key={i}
                className="flex flex-col justify-between justify-self-center w-[250px] sm:w-full h-[350px] border-2 border-black shadow-lg hover:bg-[#111827] hover:text-[#f08700] transition duration-300"
              >
                <button
                  key={i}
                  onClick={() => loadEditor(d.id.toString())}
                  className="h-full"
                >
                  {d.name}
                </button>
                <div className="flex relative justify-between items-center p-2 h-[40px] border-t border-black bg-[#1f2c47]">
                  <p
                    className="text-white"
                  >
                    {d.name}
                  </p>
                  <button
                    className="text-white hover:rounded-full"
                    onClick={() => { setIsEditMenuVisible(true); setIsSpecificEditMenuVisible(d.id)} }
                  >
                    <EllipsisVertical size={24} color="#f08700" />
                  </button>
                  <div ref={ref as Ref<HTMLDivElement> | undefined} style={{display: (isEditMenuVisible && isSpecificEditMenuVisible === d.id) ? "flex" : "none"}} className="flex flex-col justify-evenly absolute z-10 right-[-25px] bottom-[35px] w-[100px] h-[100px] border border-black bg-white">
                    <button onClick={() => handleDeleteDraft(d.id)} className="flex justify-evenly items-center text-black hover:text-black">
                      <Trash2 size={16} />
                      <p>Remove</p>
                    </button>
                    <button onClick={() => {setIsModalHidden(false); setSelectedDraft(d)}} className="flex justify-evenly items-center text-black hover:text-black">
                      <PenLine size={16} />
                      <p>Rename</p>
                    </button>
                  </div>
                </div>
              </div>
						);
					})}
				</div>
        <div style={{display: isModalHidden ? 'none' : 'flex'}} className="fixed inset-0 flex flex-col justify-center items-center bg-gray-900 bg-opacity-50 z-50">
          <div className="center flex flex-col gap-4 mt-5 w-3/4 md:w-1/3 lg:w-1/4 mx-auto bg-gray-100 p-10 rounded-lg">
            <p className="text-lg">Rename</p>
            <form
              className="grid gap-4 w-full" onSubmit={(e) => {e.preventDefault(); handleRenameDraft(selectedDraft!.id, selectedDraft!.name, newDraftName)}}>
                  <input
                      type="text"
                      placeholder="New Name"
                      value={newDraftName}
                      onChange={(e) => setNewDraftName(e.target.value)}
                      required
                      className="p-2 border rounded w-full"
                  />
                  <div className='flex justify-end gap-4'>
                    <button onClick={() => {setIsModalHidden(true); setNewDraftName(""); setSelectedDraft(undefined)} } className="px-4 py-2 border border-red-500 text-red-500 rounded-md cursor-pointer hover:bg-red-200 transition duration-200 ease-in-out">
                      Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-md cursor-pointer hover:bg-green-600 transition duration-200 ease-in-out">
                      Confirm
                    </button>
                  </div>
              </form>
          </div>
        </div>
			</main>
			<footer></footer>
		</div>
	);
}
