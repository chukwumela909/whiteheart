"use client";

import { useState } from "react";
import { compressImages, formatBytes, DEFAULT_MAX_SIZE_BYTES } from "@/lib/imageCompression";

interface ImageCompressPromptProps {
    isOpen: boolean;
    files: File[];
    maxSizeBytes?: number;
    onCancel: () => void;
    onComplete: (compressedFiles: File[]) => void;
}

export default function ImageCompressPrompt({
    isOpen,
    files,
    maxSizeBytes = DEFAULT_MAX_SIZE_BYTES,
    onCancel,
    onComplete,
}: ImageCompressPromptProps) {
    const [isCompressing, setIsCompressing] = useState(false);
    const [percent, setPercent] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");

    if (!isOpen) return null;

    const handleCompress = async () => {
        setIsCompressing(true);
        setErrorMessage("");
        setPercent(0);

        try {
            const results = await compressImages([...files], { maxSizeBytes }, (fraction) =>
                setPercent(Math.round(fraction * 100))
            );
            setPercent(100);
            setIsCompressing(false);
            onComplete(results.map((r) => r.file));
        } catch (error: any) {
            setIsCompressing(false);
            setErrorMessage(error.message || "Compression failed. Please try a smaller image.");
        }
    };

    const handleCancel = () => {
        setErrorMessage("");
        setPercent(0);
        onCancel();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={isCompressing ? undefined : handleCancel}></div>
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-[scale-up_0.2s_ease-out]">
                {isCompressing ? (
                    <div className="flex flex-col items-center py-4">
                        <div className="relative w-20 h-20 mb-4">
                            <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
                                <circle cx="40" cy="40" r="34" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                                <circle
                                    cx="40"
                                    cy="40"
                                    r="34"
                                    fill="none"
                                    stroke="#000"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={2 * Math.PI * 34}
                                    strokeDashoffset={2 * Math.PI * 34 * (1 - percent / 100)}
                                    style={{ transition: "stroke-dashoffset 0.15s ease-out" }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center font-bold font-simon text-lg">
                                {percent}%
                            </div>
                        </div>
                        <p className="font-semibold font-simon">
                            Compressing {files.length > 1 ? `${files.length} images` : "image"}…
                        </p>
                        <p className="text-sm text-gray-500 font-simon mt-1">This only takes a moment.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-center mb-4">
                            <div className="bg-amber-100 rounded-full p-3">
                                <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-center mb-2 font-dancing">
                            Image{files.length > 1 ? "s" : ""} too large
                        </h2>
                        <p className="text-center text-gray-600 font-simon mb-4">
                            Max upload size is {formatBytes(maxSizeBytes)} per image.
                        </p>

                        <ul className="space-y-2 mb-4 max-h-36 overflow-y-auto">
                            {files.map((file, index) => (
                                <li
                                    key={index}
                                    className="flex items-center justify-between gap-3 text-sm bg-gray-50 rounded-lg px-3 py-2 font-simon"
                                >
                                    <span className="truncate">{file.name}</span>
                                    <span className="text-red-600 font-semibold flex-shrink-0">{formatBytes(file.size)}</span>
                                </li>
                            ))}
                        </ul>

                        {errorMessage && (
                            <p className="text-sm text-red-600 font-simon mb-4 text-center">{errorMessage}</p>
                        )}

                        <p className="text-sm text-gray-600 font-simon mb-6 text-center">
                            We can shrink {files.length > 1 ? "these" : "this"} automatically by resizing to a
                            web-friendly resolution and re-encoding at high quality — it&apos;ll stay sharp.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={handleCancel}
                                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-simon hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCompress}
                                className="flex-1 px-6 py-3 bg-black text-white rounded-lg font-simon hover:bg-gray-800 transition-colors"
                            >
                                Compress & Add
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
