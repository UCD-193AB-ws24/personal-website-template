import isAlphaNumeric from "@utils/isAlphaNumeric";

export default function isValidUsername(username: string): string {
  // For now, arbitrarily, usernames have to have 1-20 characters (inclusive)
  if (username.length < 1) {
    return "Usernames must be at least 1 character long.";
  } else if (username.length > 20) {
    return "Usernames can be at most 20 characters long.";
  } else if (!isAlphaNumeric(username)) {
    return "Usernames can only contain letters and numbers.";
  }

  return "";
}
