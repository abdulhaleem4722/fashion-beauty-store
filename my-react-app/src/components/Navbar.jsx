import { Link, useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";

function Navbar() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchTerm(params.get("search") || "");
    setMenuOpen(false); // page badalte hi mobile menu band ho jaye
  }, [location]);

  useEffect(() => {
    if (!currentUser) {
      setCartCount(0);
      return;
    }

    const cartRef = collection(db, "users", currentUser.uid, "cart");
    const unsubscribe = onSnapshot(cartRef, (snapshot) => {
      const totalQty = snapshot.docs.reduce(
        (sum, doc) => sum + Number(doc.data().quantity || 1),
        0
      );
      setCartCount(totalQty);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate("/products");
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
        {/* Top row: logo + icons */}
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/"
            className="text-xl sm:text-2xl font-extrabold text-pink-600 shrink-0 tracking-tight"
          >
            FashionBeauty
          </Link>

          {/* Desktop search - hidden on mobile */}
          <form
            onSubmit={handleSearch}
            className="hidden md:block flex-1 max-w-md mx-4"
          >
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                🔍
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for products, brands..."
                className="w-full rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:bg-white transition"
              />
            </div>
          </form>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-5">
            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-pink-600 transition">
              Home
            </Link>
            <Link to="/products" className="text-sm font-medium text-gray-600 hover:text-pink-600 transition">
              Shop
            </Link>

            {currentUser ? (
              <>
                <Link to="/orders" className="text-sm font-medium text-gray-600 hover:text-pink-600 transition">
                  Orders
                </Link>

                <Link to="/cart" className="relative text-gray-600 hover:text-pink-600 transition">
                  <span className="text-xl">🛒</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-pink-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>

                <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 text-sm font-bold">
                  {currentUser.email.charAt(0).toUpperCase()}
                </div>

                <button
                  onClick={handleLogout}
                  className="bg-pink-600 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-pink-700 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-pink-600 text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-pink-700 transition"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile: cart icon + hamburger */}
          <div className="flex md:hidden items-center gap-4">
            {currentUser && (
              <Link to="/cart" className="relative text-gray-600">
                <span className="text-xl">🛒</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-pink-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-700 text-2xl leading-none p-1"
              aria-label="Menu"
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile search - always visible below logo row */}
        <form onSubmit={handleSearch} className="mt-3 md:hidden">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
        </form>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-gray-100 flex flex-col gap-1">
            <Link
              to="/"
              className="px-2 py-2.5 text-sm font-medium text-gray-700 hover:bg-pink-50 rounded-lg"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="px-2 py-2.5 text-sm font-medium text-gray-700 hover:bg-pink-50 rounded-lg"
            >
              Shop
            </Link>

            {currentUser ? (
              <>
                <Link
                  to="/orders"
                  className="px-2 py-2.5 text-sm font-medium text-gray-700 hover:bg-pink-50 rounded-lg"
                >
                  My Orders
                </Link>
                <div className="px-2 py-2.5 text-sm text-gray-500 flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 text-xs font-bold">
                    {currentUser.email.charAt(0).toUpperCase()}
                  </div>
                  {currentUser.email}
                </div>
                <button
                  onClick={handleLogout}
                  className="mt-1 bg-pink-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-pink-700 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="mt-1 bg-pink-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-pink-700 transition text-center"
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;