
import React from 'react';
import { motion } from 'framer-motion';
import {
    ShieldCheck, Clock, ShoppingBag, Truck, MapPin,
    CreditCard, XCircle, RefreshCw, Sparkles, ChevronLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp, SEO } from '../App';

const Section = ({ icon: Icon, title, children }: { icon: any, title: string, children: React.ReactNode }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
    >
        <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Icon size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 font-display">{title}</h2>
        </div>
        <div className="space-y-4 text-gray-600 leading-relaxed font-medium">
            {children}
        </div>
    </motion.div>
);

const PoliciesPage = () => {
    const { settings } = useApp();

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <SEO title="Our Policies" description="Read Galimandi's delivery, cancellation, and refund policies. We ensure transparency and quality for every order." />
            <div className="flex items-center gap-4 mb-12">
                <Link to="/" className="p-3 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-primary transition-all shadow-sm">
                    <ChevronLeft size={24} />
                </Link>
                <h1 className="text-4xl font-bold text-gray-900 font-display">Our Policies</h1>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <Section icon={ShieldCheck} title="1. Sourcing & Quality">
                    <p>Galimandi sources fruits and vegetables directly from Gali Mandi and trusted local vendors.</p>
                    <p>We bypass middlemen to ensure:</p>
                    <ul className="list-disc ml-5 space-y-2">
                        <li>Fresh produce directly from the source</li>
                        <li>Fair and transparent pricing</li>
                        <li>Support for our local vendor community</li>
                    </ul>
                </Section>

                <Section icon={Clock} title="2. Store Timings">
                    <p>Galimandi store timings are optimized for freshness:</p>
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center">
                        <div>
                            <div className="text-xs text-gray-400 uppercase font-black tracking-widest">Opens</div>
                            <div className="text-xl font-bold text-gray-900">{settings?.openingTime || '7:00 AM'}</div>
                        </div>
                        <div className="w-px h-8 bg-gray-200" />
                        <div>
                            <div className="text-xs text-gray-400 uppercase font-black tracking-widest">Closes</div>
                            <div className="text-xl font-bold text-gray-900">{settings?.closingTime || '10:00 PM'}</div>
                        </div>
                    </div>
                    {settings?.isStoreShutdown && (
                        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 font-bold text-center">
                            Note: Store is currently temporarily shut down.
                        </div>
                    )}
                    <p className="text-sm italic">Orders are exclusively accepted during our designated store operating hours.</p>
                </Section>

                <Section icon={ShoppingBag} title="3. Minimum Order Value">
                    <p>To maintain our high standards of service:</p>
                    <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 text-center">
                        <span className="text-sm font-bold text-gray-700">Minimum Order Value: </span>
                        <span className="text-lg font-black text-primary">₹{settings?.minOrderValue || 80}</span>
                    </div>
                    <p className="text-sm">Orders below ₹{settings?.minOrderValue || 80} cannot be processed.</p>
                </Section>

                <Section icon={Truck} title="4. Delivery Rules">
                    <p>Our delivery charges are straightforward and transparent:</p>
                    <div className="space-y-3">
                        <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                            <div className="font-bold text-green-700">Orders ₹{settings?.freeDeliveryThreshold || 399}+ & Within 8 KM</div>
                            <div className="text-sm text-green-600">FREE Delivery 🎉</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <div className="font-bold text-gray-700">Orders ₹{settings?.freeDeliveryThreshold || 399}+ & Beyond 8 KM</div>
                            <div className="text-sm text-gray-600">An additional ₹5 per KM will apply.</div>
                        </div>
                    </div>
                    <p className="text-sm">Delivery charges are automatically calculated and clearly displayed during checkout.</p>
                </Section>

                {settings?.privacyPolicy && (
                    <Section icon={ShieldCheck} title="5. Privacy Policy">
                        <div className="whitespace-pre-wrap">{settings.privacyPolicy}</div>
                    </Section>
                )}

                {!settings?.privacyPolicy && (
                    <Section icon={MapPin} title="5. Location & Privacy">
                        <ul className="space-y-3">
                            <li>We utilize your current location solely for delivery purposes.</li>
                            <li>Location data is used exclusively to calculate delivery distance and associated charges.</li>
                            <li>Galimandi does not disclose the exact location of its storage facilities to users.</li>
                            <li>Your location data is securely handled and is not used for any other purpose.</li>
                        </ul>
                    </Section>
                )}

                <Section icon={CreditCard} title="6. Payment Policy">
                    <ul className="space-y-3">
                        <li>All transactions are processed through highly secure payment gateways.</li>
                        <li>Galimandi does not store any sensitive information such as card details, UPI IDs, or bank account information.</li>
                        <li>All available payment methods are clearly listed at the time of checkout.</li>
                    </ul>
                </Section>

                <Section icon={XCircle} title="7. Cancellation Policy">
                    <ul className="space-y-3">
                        <li>Orders can be cancelled before the packing process begins.</li>
                        <li>Once an order has been packed, cancellations are no longer permitted.</li>
                    </ul>
                </Section>

                <Section icon={RefreshCw} title="8. Refund Policy">
                    {settings?.refundPolicy ? (
                        <div className="whitespace-pre-wrap">{settings.refundPolicy}</div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <div className="font-bold text-gray-900 mb-2 underline decoration-primary/30">Refunds are applicable for:</div>
                                <ul className="text-sm space-y-1">
                                    <li>• Cancellations made before packing</li>
                                    <li>• Delivery of the incorrect item</li>
                                    <li>• Receipt of damaged or spoiled items</li>
                                    <li>• Missing items in the order</li>
                                </ul>
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 mb-2 underline decoration-red-500/30">Refunds are not applicable for:</div>
                                <ul className="text-sm space-y-1 text-gray-400">
                                    <li>• Cancellations requested after packing</li>
                                    <li>• Non-availability of the customer at the delivery location</li>
                                    <li>• Incorrect or incomplete address information</li>
                                    <li>• Personal taste preferences</li>
                                </ul>
                            </div>
                        </div>
                    )}
                    <div className="bg-gray-900 text-white p-6 rounded-3xl mt-4">
                        <div className="text-xs uppercase font-black tracking-widest text-gray-500 mb-2">Request a Refund</div>
                        <p className="text-sm mb-4">Profile → Report Issue → Upload relevant photo</p>
                        <div className="text-[10px] text-gray-400 italic">Processing time: 5–7 working days</div>
                    </div>
                </Section>

                <Section icon={Sparkles} title="9. Transparency Promise">
                    <div className="bg-brandGreen/10 p-6 rounded-[32px] border border-brandGreen/20">
                        <p className="text-gray-900 font-bold italic mb-4">"No hidden charges, fair pricing, and honest policies."</p>
                        <p className="text-sm">We guarantee that the final payable amount is clearly and transparently displayed at checkout, with no hidden costs.</p>
                    </div>
                </Section>

                {settings?.faqSupport && (
                    <Section icon={Sparkles} title="10. FAQ & Support">
                        <div className="whitespace-pre-wrap">{settings.faqSupport}</div>
                    </Section>
                )}
            </div>

            <div className="mt-20 text-center text-gray-400 text-xs">
                &copy; {new Date().getFullYear()} Galimandi Delivery Services. Legal and Safe Content.
            </div>
        </div>
    );
};

export default PoliciesPage;
