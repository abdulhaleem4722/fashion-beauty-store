import { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";

function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeCart = null;

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (!user) {
                setCartItems([]);
                setLoading(false);
                if (unsubscribeCart) unsubscribeCart();
                return;
            }

            const cartColRef = collection(db, "users", user.uid, "cart");

            unsubscribeCart = onSnapshot(
                cartColRef,
                (snapshot) => {
                    const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
                    setCartItems(items);
                    setLoading(false);
                },
                (error) => {
                    alert(error.message);
                    setLoading(false);
                }
            );
        });

        return () => {
            if (unsubscribeCart) unsubscribeCart();
            unsubscribeAuth();
        };
    }, []);

    const handleRemove = async (id) => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            await deleteDoc(doc(db, "users", user.uid, "cart", id));
        } catch (error) {
            alert(error.message);
        }
    };

    const handleQuantityChange = async (item, type) => {
        const user = auth.currentUser;
        if (!user) return;

        const ref = doc(db, "users", user.uid, "cart", item.id);
        const currentQty = Number(item.quantity || 1);
        const newQty = type === "inc" ? currentQty + 1 : currentQty - 1;

        try {
            if (newQty <= 0) {
                await deleteDoc(ref);
            } else {
                await updateDoc(ref, { quantity: newQty });
            }
        } catch (error) {
            alert(error.message);
        }
    };

    const total = cartItems.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
        0
    );

    const handleWhatsAppOrder = () => {
        const phoneNumber = "923005158730"; // +92 300 5158730 (WhatsApp format, no + or spaces)

        const itemLines = cartItems
            .map(
                (item) =>
                    `- ${item.title} (Qty: ${item.quantity || 1}) - Rs. ${
                        Number(item.price) * Number(item.quantity || 1)
                    }`
            )
            .join("\n");

        const message = `Hi! I'd like to place an order:\n\n${itemLines}\n\n*Total: Rs. ${total}*`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

        window.open(whatsappUrl, "_blank");
    };

    return (
        <section className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-semibold text-gray-900">My Cart</h2>
                <span className="text-sm text-pink-600 font-medium">
                    {cartItems.length} items
                </span>
            </div>

            {loading ? (
                <p className="text-gray-500">Loading cart...</p>
            ) : cartItems.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">Your cart is empty 🛍️</p>
                    <p className="text-gray-400 text-sm mt-1">
                        Add some products to see them here.
                    </p>
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        {cartItems.map((item) => (
                            <div
                                key={item.id}
                                className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-gray-200 p-4 hover:border-pink-200 transition-colors"
                            >
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="h-20 w-20 rounded-lg object-cover bg-gray-100"
                                />

                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                                    <p className="text-sm text-pink-600 font-medium">Rs. {item.price}</p>

                                    <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-pink-200 px-2 py-1">
                                        <button
                                            onClick={() => handleQuantityChange(item, "dec")}
                                            className="h-7 w-7 rounded-md border border-pink-200 text-pink-600 hover:bg-pink-50 font-semibold"
                                        >
                                            -
                                        </button>
                                        <span className="min-w-12 text-center text-sm font-medium text-gray-700">
                                            Qty: {item.quantity || 1}
                                        </span>
                                        <button
                                            onClick={() => handleQuantityChange(item, "inc")}
                                            className="h-7 w-7 rounded-md border border-pink-200 text-pink-600 hover:bg-pink-50 font-semibold"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleRemove(item.id)}
                                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex items-center justify-between rounded-xl bg-pink-600 px-5 py-4">
                        <p className="text-white/90 font-medium">Total Amount</p>
                        <h3 className="text-2xl font-bold text-white">Rs. {total}</h3>
                    </div>

                    <button
                        onClick={handleWhatsAppOrder}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 py-3 text-white font-semibold hover:bg-green-600 transition-colors"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-5 h-5"
                        >
                            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.86 9.86 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm5.85 14.02c-.25.7-1.25 1.29-2.03 1.46-.53.11-1.24.2-3.6-.77-3.02-1.25-4.97-4.32-5.12-4.52-.15-.2-1.23-1.63-1.23-3.12 0-1.48.78-2.21 1.05-2.52.27-.3.6-.38.8-.38h.57c.18 0 .42-.02.65.5.25.6.86 2.08.93 2.23.07.15.12.33.02.53-.1.2-.15.32-.3.5-.15.17-.32.38-.45.51-.15.15-.31.31-.13.61.18.3.79 1.31 1.7 2.12 1.17 1.04 2.15 1.37 2.46 1.52.31.15.49.13.67-.08.18-.2.77-.9.98-1.21.2-.3.4-.25.68-.15.28.1 1.76.83 2.06.98.3.15.5.23.57.35.08.13.08.75-.17 1.44z" />
                        </svg>
                        Order via WhatsApp
                    </button>
                </>
            )}
        </section>
    );
}

export default Cart;