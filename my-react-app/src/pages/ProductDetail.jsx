import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { db, auth } from "../firebase/firebase";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const ref = doc(db, "products", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const productData = { id: snap.id, ...snap.data() };
          setProduct(productData);

          // Related products fetch karo (same category, current product ke ilawa)
          const allSnap = await getDocs(collection(db, "products"));
          const all = allSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
          const related = all
            .filter(
              (p) => p.category === productData.category && p.id !== productData.id
            )
            .sort(() => 0.5 - Math.random())
            .slice(0, 4);
          setRelatedProducts(related);
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = async (targetProduct) => {
    const user = auth.currentUser;

    if (!user) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    setAdding(true);

    try {
      const cartRef = doc(db, "users", user.uid, "cart", targetProduct.id);
      const existing = await getDoc(cartRef);
      const prevQty = existing.exists() ? Number(existing.data().quantity || 1) : 0;

      await setDoc(
        cartRef,
        {
          productId: targetProduct.id,
          title: targetProduct.title || "",
          price: Number(targetProduct.price) || 0,
          image: targetProduct.image || "",
          category: targetProduct.category || "",
          quantity: prevQty + 1,
        },
        { merge: true }
      );
    } catch (error) {
      alert(error.message);
    } finally {
      setAdding(false);
    }
  };

  const handleWhatsAppOrder = (targetProduct) => {
    const phoneNumber = "923005158730"; // +92 300 5158730 (WhatsApp format, no + or spaces)
    const productUrl = `${window.location.origin}/product/${targetProduct.id}`;

    const message = `Hi! I'm interested in this product:

*${targetProduct.title}*
Price: Rs. ${targetProduct.price}
${productUrl}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
  };

  if (loading) {
    return <p className="text-gray-500 p-6">Loading product...</p>;
  }

  if (!product) {
    return (
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-10 text-center">
        <p className="text-gray-500 text-lg">Product not found 😕</p>
        <Link
          to="/products"
          className="mt-4 inline-block text-pink-600 font-medium hover:underline"
        >
          ← Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate("/products")}
        className="inline-flex items-center gap-2 rounded-full bg-white border border-gray-200 shadow-sm px-4 py-2 text-sm font-medium text-gray-700 hover:bg-pink-50 hover:border-pink-200 hover:text-pink-600 transition"
      >
        ← Back to Products
      </button>

      {/* Main product section */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="rounded-xl overflow-hidden bg-gray-100">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-96 object-cover"
            />
          </div>

          <div className="flex flex-col">
            <span className="inline-block w-fit rounded-full bg-pink-100 text-pink-700 text-xs font-medium px-3 py-1 mb-3">
              {product.category}
            </span>

            <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>

            <p className="text-3xl font-bold text-pink-600 mt-4">
              Rs. {product.price}
            </p>

            <p className="text-gray-500 mt-4 leading-relaxed">
              {product.description ||
                `Premium quality ${product.title} from our ${product.category} collection. Crafted with care to bring out your natural beauty.`}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleAddToCart(product)}
                disabled={adding}
                className="flex-1 rounded-xl bg-pink-600 px-8 py-3.5 text-white font-semibold hover:bg-pink-700 transition disabled:opacity-60"
              >
                {adding ? "Adding..." : "Add to Cart"}
              </button>

              <button
                onClick={() => handleWhatsAppOrder(product)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-8 py-3.5 text-white font-semibold hover:bg-green-600 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.86 9.86 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm5.85 14.02c-.25.7-1.25 1.29-2.03 1.46-.53.11-1.24.2-3.6-.77-3.02-1.25-4.97-4.32-5.12-4.52-.15-.2-1.23-1.63-1.23-3.12 0-1.48.78-2.21 1.05-2.52.27-.3.6-.38.8-.38h.57c.18 0 .42-.02.65.5.25.6.86 2.08.93 2.23.07.15.12.33.02.53-.1.2-.15.32-.3.5-.15.17-.32.38-.45.51-.15.15-.31.31-.13.61.18.3.79 1.31 1.7 2.12 1.17 1.04 2.15 1.37 2.46 1.52.31.15.49.13.67-.08.18-.2.77-.9.98-1.21.2-.3.4-.25.68-.15.28.1 1.76.83 2.06.98.3.15.5.23.57.35.08.13.08.75-.17 1.44z" />
                </svg>
                Order on WhatsApp
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-gray-400">🚚 Delivery</p>
                <p className="text-gray-700 font-medium">2-4 business days</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-gray-400">💵 Payment</p>
                <p className="text-gray-700 font-medium">Cash on Delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-5">
            You may also like
          </h2>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((item) => (
              <div
                key={item.id}
                className="group rounded-xl border border-gray-200 bg-white p-3 shadow-sm hover:shadow-md hover:border-pink-200 transition"
              >
                <Link to={`/product/${item.id}`}>
                  <div className="relative overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-36 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-gray-900 line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-sm font-bold text-pink-600">Rs. {item.price}</p>
                </Link>

                <button
                  onClick={() => handleAddToCart(item)}
                  className="mt-2 w-full rounded-lg bg-pink-600 px-3 py-2 text-xs font-medium text-white hover:bg-pink-700 transition"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetail;