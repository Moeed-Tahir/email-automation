"use client";
import { useEffect } from "react";
import axios from "axios";

export default function LinkedInCallback() {
    useEffect(() => {
        const code = new URLSearchParams(window.location.search).get("code");

        if (code) {
            axios
                .post("http://localhost:3000/api/routes/User?action=linkedInCallback", { code })
                .then((res) => {
                    console.log("Login success:", res.data);
                })
                .catch((err) => {
                    console.error("Login error:", err);
                });
        }
    }, []);

    return <div>Processing LinkedIn login...</div>;
}
