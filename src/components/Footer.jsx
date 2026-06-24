import { Facebook, Twitter, Instagram } from "lucide-react";

export default function Footer() {
    // Helper to generate the dummy links from your design
    const links = Array(6).fill("Card title");

    return (
        <footer className="bg-[#f2f2f2] py-20 px-6 md:px-16">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">

                {/* Column 1: Logo & Description */}
                <div className="flex flex-col gap-6">
                    {/* Logo */}
                    <h2 className="text-4xl font-bold text-gray-700">
                        <span className="text-(--primary-color)">Hospital</span> logo
                    </h2>

                    {/* Description Block */}
                    <div>
                        <h3 className="font-semibold text-gray-800 text-lg mb-3">Card title</h3>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                            Card description. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                            Sit rhoncus imperdiet nisi.
                        </p>
                    </div>
                </div>

                {/* Column 2: Links List 1 */}
                <div className="flex flex-col gap-4 pt-2">
                    {links.map((link, i) => (
                        <a key={i} href="#" className="text-gray-600 hover:text-[--primary-color] transition-colors font-medium">
                            {link}
                        </a>
                    ))}
                </div>

                {/* Column 3: Links List 2 */}
                <div className="flex flex-col gap-4 pt-2">
                    {links.map((link, i) => (
                        <a key={i} href="#" className="text-gray-600 hover:text-[--primary-color] transition-colors font-medium">
                            {link}
                        </a>
                    ))}
                </div>

                {/* Column 4: Social Media */}
                <div className="flex flex-col gap-6 pt-2">
                    <h3 className="font-semibold text-gray-700 text-lg">Follow Us</h3>

                    <div className="flex flex-col gap-5">
                        <a href="#" className="text-[#f2f2f2] bg-[#404040] w-fit p-2 rounded-full fill-current  hover:text-(--primary-color) transition-colors">
                            <Facebook className="size-8" />
                        </a>
                        <a href="#" className="text-[#f2f2f2] bg-[#404040] w-fit p-2 rounded-full  fill-current  hover:text-(--primary-color) transition-colors">
                            <Twitter className="size-8" />
                        </a>
                        <a href="#" className="text-[#404040]  w-fit p-2 rounded-full  fill-current  hover:text-(--primary-color) transition-colors">
                            <Instagram className="size-8" />
                        </a>
                    </div>
                </div>

            </div>
        </footer>
    );
}