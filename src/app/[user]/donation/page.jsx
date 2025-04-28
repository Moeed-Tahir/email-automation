"use client";

import DonationTable from '@/components/donation-table';
import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useState, useEffect } from 'react';

const Page = () => {
    const [donationData, setDonationData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const userId = Cookies.get("userId");

    const getDonationData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.post("/api/routes/Admin?action=getDonation", {
                userId
            });

            if (response.data.success) {
                setDonationData(response.data.data);
            } else {
                setError(response.data.message || "Failed to fetch donations");
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message || "Failed to fetch donations");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getDonationData();
    }, []);

    return (
        <div>
            {loading ? (
                <p>Loading donations...</p>
            ) : error ? (
                <p className="text-red-500">Error: {error}</p>
            ) : (
                <div className="flex flex-col w-full bg-white rounded-xl p-4 border">
                    <DonationTable data={donationData} />
                </div>
            )}
        </div>
    )
}

export default Page;