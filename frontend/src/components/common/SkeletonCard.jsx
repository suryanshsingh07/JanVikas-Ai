import React from 'react';

export const SkeletonCard = ({ className = '' }) => {
    return (
        <div className={`p-5 rounded-xl border border-border bg-surface animate-pulse ${className}`}>
            <div className="flex justify-between items-start mb-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            </div>
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
    );
};

export const RecommendationSkeleton = () => (
    <div className="p-5 flex gap-4 animate-pulse">
        <div className="shrink-0 w-[80px] h-[80px] bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="flex-1 space-y-3"><div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div></div>
    </div>
);