import { APIResponse } from "@customTypes/apiResponse";
import { getFirebaseAuth } from "@lib/firebase/firebaseApp";

// Request memoization: https://nextjs.org/docs/app/building-your-application/caching#request-memoization
export async function fetchUsername() {
  return fetch("/api/user/username", {
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => {
      if (res.status === 401) {
        // Sign user out in the client side
        const auth = getFirebaseAuth();
        auth.signOut();
      }
      return res.json();
    })
    .then((res: APIResponse<string>) => {
      if (!res.success) {
        throw new Error(res.error);
      } else {
        return res.data;
      }
    })
    .catch((error) => {
      console.log(error.message);
      return "";
    });
}
