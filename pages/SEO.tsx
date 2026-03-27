
import React from 'react';
import { useApp } from '../App';
import { Link } from 'react-router-dom';

const SEOPage = () => {
    const { products, categories, settings } = useApp();

    // Structured Data for Google (JSON-LD)
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "GroceryStore",
        "name": "Galimandi",
        "image": "https://galimandi.store/logo.png",
        "description": "Hyperlocal delivery platform bringing fresh farm produce direct to your doorstep in 30 minutes in Rewa.",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Rewa",
            "addressRegion": "MP",
            "postalCode": "486001",
            "addressCountry": "IN"
        },
        "openingHours": "07:00-22:00",
        "priceRange": "₹",
        "telephone": "+91-XXXXXXXXXX"
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-20 opacity-0 pointer-events-none select-none h-0 overflow-hidden">
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>

            <h1>Galimandi - Fresh Grocery Delivery in Rewa</h1>
            <p>
                Galimandi is the leading online grocery store and hyperlocal delivery service in Rewa,
                providing fresh fruits, vegetables, dairy, and exotic produce directly from farms to your home.
                We guarantee 30-minute delivery for all your daily needs.
            </p>

            <section>
                <h2>Our Main Categories</h2>
                <ul>
                    {categories.map(cat => (
                        <li key={cat.id}>
                            <h3>{cat.name}</h3>
                            <p>Explore our wide range of fresh {cat.name.toLowerCase()} available for instant delivery in Rewa.</p>
                            <Link to={`/category/${cat.id}`}>{cat.name} Online</Link>
                        </li>
                    ))}
                </ul>
            </section>

            <section>
                <h2>Featured Products</h2>
                <div className="grid">
                    {products.map(product => (
                        <article key={product.id}>
                            <h3>{product.name}</h3>
                            <p>
                                Buy fresh {product.name} at the best price in Rewa.
                                Our {product.name} is sourced from local farmers to ensure high quality and freshness.
                            </p>
                            <p>Category: {categories.find(c => c.id === product.category_id)?.name}</p>
                            <Link to={`/product/${product.id}`}>Buy {product.name} Online</Link>
                        </article>
                    ))}
                </div>
            </section>

            <section>
                <h2>Why Choose Galimandi?</h2>
                <ul>
                    <li><strong>Farm Fresh:</strong> Directly sourced from local farms in MP.</li>
                    <li><strong>Fast Delivery:</strong> Under 30 minutes delivery in Rewa city.</li>
                    <li><strong>Best Prices:</strong> Competitive wholesale prices for retail customers.</li>
                    <li><strong>Quality Assured:</strong> Multi-level quality checks for every fruit and vegetable.</li>
                </ul>
            </section>

            <section>
                <h2>Delivery Locations</h2>
                <p>
                    We deliver across all major areas in Rewa including Civil Lines,
                    University Road, Amaiya, APS University, and more.
                    Use our app to track your live delivery.
                </p>
            </section>

            <footer>
                <p>© 2024 Galimandi Delivery Services. Online Grocery Shopping Rewa.</p>
            </footer>
        </div>
    );
};

export default SEOPage;
