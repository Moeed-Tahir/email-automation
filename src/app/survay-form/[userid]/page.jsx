"use client";
import { Suspense } from 'react';

import SurveyForm from '@/components/SurvayForm';
import {  useSearchParams } from 'next/navigation';

const Page = () => {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const survayFormId = searchParams.get("surveyId");
  
  return <SurveyForm userId={userId} survayFormId={survayFormId} />;
};

export default Page;