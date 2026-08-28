import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Trash2, GripVertical, Loader2, ImagePlus, CheckCircle } from "lucide-react";
import { db } from "../../firebase/firebase";
import { CLOUD_NAME, CLOUD_PRESET } from "../../config/cloudinary";
import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    doc,
    orderBy,
    query,
    where,
    serverTimestamp,
} from "firebase/firestore";

const categoryOptions = [
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

function FlashDeals() {
    const navigate = useNavigate();

    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [dragOver, setDragOver] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState(null);

    // Form state
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("Makeup");
    const [subtitle, setSubtitle] = useState("");
    const [badgeText, setBadgeText] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Fetch products that are marked as flash deals
    const fetchDeals = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, "products"),
                where("isFlashDeal", "==", true),
                orderBy("order", "asc")
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            setDeals(data);
        } catch (err) {
            console.error("Fetch error:", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchDeals();
    }, []);

    // Image file select
    const handleFileSelect = (file) => {
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) handleFileSelect(file);
    };

    // Upload image + create real product with isFlashDeal: true
    const handleUpload = async () => {
        if (!imageFile || !title.trim() || !price) return;
        setUploading(true);

        try {
            // 1. Upload image to Cloudinary
            const formData = new FormData();
            formData.append("file", imageFile);
            formData.append("upload_preset", CLOUD_PRESET);
            formData.append("cloud_name", CLOUD_NAME);

            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                { method: "POST", body: formData }
            );
            const cloudRes = await res.json();
            const imageUrl = cloudRes.secure_url;

            // 2. Save as a real product in the products collection
            await addDoc(collection(db, "products"), {
                title: title.trim(),
                price: Number(price),
                category,
                image: imageUrl,
                isFlashDeal: true,
                badgeText: badgeText || "",
                subtitle: subtitle || "",
                order: deals.length,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            // Reset form
            setTitle("");
            setPrice("");
            setCategory("Makeup");
            setSubtitle("");
            setBadgeText("");
            setImageFile(null);
            setImagePreview(null);
            setSuccessMsg("Flash deal product add ho gaya!");
            setTimeout(() => setSuccessMsg(""), 3000);
            fetchDeals();
        } catch (err) {
            console.error("Upload error:", err);
        }
        setUploading(false);
    };

    // Remove from flash deals only (keeps the product in the shop)
    const handleRemoveFromDeals = async (id) => {
        if (!window.confirm("Is product ko Flash Deals se hatana hai? (Product shop mein rahega)")) return;
        await updateDoc(doc(db, "products", id), { isFlashDeal: false });
        fetchDeals();
    };

    // Drag to reorder
    const handleDragStart = (index) => setDraggedIndex(index);

    const handleDragEnter = async (index) => {
        if (draggedIndex === null || draggedIndex === index) return;
        const updated = [...deals];
        const [moved] = updated.splice(draggedIndex, 1);
        updated.splice(index, 0, moved);
        setDraggedIndex(index);
        setDeals(updated);

        updated.forEach(async (deal, i) => {
            await updateDoc(doc(db, "products", deal.id), { order: i });
        });
    };

    return (
        <div className="min-h-screen bg-[#FAFAF9]">

            {/* NAVBAR */}
            <nav className="sticky top-0 z-50 bg-[#0B1220] text-white shadow-sm">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            onClick={() => navigate("/admin/dashboard")}
                            className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                        <span className="text-white/30">|</span>
                        <div>
                            <span className="font-mono text-[11px] tracking-[0.3em] text-[#C9A227]">
                                FLASH DEALS
                            </span>
                            <h1 className="text-lg font-semibold">Flash Deal Products</h1>
                        </div>
                    </div>
                    <span className="text-sm text-white/50">{deals.length} active deals</span>
                </div>
            </nav>

            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">

                {/* SUCCESS MESSAGE */}
                {successMsg && (
                    <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        <CheckCircle className="w-4 h-4" />
                        {successMsg}
                    </div>
                )}

                {/* ===== ADD FORM ===== */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <span className="font-mono text-xs tracking-[0.3em] text-[#C9A227]">NEW FLASH DEAL</span>
                    <h2 className="mt-1 text-xl font-semibold text-[#111521]">Flash Deal Product Add Karo</h2>
                    <p className="mt-1 text-sm text-[#5B6478]">
                        Yeh ek asal product banega jo Shop page aur homepage banner dono mein dikhega.
                    </p>

                    <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Image Drop Zone */}
                        <div>
                            <label className="block text-sm font-medium text-[#111521] mb-2">Product Image *</label>
                            <div
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById("bannerFileInput").click()}
                                className={`relative cursor-pointer rounded-lg border-2 border-dashed transition flex flex-col items-center justify-center text-center overflow-hidden
                                    ${dragOver ? "border-[#C9A227] bg-[#C9A227]/5" : "border-gray-300 hover:border-[#C9A227]/60 bg-gray-50"}
                                `}
                                style={{ minHeight: "200px" }}
                            >
                                {imagePreview ? (
                                    <img src={imagePreview} alt="preview" className="w-full h-full object-cover absolute inset-0" />
                                ) : (
                                    <div className="py-10 px-4">
                                        <ImagePlus className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm font-medium text-gray-500">Click ya drag & drop</p>
                                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP — recommended 1400×500px</p>
                                    </div>
                                )}
                                {imagePreview && (
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                                        <p className="text-white text-sm font-medium">Change Image</p>
                                    </div>
                                )}
                            </div>
                            <input
                                id="bannerFileInput"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileSelect(e.target.files[0])}
                            />
                        </div>

                        {/* Text Fields */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#111521] mb-1">Product Title *</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Matte Lipstick Combo"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 transition"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-[#111521] mb-1">Price (PKR) *</label>
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="e.g. 1200"
                                        min="1"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#111521] mb-1">Category *</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 transition bg-white"
                                    >
                                        {categoryOptions.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#111521] mb-1">Badge Text</label>
                                <input
                                    type="text"
                                    value={badgeText}
                                    onChange={(e) => setBadgeText(e.target.value)}
                                    placeholder="e.g. 20% OFF"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#111521] mb-1">Subtitle</label>
                                <input
                                    type="text"
                                    value={subtitle}
                                    onChange={(e) => setSubtitle(e.target.value)}
                                    placeholder="e.g. Valid till 25 Sep"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 transition"
                                />
                            </div>

                            <button
                                onClick={handleUpload}
                                disabled={!imageFile || !title.trim() || !price || uploading}
                                className="w-full flex items-center justify-center gap-2 bg-[#0B1220] hover:bg-[#1a2540] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg px-6 py-3 transition active:scale-95"
                            >
                                {uploading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                                ) : (
                                    <><Upload className="w-4 h-4" /> Flash Deal Add Karo</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ===== EXISTING FLASH DEALS ===== */}
                <div>
                    <span className="font-mono text-xs tracking-[0.3em] text-[#C9A227]">MANAGE</span>
                    <h2 className="mt-1 text-xl font-semibold text-[#111521]">Current Flash Deals</h2>
                    <p className="mt-1 text-sm text-[#5B6478]">
                        Drag karke order change karo. Sabse upar wala banner pehle dikhega.
                    </p>

                    {loading ? (
                        <div className="mt-6 flex items-center justify-center py-16">
                            <Loader2 className="w-6 h-6 animate-spin text-[#C9A227]" />
                        </div>
                    ) : deals.length === 0 ? (
                        <div className="mt-6 rounded-lg border border-dashed border-gray-300 py-16 text-center">
                            <ImagePlus className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm text-gray-400">Koi flash deal nahi hai. Upar se add karo.</p>
                        </div>
                    ) : (
                        <div className="mt-6 space-y-3">
                            {deals.map((deal, index) => (
                                <div
                                    key={deal.id}
                                    draggable
                                    onDragStart={() => handleDragStart(index)}
                                    onDragEnter={() => handleDragEnter(index)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDragEnd={() => setDraggedIndex(null)}
                                    className={`flex items-center gap-4 rounded-lg border bg-white p-4 transition cursor-grab active:cursor-grabbing
                                        ${draggedIndex === index ? "border-[#C9A227] shadow-md opacity-80" : "border-gray-200 hover:border-gray-300"}`}
                                >
                                    <GripVertical className="w-5 h-5 text-gray-300 flex-shrink-0" />
                                    <span className="text-xs font-mono font-bold text-[#C9A227] w-5 flex-shrink-0">
                                        {index + 1}
                                    </span>
                                    <img
                                        src={deal.image}
                                        alt={deal.title || "product"}
                                        className="w-32 h-16 object-cover rounded-md flex-shrink-0 border border-gray-100"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-[#111521] truncate">
                                            {deal.title || <span className="text-gray-400 font-normal">No title</span>}
                                        </p>
                                        <p className="text-xs text-[#5B6478] mt-0.5">Rs. {deal.price} — {deal.category}</p>
                                        {deal.badgeText && (
                                            <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                                {deal.badgeText}
                                            </span>
                                        )}
                                        {deal.subtitle && (
                                            <p className="text-xs text-[#5B6478] mt-0.5 truncate">{deal.subtitle}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleRemoveFromDeals(deal.id)}
                                        className="flex-shrink-0 flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span className="hidden sm:inline">Remove from Deals</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default FlashDeals;