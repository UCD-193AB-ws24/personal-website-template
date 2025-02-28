import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, db } from '@lib/firebase/firebaseAdmin';
import { APIResponse } from '@customTypes/apiResponse';
import { FieldValue } from 'firebase-admin/firestore';


// POST /api/db/drafts/increae-view-count
// Update drafts viewCount by 1
export async function POST(req: NextRequest) {
    try {
        // Get the username
        const searchParams = req.nextUrl.searchParams;
        const username = searchParams.get('username');
        if (username === null) {
            throw new Error(
                "No username found in the request's query parameters"
            );
        }

        // Get the uid of the corresponding username
        const usersRef = db.collection('users');
        const usersQuery = usersRef.where("username", "==", username);
        const usersSnapshot = await usersQuery.get();
        if (usersSnapshot.docs.length === 0) {
            throw new Error("No user found");
        }
        const uid = usersSnapshot.docs[0].id;

        if (!("publishedDraftNumber" in usersSnapshot.docs[0].data())) {
            throw new Error("No published draft found")
        }
        const publishedDraftNumber = usersSnapshot.docs[0].data().publishedDraftNumber;

        const draftsRef = db.collection('drafts');
        const draftQuery = draftsRef.where(
            'draftId',
            '==',
            `${uid}-${publishedDraftNumber}`
        );

        const draftSnapshot = await draftQuery.get();


        if (!draftSnapshot.empty) {

            const docRef = draftSnapshot.docs[0].ref;

            await docRef.update({
                views: FieldValue.increment(1),
            });

        } else {
            throw new Error("No draft found.")
        }


    } catch (error: any) {
        console.log('Error updating view:', error.message);
    }
}
