"use client";
import AdminLogin from "@/components/admin-login";
import React, { useState, useEffect } from "react";      
import { Suspense } from 'react';



export default function Login() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminLogin />
    </Suspense>
  );
}
