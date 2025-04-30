"use client"

import ReceiptUpload from '@/components/ReceiptUpload';
import { useSearchParams } from 'next/navigation';
import React, { Suspense } from 'react'

const PageContent = () => {
  const searchParams = useSearchParams();
  const mainUserId = searchParams.get('mainUserId');
  const surveyId = searchParams.get('surveyId');
  return (
    <ReceiptUpload mainUserId={mainUserId} surveyId={surveyId} />
  )
}

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  )
}

export default Page;