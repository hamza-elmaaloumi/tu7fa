'use client';
import { useState } from 'react';
import axios from 'axios';

export default function RefreshButton() {
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://192.168.1.110:8000/inventory/item');
            console.log(res.data); // here you can do something, like update a global store
        } catch (err: any) {
            console.log(err.response.data);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className="bg-blue-500 hover:opacity-80 text-white px-6 py-3 rounded-8 font-medium mb-12 transition-opacity"
        >
            {loading ? 'Refreshing...' : 'Refresh'}
        </button>
    );
}