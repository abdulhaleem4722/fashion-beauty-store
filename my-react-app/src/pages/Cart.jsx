import { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();


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
                        onClick={() => navigate("/checkout")}
                        className="mt-4 w-full rounded-xl bg-gray-900 py-3 text-white font-semibold hover:bg-gray-800 transition-colors"
                    >
                        Proceed to Checkout
                    </button>
                </>
            )}
        </section>
    );
}

export default Cart;