export function convertStringToBoolean(str: string): boolean | undefined {
  if (str === "true") {
    return true;
  } else if (str === "false") {
    return false;
  } else {
    return undefined; // Or throw an error, or return a default value
  }
}
