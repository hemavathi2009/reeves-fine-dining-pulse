
import React from 'react';
import { motion } from 'framer-motion';
import { Award, Clock, Users, Heart } from 'lucide-react';

const About = () => {
  const achievements = [
    {
      icon: Award,
      title: "Michelin Starred",
      description: "Recognized for culinary excellence since 2018"
    },
    {
      icon: Clock,
      title: "20+ Years",
      description: "Two decades of refined dining experiences"
    },
    {
      icon: Users,
      title: "Master Chefs",
      description: "Award-winning culinary team"
    },
    {
      icon: Heart,
      title: "Passion Driven",
      description: "Committed to perfection in every detail"
    }
  ];

  const team = [
    {
      name: "Chef Marcus Reeves",
      position: "Executive Chef & Owner",
      image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      bio: "With over 25 years of culinary expertise, Chef Reeves brings innovative techniques to classic fine dining."
    },
    {
      name: "Isabella Rodriguez",
      position: "Head Sommelier",
      image: "https://images.unsplash.com/photo-1594736797933-d0903ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      bio: "Master sommelier with an exceptional ability to pair wines with our seasonal menu offerings."
    },
    {
      name: "James Chen",
      position: "Pastry Chef",
      image: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      bio: "Award-winning pastry chef known for creating edible works of art that perfectly conclude our dining experience."
    }
  ];

  return (
    <div className="min-h-screen bg-charcoal pt-20">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80')`
          }}
        />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center text-white max-w-4xl px-6"
        >
          <h1 className="text-7xl font-serif font-bold mb-6 text-amber-400">
            Our Story
          </h1>
          <p className="text-2xl text-cream leading-relaxed">
            A legacy of culinary excellence, where tradition meets innovation 
            in every carefully crafted dish.
          </p>
        </motion.div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-5xl font-serif font-bold text-amber-400 mb-8">
                The Beginning
              </h2>
              <p className="text-cream text-lg leading-relaxed mb-6">
                Founded in 2001, Reeves Dining began as a dream to create more than just a restaurant—
                we envisioned a sanctuary where culinary artistry would flourish and guests would 
                experience dining as a transformative journey.
              </p>
              <p className="text-cream text-lg leading-relaxed mb-6">
                Chef Marcus Reeves, with his classical French training and innovative spirit, 
                established a philosophy that honors seasonal ingredients while pushing the 
                boundaries of flavor and presentation.
              </p>
              <p className="text-cream text-lg leading-relaxed">
                Today, we continue that legacy with the same passion and commitment to excellence 
                that has earned us recognition as one of the premier dining destinations.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Chef in kitchen"
                className="w-full h-96 object-cover border border-amber-600/20"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20 px-6 bg-black/30">
        <div className="container mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-5xl font-serif font-bold text-center text-amber-400 mb-16"
          >
            Our Achievements
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-8 bg-charcoal/50 backdrop-blur-sm border border-amber-600/20 hover:border-amber-600/40 transition-all duration-300"
              >
                <achievement.icon className="mx-auto text-amber-400 mb-4" size={48} />
                <h3 className="text-xl font-bold text-amber-400 mb-3">
                  {achievement.title}
                </h3>
                <p className="text-cream">
                  {achievement.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-5xl font-serif font-bold text-center text-amber-400 mb-16"
          >
            Meet Our Team
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="text-center group"
              >
                <div className="relative mb-6 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-80 object-cover border border-amber-600/20 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
                </div>
                <h3 className="text-2xl font-bold text-amber-400 mb-2">
                  {member.name}
                </h3>
                <p className="text-amber-300 font-semibold mb-4">
                  {member.position}
                </p>
                <p className="text-cream leading-relaxed">
                  {member.bio}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 px-6 bg-black/30">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-5xl font-serif font-bold text-amber-400 mb-8">
              Our Philosophy
            </h2>
            <p className="text-xl text-cream leading-relaxed mb-8">
              "We believe that dining is an art form that engages all the senses. 
              Every dish we create is a canvas, every flavor a brushstroke in a larger 
              masterpiece designed to create lasting memories."
            </p>
            <p className="text-lg text-amber-300 font-semibold">
              — Chef Marcus Reeves
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
