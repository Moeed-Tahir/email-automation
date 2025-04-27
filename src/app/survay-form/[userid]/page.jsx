"use client";

import SurveyForm from '@/components/SurvayForm';
import { useParams } from 'next/navigation';

const Page = () => {
  const params = useParams();
  const userId = params.userid;

  return <SurveyForm userId={userId} />;
};

export default Page;