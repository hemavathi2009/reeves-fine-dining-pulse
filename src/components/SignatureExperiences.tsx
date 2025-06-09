import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ChefHat, Coffee, Wine, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Experience {
	title: string;
	description: string;
	icon: JSX.Element;
	backgroundImage: string;
	gradient: string;
	link: string;
}

const SignatureExperiences: React.FC = () => {
	const sectionRef = useRef<HTMLDivElement>(null);
	const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

	const experiences: Experience[] = [
		{
			title: "Michelin Excellence",
			description:
				"Recognized for culinary innovation and exceptional service since 2018",
			icon: <ChefHat size={30} className="text-black" />,
			backgroundImage:
				"https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
			gradient: "from-amber-500 to-yellow-600",
			link: "/excellence",
		},
		{
			title: "Artisan Cuisine",
			description:
				"Each dish is meticulously crafted using the finest seasonal ingredients",
			icon: <Coffee size={30} className="text-black" />,
			backgroundImage:
				"https://images.unsplash.com/photo-1555126634-323283e090fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
			gradient: "from-amber-600 to-orange-600",
			link: "/cuisine",
		},
		{
			title: "Curated Experience",
			description:
				"Personalized dining journey with wine pairings from our master sommelier",
			icon: <Wine size={30} className="text-black" />,
			backgroundImage:
				"https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
			gradient: "from-yellow-500 to-amber-500",
			link: "/experience",
		},
	];

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.2,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 30 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				type: "spring",
				stiffness: 100,
				damping: 12,
			},
		},
	};

	return (
		<section
			ref={sectionRef}
			className="py-24 relative overflow-hidden z-10 bg-gradient-to-b from-black via-charcoal/90 to-charcoal"
		>
			{/* Premium background pattern */}
			<div className="absolute inset-0 -z-10 opacity-10">
				<div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-amber-600/20 to-transparent"></div>
				<div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-amber-600/20 to-transparent"></div>

				{/* Animated gold particles */}
				{[...Array(8)].map((_, i) => (
					<motion.div
						key={i}
						animate={{
							x: [Math.random() * 100, Math.random() * 100 - 50],
							y: [Math.random() * 100, Math.random() * 100 - 50],
							scale: [0.8, 1.2, 0.8],
							opacity: [0.2, 0.5, 0.2],
						}}
						transition={{
							duration: 8 + Math.random() * 10,
							repeat: Infinity,
							ease: "easeInOut",
						}}
						className="absolute w-32 h-32 rounded-full bg-amber-500/10"
						style={{
							left: `${Math.random() * 90}%`,
							top: `${Math.random() * 90}%`,
						}}
					/>
				))}
			</div>

			<div className="container mx-auto px-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
					transition={{ duration: 0.8 }}
					className="text-center mb-16"
				>
					<h2 className="text-4xl md:text-5xl font-serif font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 mb-6">
						Signature Experiences
					</h2>
					<div className="w-40 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mb-6"></div>
					<p className="text-xl text-cream/80 max-w-3xl mx-auto">
						Discover what makes Reeves a destination for discerning diners
						worldwide
					</p>
				</motion.div>

				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate={isInView ? "visible" : "hidden"}
					className="grid md:grid-cols-3 gap-8 relative z-10"
				>
					{experiences.map((experience, index) => (
						<motion.div
							key={index}
							variants={itemVariants}
							whileHover={{ y: -10, transition: { duration: 0.3 } }}
							className="relative overflow-hidden rounded-xl shadow-xl shadow-black/50 h-[450px] border border-amber-600/20 group"
						>
							{/* Background Image with parallax effect */}
							<div
								className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out will-change-transform group-hover:scale-110 group-hover:rotate-1"
								style={{ backgroundImage: `url(${experience.backgroundImage})` }}
							/>

							{/* Premium gradient overlays */}
							<div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-500"></div>
							<div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>

							{/* Subtle glowing edge effect on hover */}
							<div className="absolute -inset-0.5 bg-gradient-to-tr from-amber-600/0 to-amber-400/0 rounded-xl group-hover:from-amber-600/20 group-hover:to-amber-400/20 transition-all duration-700 blur-sm"></div>

							{/* Content */}
							<div className="relative z-10 p-8 h-full flex flex-col justify-between">
								<div>
									<div
										className={`inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-gradient-to-br ${experience.gradient} shadow-lg shadow-amber-900/50 transition-transform group-hover:scale-110 duration-500`}
									>
										{experience.icon}
									</div>

									<h3 className="text-2xl font-serif font-bold bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent mb-4 group-hover:from-amber-200 group-hover:to-amber-300 transition-colors duration-500">
										{experience.title}
									</h3>

									<p className="text-cream/90 leading-relaxed text-lg">
										{experience.description}
									</p>
								</div>

								<div className="mt-auto">
									<Link
										to={experience.link}
										className="inline-flex items-center gap-2 text-amber-400 font-medium py-2 group-hover:text-amber-300 transition-colors duration-300"
									>
										<span>Experience More</span>
										<motion.span
											initial={{ x: 0 }}
											whileHover={{ x: 5 }}
											className="flex items-center"
										>
											<ArrowRight size={18} />
										</motion.span>
									</Link>
								</div>
							</div>

							{/* Subtle decoration elements */}
							<div className="absolute top-4 right-4 w-20 h-20 border border-amber-600/10 rounded-full -z-5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
							<div className="absolute bottom-10 right-10 w-40 h-40 border border-amber-600/10 rounded-full -z-5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100"></div>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
};

export default SignatureExperiences;
