import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { twMerge } from 'tailwind-merge';

interface ILoadingSpinnerProps {
    size      ?: number;
    className ?: string;
};

export const LoadingSpinner = ({ size = 20, className = '' } : ILoadingSpinnerProps) =>
   <AiOutlineLoading3Quarters size={size} className={twMerge("animate-spin text-blue-500", className)} />;
