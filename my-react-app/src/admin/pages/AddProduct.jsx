import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebase";

function AddProduct() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "Makeup",
    image: "",
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================
  // INPUT CHANGE
  // =========================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =========================
  // IMAGE UPLOAD
  // Cloudinary
  // =========================

  const handleImageChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Basic validation
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    setError("");
    setSuccess("");
    setUploadingImage(true);

    // Local preview
    const previewURL = URL.createObjectURL(file);
    setImagePreview(previewURL);

    try {
      const cloudPreset = "laptop_store";
      const cloudName = "dotj7pqvl";

      const data = new FormData();

      data.append("file", file);
      data.append("upload_preset", cloudPreset);
      data.append("cloud_name", cloudName);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: data,
        }
      );

      const cloudRes = await response.json();

      if (!response.ok || !cloudRes.secure_url) {
        throw new Error(
          cloudRes.error?.message || "Image upload failed."
        );
      }

      // Cloudinary URL Firebase mein save hoga
      setFormData((prev) => ({
        ...prev,
        image: cloudRes.secure_url,
      }));

      setSuccess("Image uploaded successfully.");
    } catch (err) {
      console.error("Cloudinary error:", err);

      setError(
        "Image upload failed: " + (err.message || "Unknown error")
      );

      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  // =========================
  // SAVE PRODUCT
  // Firebase Firestore
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Validation
    if (!formData.title.trim()) {
      setError("Product title is required.");
      return;
    }

    if (!formData.price || Number(formData.price) <= 0) {
      setError("Please enter a valid price.");
      return;
    }

    if (!formData.category) {
      setError("Please select a category.");
      return;
    }

    if (!formData.image) {
      setError("Please upload a product image.");
      return;
    }

    setSaving(true);

    try {
      // =========================
      // PRODUCT OBJECT
      // Same structure Products.jsx expects
      // =========================

      const productData = {
        title: formData.title.trim(),
        price: Number(formData.price),
        image: formData.image,
        category: formData.category,

        // Optional useful metadata
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Save to:
      // products/{auto-generated-document-id}

      const docRef = await addDoc(
        collection(db, "products"),
        productData
      );

      console.log("Product added:", docRef.id);

      setSuccess("Product added successfully!");

      // Reset form
      setFormData({
        title: "",
        price: "",
        category: "Makeup",
        image: "",
      });

      setImagePreview(null);

      // Dashboard par redirect
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1200);
    } catch (err) {
      console.error("Firebase error:", err);

      setError(
        "Product save failed: " + (err.message || "Unknown error")
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9]">

      {/* ================= HEADER ================= */}

      <header className="sticky top-0 z-50 bg-[#0B1220] text-white shadow-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">

          <div>
            <span className="font-mono text-[11px] tracking-[0.3em] text-[#C9A227]">
              PRODUCTS
            </span>

            <h1 className="text-lg font-semibold sm:text-xl">
              Add New Product
            </h1>
          </div>

          <Link
            to="/admin/dashboard"
            className="shrink-0 rounded-md border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:border-white/40 hover:bg-white/5"
          >
            ← Dashboard
          </Link>

        </div>
      </header>

      {/* ================= FORM ================= */}

      <div className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8">

        <div className="mx-auto max-w-3xl">

          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
          >

            {/* SUCCESS */}

            {success && (
              <div className="mb-6 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {success}
              </div>
            )}

            {/* ERROR */}

            {error && (
              <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* ================= PRODUCT DETAILS ================= */}

            <div>
              <span className="font-mono text-xs tracking-[0.3em] text-[#C9A227]">
                PRODUCT DETAILS
              </span>

              <h2 className="mt-1 text-lg font-semibold text-[#111521]">
                Basic information
              </h2>
            </div>

            <div className="mt-5 space-y-5">

              {/* TITLE */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#111521]">
                  Product title
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Matte Lipstick"
                  className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm text-[#111521] placeholder:text-gray-400 focus:border-[#0B1220] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40"
                  required
                />
              </div>

              {/* PRICE + CATEGORY */}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                {/* PRICE */}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#111521]">
                    Price (PKR)
                  </label>

                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="e.g. 2500"
                    min="1"
                    className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm text-[#111521] placeholder:text-gray-400 focus:border-[#0B1220] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40"
                    required
                  />
                </div>

                {/* CATEGORY */}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#111521]">
                    Category
                  </label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-[#111521] focus:border-[#0B1220] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40"
                    required
                  >
                    <option value="Makeup">Makeup</option>
                    <option value="Party Items">Party Items</option>
                    <option value="Bangles">Bangles</option>
                    <option value="Facial Products">Facial Products</option>
                    <option value="Electronic">Electronic</option>
                    <option value="Hair Care">Hair Care</option>
                    <option value="Mix Brand">Mix Brand</option>
                    <option value="Skin Care">Skin Care</option>
                    <option value="Color Cosmetics">Color Cosmetics</option>
                    <option value="Undergarments">Undergarments</option>
                    <option value="Shampoo">Shampoo</option>
                    <option value="Parfum">Parfum</option>
                    <option value="Body Spray">Body Spray</option>
                    <option value="Hair Color">Hair Color</option>
                  </select>
                </div>

              </div>

            </div>

            {/* ================= IMAGE ================= */}

            <div className="mt-10 border-t border-gray-100 pt-8">

              <span className="font-mono text-xs tracking-[0.3em] text-[#C9A227]">
                MEDIA
              </span>

              <h2 className="mt-1 text-lg font-semibold text-[#111521]">
                Product image
              </h2>

            </div>

            <div className="mt-5">

              <label className="mb-1.5 block text-sm font-medium text-[#111521]">
                Product image
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={uploadingImage}
                className="block w-full cursor-pointer text-sm text-[#5B6478] file:mr-4 file:rounded-md file:border-0 file:bg-[#0B1220] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#16213D]"
              />

              <p className="mt-1.5 text-xs text-[#5B6478]">
                Image will be uploaded to Cloudinary automatically.
              </p>

              {/* UPLOADING */}

              {uploadingImage && (
                <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                  Uploading image...
                </div>
              )}

              {/* PREVIEW */}

              {imagePreview && (
                <div className="mt-5 rounded-lg border border-gray-200 bg-[#FAFAF9] p-4">

                  <h3 className="mb-3 text-sm font-semibold text-[#111521]">
                    Image preview
                  </h3>

                  <div className="h-48 w-full overflow-hidden rounded-lg border-2 border-[#C9A227] sm:h-64">

                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="h-full w-full object-cover"
                    />

                  </div>

                  {!uploadingImage && formData.image && (
                    <p className="mt-3 text-xs font-medium text-green-700">
                      ✓ Image uploaded successfully
                    </p>
                  )}

                </div>
              )}

            </div>

            {/* ================= SUBMIT ================= */}

            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="mt-10 flex w-full items-center justify-center gap-2 rounded-md bg-[#0B1220] py-3 text-sm font-semibold text-white transition hover:bg-[#16213D] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-gray-300"
            >

              {saving
                ? "Saving product..."
                : uploadingImage
                ? "Uploading image..."
                : "Add Product"}

            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

export default AddProduct;