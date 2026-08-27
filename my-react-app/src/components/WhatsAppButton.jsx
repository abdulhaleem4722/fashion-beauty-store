import React from "react";

const WhatsAppButton = () => {
    const phoneNumber = "923005158730"; // 92 + number without leading 0
    const message = "Hi! I have a query about A to Z Cosmetics.";

    const handleClick = () => {
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank");
    };

    return (
        <button
            onClick={handleClick}
            aria-label="Chat on WhatsApp"
            className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50
           flex items-center justify-center
           w-12 h-12 sm:w-14 sm:h-14
           bg-[#25D366] hover:bg-[#1ebe5d]
           rounded-full shadow-lg
           transition-transform duration-200 hover:scale-110">
            <svg viewBox="0 0 32 32" className="w-6 h-6 sm:w-7 sm:h-7" fill="white">
                <path d="M16 .5C7.44.5.5 7.44.5 16c0 2.8.74 5.43 2.02 7.7L.5 31.5l7.98-2.1A15.44 15.44 0 0 0 16 31.5c8.56 0 15.5-6.94 15.5-15.5S24.56.5 16 .5zm0 28.2c-2.5 0-4.83-.73-6.79-1.99l-.49-.3-4.73 1.24 1.26-4.6-.32-.48A12.68 12.68 0 0 1 3.3 16C3.3 9.01 9.01 3.3 16 3.3S28.7 9.01 28.7 16 22.99 28.7 16 28.7zm7-9.6c-.38-.19-2.26-1.11-2.6-1.24-.35-.13-.6-.19-.86.19-.25.38-.98 1.24-1.2 1.5-.22.25-.44.28-.82.1-.38-.19-1.6-.59-3.05-1.88-1.13-1-1.89-2.24-2.11-2.62-.22-.38-.02-.58.17-.77.17-.17.38-.44.57-.66.19-.22.25-.38.38-.63.13-.25.06-.47-.03-.66-.1-.19-.86-2.07-1.18-2.84-.31-.75-.63-.65-.86-.66h-.73c-.25 0-.66.1-1 .47-.35.38-1.32 1.29-1.32 3.15s1.35 3.65 1.54 3.9c.19.25 2.66 4.06 6.44 5.69.9.39 1.6.62 2.15.8.9.29 1.72.25 2.37.15.72-.11 2.26-.92 2.58-1.82.32-.9.32-1.67.22-1.83-.09-.16-.34-.25-.72-.44z" />
            </svg>
        </button>
    );
};

export default WhatsAppButton;