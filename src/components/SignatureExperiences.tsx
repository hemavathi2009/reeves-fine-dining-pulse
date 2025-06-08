import React from "react";
import { motion } from "framer-motion";
import { ChefHat, Coffee, Wine, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const experiences = [
	{
		title: "Michelin Excellence",
		description:
			"Recognized for culinary innovation and exceptional service since 2018",
		icon: <ChefHat size={30} className="text-black" />,
		// Updated to use absolute URLs for images
		image: "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
		bgColor: "bg-amber-950/80",
		iconBg: "from-amber-500 to-yellow-600",
		link: "/excellence",
	},
	{
		title: "Artisan Cuisine",
		description:
			"Each dish is meticulously crafted using the finest seasonal ingredients",
		icon: <Coffee size={30} className="text-black" />,
		// Updated to use absolute URLs for images
		image: "https://images.unsplash.com/photo-1555126634-323283e090fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
		bgColor: "bg-amber-900/80",
		iconBg: "from-amber-600 to-orange-600",
		link: "/cuisine",
	},
	{
		title: "Curated Experience",
		description:
			"Personalized dining journey with wine pairings from our master sommelier",
		icon: <Wine size={30} className="text-black" />,
		// Updated to use absolute URLs for images
		image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
		bgColor: "bg-amber-800/80",
		iconBg: "from-yellow-500 to-amber-500",
		link: "/experience",
	},
];

const SignatureExperiences: React.FC = () => {
	return (
		<section className="py-24 relative overflow-hidden z-10 bg-gradient-to-b from-black to-charcoal">
			<div className="container mx-auto px-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="text-center mb-16"
				>
					<h2 className="text-4xl md:text-5xl font-serif font-bold text-amber-400 mb-6">
						Signature Experiences
					</h2>
					<div className="w-24 h-0.5 bg-amber-400/50 mx-auto mb-6"></div>
					<p className="text-xl text-cream/80 max-w-3xl mx-auto">
						Discover what makes Reeves a destination for discerning diners
						worldwide
					</p>
				</motion.div>

				<div className="grid md:grid-cols-3 gap-8 relative z-10">
					{experiences.map((exp, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: index * 0.1 }}
							className="relative overflow-hidden rounded-xl transition-all duration-500 group h-[400px]"
						>
							{/* Background Image - Now properly visible with height control */}
							<div
								className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
								style={{ backgroundImage: `url(${exp.image})` }}
							/>

							{/* Overlay - Keep for text readability */}
							<div
								className={`absolute inset-0 ${exp.bgColor} opacity-80 group-hover:opacity-90 transition-opacity duration-500`}
							></div>
							<div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

							{/* Content */}
							<div className="relative z-10 p-8 h-full flex flex-col">
								<div
									className={`inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-gradient-to-br ${exp.iconBg} transition-transform duration-500 group-hover:scale-110`}
								>
									{exp.icon}
								</div>

								<h3 className="text-2xl font-serif font-bold text-amber-400 mb-4">
									{exp.title}
								</h3>

								<p className="text-cream leading-relaxed mb-6">
									{exp.description}
								</p>

								<Link to={exp.link} className="mt-auto">
									<motion.div
										className="flex items-center gap-2 text-amber-400 text-sm font-medium"
										whileHover={{ x: 5 }}
									>
										<span>Learn More</span>
										<ArrowRight size={16} />
									</motion.div>
								</Link>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
};

export default SignatureExperiences;
