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
		image: "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
		iconBg: "from-amber-500 to-yellow-600",
		overlayFrom: "from-amber-950/80",
		overlayTo: "to-amber-900/40",
		link: "/excellence",
	},
	{
		title: "Artisan Cuisine",
		description:
			"Each dish is meticulously crafted using the finest seasonal ingredients",
		icon: <Coffee size={30} className="text-black" />,
		image: "https://images.unsplash.com/photo-1555126634-323283e090fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
		iconBg: "from-amber-600 to-orange-600",
		overlayFrom: "from-amber-900/80",
		overlayTo: "to-amber-800/40",
		link: "/cuisine",
	},
	{
		title: "Curated Experience",
		description:
			"Personalized dining journey with wine pairings from our master sommelier",
		icon: <Wine size={30} className="text-black" />,
		image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
		iconBg: "from-yellow-500 to-amber-500",
		overlayFrom: "from-amber-800/80",
		overlayTo: "to-amber-700/40",
		link: "/experience",
	},
];

const SignatureExperiences: React.FC = () => {
	return (
		<section className="py-24 relative overflow-hidden z-10 bg-gradient-to-b from-black via-charcoal/90 to-charcoal">
			<div className="container mx-auto px-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="text-center mb-16"
				>
					<h2 className="text-4xl md:text-5xl font-serif font-bold bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent mb-6">
						Signature Experiences
					</h2>
					<div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6"></div>
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
							className="relative overflow-hidden rounded-xl transition-all duration-500 group h-[400px] shadow-lg shadow-black/30"
						>
							{/* Background Image with parallax effect */}
							<div
								className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1"
								style={{ backgroundImage: `url(${exp.image})` }}
							/>

							{/* Enhanced gradient overlay */}
							<div className="absolute inset-0 bg-gradient-to-tl via-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"
                 style={{
                   background: `linear-gradient(to top left, rgba(0,0,0,0.9), ${exp.overlayFrom.replace('from-', 'rgba(')}, ${exp.overlayTo.replace('to-', 'rgba(')})`
                 }}
              ></div>
							<div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

							{/* Content with glass effect */}
							<div className="relative z-10 p-8 h-full flex flex-col">
								<div
									className={`inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-gradient-to-br ${exp.iconBg} transition-transform duration-500 group-hover:scale-110 shadow-lg`}
								>
									{exp.icon}
								</div>

								<h3 className="text-2xl font-serif font-bold bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent mb-4 group-hover:from-amber-200 group-hover:to-amber-400 transition-all">
									{exp.title}
								</h3>

								<p className="text-cream/90 leading-relaxed mb-6">
									{exp.description}
								</p>

								<Link to={exp.link} className="mt-auto">
									<motion.div
										className="flex items-center gap-2 text-amber-400 text-sm font-medium group-hover:text-amber-300 transition-colors"
										whileHover={{ x: 5 }}
									>
										<span>Learn More</span>
										<ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
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
