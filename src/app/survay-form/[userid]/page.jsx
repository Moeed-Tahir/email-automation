"use client";
import { Suspense } from 'react';

import SurveyForm from '@/components/SurvayForm';
import {  useSearchParams } from 'next/navigation';

const Page = () => {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  
  return <SurveyForm userId={userId} />;
};

export default Page;