"use client";

interface ErrorModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message: string;
}

export default function ErrorModal({ isOpen, onClose, title = "Error", message }: ErrorModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-[scale-up_0.2s_ease-out]">
                {/* Error Icon */}
                <div className="flex justify-center mb-4">
                    <div className="bg-red-100 rounded-full p-3">
                        <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-center mb-2 font-dancing">{title}</h2>

                {/* Message */}
                <p className="text-center text-gray-600 font-simon mb-6">{message}</p>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-simon hover:bg-red-700 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
}
