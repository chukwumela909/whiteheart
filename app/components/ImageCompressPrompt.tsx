"use client";

import { useEffect, useMemo, useState } from "react";
import { compressImages, formatBytes, DEFAULT_MAX_SIZE_BYTES } from "@/lib/imageCompression";

interface ImageCompressPromptProps {
    isOpen: boolean;
    files: File[];
    maxSizeBytes?: number;
    onCancel: () => void;
    onComplete: (compressedFiles: File[]) => void;
}

type Status = "prompt" | "compressing" | "done" | "error";

export default function ImageCompressPrompt({
    isOpen,
    files,
    maxSizeBytes = DEFAULT_MAX_SIZE_BYTES,
    onCancel,
    onComplete,
}: ImageCompressPromptProps) {
    const [status, setStatus] = useState<Status>("prompt");
    const [percent, setPercent] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");
    const [savedBytes, setSavedBytes] = useState(0);

    // Thumbnails so the user can see exactly which photos are being touched.
    const thumbnails = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
    useEffect(() => {
        return () => thumbnails.forEach((url) => URL.revokeObjectURL(url));
    }, [thumbnails]);

    if (!isOpen) return null;

    const currentFile = files[Math.min(files.length - 1, Math.floor((percent / 100) * files.length))];

    const handleCompress = async () => {
        setStatus("compressing");
        setErrorMessage("");
        setPercent(0);

        try {
            const results = await compressImages([...files], { maxSizeBytes }, (fraction) =>
                setPercent(Math.round(fraction * 100))
            );
            setPercent(100);
            const totalBefore = results.reduce((sum, r) => sum + r.originalSize, 0);
            const totalAfter = results.reduce((sum, r) => sum + r.compressedSize, 0);
            setSavedBytes(totalBefore - totalAfter);
            setStatus("done");
            setTimeout(() => onComplete(results.map((r) => r.file)), 900);
        } catch (error: any) {
            setStatus("error");
            setErrorMessage(error.message || "Compression failed. Please try a smaller image.");
        }
    };

    const handleCancel = () => {
        setStatus("prompt");
        setErrorMessage("");
        setPercent(0);
        onCancel();
    };

    const canDismiss = status === "prompt" || status === "error";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={canDismiss ? handleCancel : undefined}></div>
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-[scale-up_0.2s_ease-out]">
                {canDismiss && (
                    <button
                        onClick={handleCancel}
                        aria-label="Close"
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}

                {status === "compressing" && (
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
                        <p className="font-semibold font-simon truncate max-w-full">
                            Compressing {currentFile?.name}
                        </p>
                        {files.length > 1 && (
                            <p className="text-sm text-gray-500 font-simon mt-1">
                                Image {Math.min(files.length, Math.floor((percent / 100) * files.length) + 1)} of {files.length}
                            </p>
                        )}
                    </div>
                )}

                {status === "done" && (
                    <div className="flex flex-col items-center py-6">
                        <div className="bg-green-100 rounded-full p-3 mb-4">
                            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="font-semibold font-simon">Done — ready to add</p>
                        {savedBytes > 0 && (
                            <p className="text-sm text-gray-500 font-simon mt-1">Saved {formatBytes(savedBytes)}</p>
                        )}
                    </div>
                )}

                {(status === "prompt" || status === "error") && (
                    <>
                        <div className="flex justify-center mb-4">
                            <div className="bg-blue-100 rounded-full p-3">
                                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-center mb-1 font-dancing">
                            Image{files.length > 1 ? "s" : ""} over the limit
                        </h2>
                        <p className="text-center text-gray-500 font-simon text-sm mb-4">
                            Max {formatBytes(maxSizeBytes)} per image — we can shrink{" "}
                            {files.length > 1 ? "these" : "this"} to fit, no visible quality loss.
                        </p>

                        <ul className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                            {files.map((file, index) => (
                                <li
                                    key={index}
                                    className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2"
                                >
                                    <img
                                        src={thumbnails[index]}
                                        alt=""
                                        className="w-10 h-10 rounded-md object-cover flex-shrink-0 bg-gray-200"
                                    />
                                    <span className="flex-1 min-w-0 truncate text-sm font-simon">{file.name}</span>
                                    <span className="flex-shrink-0 text-xs font-semibold text-red-600 bg-red-50 rounded-full px-2.5 py-1">
                                        {formatBytes(file.size)}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        {status === "error" && (
                            <p className="text-sm text-red-600 font-simon mb-4 text-center">{errorMessage}</p>
                        )}

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
