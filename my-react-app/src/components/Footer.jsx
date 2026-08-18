import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <h3 className="text-xl font-bold text-pink-600">A to Z Cosmetics</h3>
          <p className="text-sm text-gray-500 mt-3 leading-relaxed">
            Your one-stop shop for makeup, skincare & haircare essentials.
            Quality products, delivered to your doorstep.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li>
              <Link to="/" className="hover:text-pink-600">Home</Link>
            </li>
            <li>
              <Link to="/products" className="hover:text-pink-600">Shop</Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-pink-600">Cart</Link>
            </li>
            <li>
              <Link to="/orders" className="hover:text-pink-600">My Orders</Link>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Categories</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li>
              <Link to="/products?category=Makeup" className="hover:text-pink-600">
                Makeup
              </Link>
            </li>
            <li>
              <Link to="/products?category=Skincare" className="hover:text-pink-600">
                Skincare
              </Link>
            </li>
            <li>
              <Link to="/products?category=Haircare" className="hover:text-pink-600">
                Haircare
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Stay Updated</h4>
          <p className="text-sm text-gray-500 mb-3">
            Subscribe for offers & new arrivals.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Thanks for subscribing! 🎉");
              e.target.reset();
            }}
            className="flex gap-2"
          >
            <input
              type="email"
              placeholder="Your email"
              required
              className="flex-1 min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
            <button
              type="submit"
              className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700 transition"
            >
              Join
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-gray-100 py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} shishamdev@ All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;