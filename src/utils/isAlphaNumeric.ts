// Taken from https://stackoverflow.com/a/25352300
export default function isAlphaNumeric(str: string) {
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (
      !(code > 47 && code < 58) && // numeric (0-9)
      !(code > 64 && code < 91) && // upper alpha (A-Z)
      !(code > 96 && code < 123)
    ) {
      // lower alpha (a-z)
      return false;
    }
  }
  return true;
}
