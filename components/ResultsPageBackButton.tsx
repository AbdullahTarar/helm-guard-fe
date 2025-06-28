// components/ResultsPageBackButton.tsx
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ResultsPageBackButtonProps {
  isPrivateRepo: boolean;
}

export const ResultsPageBackButton = ({ isPrivateRepo }: ResultsPageBackButtonProps) => {
  const backLink = isPrivateRepo ? "/repositories" : "/";
  const backText = isPrivateRepo ? "Back to repositories" : "Back to home";
  
  return (
    <Link href={backLink} className="flex items-center space-x-2">
      <ArrowLeft className="h-4 w-4" />
      <span className="text-sm font-medium">{backText}</span>
    </Link>
  );
};