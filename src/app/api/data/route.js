import { News, Transaction, connectDB } from "@/components/backend/mongodb";
import locations from '../../data/locations.json';

export const dynamic = 'force-dynamic'; // Required for revalidation to work properly


export const GET = async () => {
    await connectDB();

    const transactions = await Transaction.countDocuments();
    const newsCount = await News.countDocuments();
    // get the last document from the news collection
    const news = await News.findOne().sort({ _id: -1 });
    const places = locations.slice(0, newsCount);


    return new Response(JSON.stringify({
        transactions,
        places,
        news,
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',  // Disable caching
        },
    });
};