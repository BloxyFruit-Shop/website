import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export default (...inputs) => {
  return twMerge(clsx(inputs))
}