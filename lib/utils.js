import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using `clsx` and merges them using `twMerge`.
 *
 * @param {...(string|Array<string>|object)} inputs - A list of class names or conditions to combine.
 * @returns {string} The merged class names after applying `clsx` and `twMerge`.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
