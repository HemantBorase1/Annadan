'use client'

import { motion } from 'framer-motion'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Heart, Utensils, Users, Globe, Target, Award, Shield, Clock } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  const features = [
    {
      icon: Heart,
      title: 'Food Sharing',
      description: 'Connect donors with recipients to reduce food waste and help those in need.'
    },
    {
      icon: Utensils,
      title: 'AI Recipe Assistant',
      description: 'Get personalized recipe suggestions based on available ingredients and dietary preferences.'
    },
    {
      icon: Users,
      title: 'Community Building',
      description: 'Build meaningful connections within your local community through food sharing.'
    },
    {
      icon: Shield,
      title: 'Safe & Verified',
      description: 'All donors and recipients are verified to ensure safe and reliable food sharing.'
    }
  ]



  const values = [
    {
      icon: Heart,
      title: 'Compassion',
      description: 'We believe in the power of kindness and helping others in need.'
    },
    {
      icon: Target,
      title: 'Sustainability',
      description: 'Reducing food waste while nourishing communities and protecting our planet.'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Building stronger, more connected neighborhoods through food sharing.'
    },
    {
      icon: Clock,
      title: 'Efficiency',
      description: 'Making food sharing quick, easy, and accessible for everyone.'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center py-20 px-4 bg-gradient-to-br from-emerald-50 to-blue-50"
      >
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
        >
          About AnnaDan
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
        >
          AnnaDan is a revolutionary food sharing platform that connects generous donors with people in need, 
          while leveraging AI technology to create delicious recipes from available ingredients.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button size="lg" asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/donate">
              <Heart className="mr-2 h-5 w-5" />
              Start Sharing
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/ai-recipe">
              <Utensils className="mr-2 h-5 w-5" />
              Try AI Recipes
            </Link>
          </Button>
        </motion.div>
      </motion.section>

      {/* Mission Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="py-16 px-4"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            At AnnaDan, we believe that no one should go hungry while food goes to waste. 
            Our mission is to create a sustainable, community-driven platform that reduces food waste, 
            nourishes people in need, and builds stronger, more connected neighborhoods through the power of sharing.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            We combine the generosity of food donors with innovative AI technology to make food sharing 
            not just charitable, but also delicious and inspiring.
          </p>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.8 }}
        className="py-16 px-4 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full text-center hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-emerald-600" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      

      {/* Values Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="py-16 px-4"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full text-center hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                      <value.icon className="h-6 w-6 text-emerald-600" />
                    </div>
                    <CardTitle className="text-lg">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Story Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="py-16 px-4 bg-gray-50"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Our Story</h2>
          <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
            <p>
              AnnaDan was born from a simple observation: while some people struggle to put food on their tables, 
              others have surplus food that often goes to waste. This inspired us to create a platform that 
              bridges this gap through technology and community spirit.
            </p>
            <p>
              What started as a local initiative has grown into a comprehensive food sharing ecosystem. 
              We've integrated AI technology to not only facilitate food sharing but also inspire creativity 
              in the kitchen, helping users make the most of available ingredients.
            </p>
            <p>
              Today, AnnaDan serves communities across multiple regions, bringing people together through 
              the universal language of food. Every donation, every recipe, and every connection strengthens 
              our mission to create a world where food waste is minimized and no one goes hungry.
            </p>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        className="py-16 px-4 bg-gradient-to-r from-emerald-600 to-blue-600"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl p-8 shadow-2xl"
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Join Our Mission
            </h3>
            <p className="text-gray-600 mb-6 text-lg">
              Be part of the solution. Whether you're donating food, seeking assistance, or just want to 
              explore AI-powered recipes, you're welcome in our community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/donate">
                  <Heart className="mr-2 h-5 w-5" />
                  Start Donating
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/ai-recipe">
                  <Utensils className="mr-2 h-5 w-5" />
                  Explore Recipes
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  )
}
