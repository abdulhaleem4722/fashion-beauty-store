import { useEffect, useState } from "react";
import { db, auth } from "../firebase/firebase";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { useSearchParams, Link } from "react-router-dom";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCategory = searchParams.get("category") || "All";
  const searchTerm = searchParams.get("search") || "";
  const categories = [
    "All",
    "Makeup",
    "Party Items",
    "Bangles",
    "Facial Products",
    "Electronic",
    "Hair Care",
    "Mix Brand",
    "Skin Care",
    "Color Cosmetics",
    "Undergarments",
    "Shampoo",
    "Parfum",
    "Body Spray",
    "Hair Color",
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const list = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setProducts(list);
      } catch (error) {
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (product) => {
    const user = auth.currentUser;

    if (!user) {
      alert("Please login first");
      return;
    }

    setAddingId(product.id);

    try {
      const cartRef = doc(db, "users", user.uid, "cart", product.id);
      const existing = await getDoc(cartRef);

      const prevQty = existing.exists() ? Number(existing.data().quantity || 1) : 0;
      const newQty = prevQty + 1;

      await setDoc(
        cartRef,
        {
          productId: product.id,
          title: product.title || "",
          price: Number(product.onSale ? product.salePrice : product.price) || 0,
          image: product.image || "",
          category: product.category || "",
          quantity: newQty,
        },
        { merge: true }
      );
    } catch (error) {
      alert(error.message);
    } finally {
      setAddingId(null);
    }
  };

  // Pehle category se filter, phir search se filter
  const filteredProducts = products
    .filter((p) => activeCategory === "All" || p.category === activeCategory)
    .filter((p) =>
      searchTerm.trim() === ""
        ? true
        : p.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleCategoryClick = (cat) => {
    const params = {};
    if (cat !== "All") params.category = cat;
    if (searchTerm) params.search = searchTerm;
    setSearchParams(params);
  };

  const clearSearch = () => {
    const params = {};
    if (activeCategory !== "All") params.category = activeCategory;
    setSearchParams(params);
  };

  return (
    <section className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-semibold text-gray-900">Products</h2>
        <span className="text-sm text-pink-600 font-medium">
          {filteredProducts.length} items
        </span>
      </div>

      {/* Search indicator */}
      {searchTerm && (
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
          <span>
            Showing results for: <strong>"{searchTerm}"</strong>
          </span>
          <button
            onClick={clearSearch}
            className="text-pink-600 hover:underline"
          >
            Clear ✕
          </button>
        </div>
      )}

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 mb-6 overflow-hidden">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeCategory === cat
              ? "bg-pink-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-pink-50"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading products...</p>
      ) : filteredProducts.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((item) => (
            <div
              key={item.id}
              className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-pink-200 transition"
            >
              <Link to={`/product/${item.id}`}>
                <div className="relative overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-44 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-pink-600 shadow-sm">
                    {item.category}
                  </span>
                </div>

                <div className="mt-4 space-y-1">
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  {item.onSale ? (
                    <div className="flex items-center flex-wrap gap-2">
                      <p className="text-lg font-bold text-pink-600">Rs. {item.salePrice}</p>
                      <p className="text-sm text-gray-400 line-through">Rs. {item.price}</p>
                      <span className="text-xs font-semibold text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                        {item.discountPercent}% OFF
                      </span>
                    </div>
                  ) : (
                    <p className="text-lg font-bold text-pink-600">Rs. {item.price}</p>
                  )}
                </div>
              </Link>

              <button
                onClick={() => handleAddToCart(item)}
                disabled={addingId === item.id}
                className="mt-4 w-full rounded-lg bg-pink-600 px-4 py-2.5 text-white font-medium hover:bg-pink-700 active:scale-[0.99] transition disabled:opacity-60"
              >
                {addingId === item.id ? "Adding..." : "Add to Cart"}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Products;