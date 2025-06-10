"use client";

import { getScheduledPosts } from "@/components/Service";
import { useEffect, useState } from "react";

interface Post {
    id: number;
    topic: string;
    title: string;
    content: string;
    day: string;
    platform: string;
    schedule_time: string;
}

export default function Menu1Page() {
    const [scheduledPosts, setScheduledPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getSchedulePosts = async () => {
            try {
                setLoading(true);
                const response = await getScheduledPosts();
                console.log("response", response);

                if (response.status === "success") {
                    setScheduledPosts(response.message.posts);
                } else {
                    setError("Failed to fetch posts. Please try again later.");
                    console.error("Failed to generate ideas:", response.message);
                }
            } catch (e) {
                setError("An unexpected error occurred.");
                console.error("Error fetching posts:", e);
            } finally {
                setLoading(false);
            }
        };

        getSchedulePosts();
    }, []);

    // Format schedule_time to a readable format
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="min-h-screen p-6 bg-gray-100">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
                Scheduled Posts
            </h1>

            {loading && (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
                </div>
            )}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {!loading && !error && scheduledPosts.length === 0 && (
                <div className="text-center text-gray-600 py-10">
                    No scheduled posts found.
                </div>
            )}

            {!loading && !error && scheduledPosts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {scheduledPosts.map((post) => (
                        <div
                            key={post.id}
                            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
                        >
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                {post.title}
                            </h2>
                            <p className="text-gray-600 mb-4 line-clamp-3">{post.content}</p>
                            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                                <span className="font-medium">Platform:</span>
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${post.platform.toLowerCase() === "twitter"
                                        ? "bg-blue-100 text-blue-600"
                                        : "bg-gray-100 text-gray-600"
                                        }`}
                                >
                                    {post.platform}
                                </span>
                            </div>
                            <div className="text-sm text-gray-500 mb-2">
                                <span className="font-medium">Day:</span> {post.day}
                            </div>
                            <div className="text-sm text-gray-500">
                                <span className="font-medium">Scheduled:</span>{" "}
                                {formatDate(post.schedule_time)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}