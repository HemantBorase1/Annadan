'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { ChefHat, Clock, Users, Star, Utensils, Plus, X, Trash2, AlertCircle } from 'lucide-react'
import { recipesAPI } from '../../lib/api'
import { useAuthContext } from '../../lib/auth-context'

export default function AIRecipePage() {
  const { isAuthenticated } = useAuthContext()
  const [ingredientsList, setIngredientsList] = useState([])
  const [newIngredient, setNewIngredient] = useState('')
  const [newQuantity, setNewQuantity] = useState('')
  const [numberOfPeople, setNumberOfPeople] = useState(2)
  const [foodType, setFoodType] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showRecipes, setShowRecipes] = useState(false)
  const [generatedRecipes, setGeneratedRecipes] = useState([])
  const [error, setError] = useState('')

  const foodTypes = [
    { value: 'veg', label: 'Vegetarian' },
    { value: 'non-veg', label: 'Non-Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'gluten-free', label: 'Gluten-Free' },
    { value: 'dairy-free', label: 'Dairy-Free' },
    { value: 'any', label: 'Any Type' }
  ]

  const addIngredient = () => {
    if (newIngredient.trim() && newQuantity.trim()) {
      setIngredientsList([...ingredientsList, {
        id: Date.now(),
        name: newIngredient.trim(),
        quantity: newQuantity.trim()
      }])
      setNewIngredient('')
      setNewQuantity('')
    }
  }

  const removeIngredient = (id) => {
    setIngredientsList(ingredientsList.filter(item => item.id !== id))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addIngredient()
    }
  }

  const handleGenerateRecipes = async () => {
    if (ingredientsList.length === 0) return
    
    if (!isAuthenticated) {
      setError('Please log in to generate AI recipes')
      return
    }
    
    setIsGenerating(true)
    setError('')
    
    try {
      const recipeData = {
        ingredients: ingredientsList,
        numberOfPeople,
        foodType: foodType || 'any',
        dietaryRestrictions: [] // Can be extended later
      }
      
      const response = await recipesAPI.generateRecipe(recipeData)
      
      if (response.success) {
        // Convert single recipe to array format for consistency
        const recipe = response.data.recipe
        setGeneratedRecipes([{
          id: recipe.id || Date.now(),
          title: recipe.title,
          description: recipe.description,
          ingredients: recipe.ingredients || [],
          instructions: recipe.instructions || [],
          prepTime: recipe.prepTime,
          servings: `${numberOfPeople} people`,
          difficulty: recipe.difficulty,
          rating: 4.5, // Default rating since AI doesn't provide this
          tips: recipe.tips
        }])
        setShowRecipes(true)
      } else {
        setError(response.error || 'Failed to generate recipe')
      }
    } catch (error) {
      console.error('Recipe generation error:', error)
      setError('Failed to generate recipe. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            AI Recipe Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your leftover ingredients into delicious meals with our AI-powered recipe suggestions.
          </p>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-semibold text-gray-800 flex items-center justify-center">
                <ChefHat className="mr-3 h-6 w-6 text-emerald-600" />
                What ingredients do you have?
              </CardTitle>
              <p className="text-gray-600">
                List your leftover ingredients and we'll generate creative recipe ideas
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Food Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="foodType" className="text-lg font-medium">
                  Food Type Preference
                </Label>
                <Select value={foodType} onValueChange={setFoodType}>
                  <SelectTrigger className="text-lg py-3">
                    <SelectValue placeholder="Select food type preference" />
                  </SelectTrigger>
                  <SelectContent>
                    {foodTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Number of People */}
              <div className="space-y-2">
                <Label htmlFor="numberOfPeople" className="text-lg font-medium">
                  Number of People
                </Label>
                <Input
                  id="numberOfPeople"
                  type="number"
                  min="1"
                  max="20"
                  placeholder="How many people to serve?"
                  value={numberOfPeople}
                  onChange={(e) => setNumberOfPeople(parseInt(e.target.value) || 1)}
                  className="text-lg py-3"
                />
              </div>

              {/* Ingredients Input */}
              <div className="space-y-2">
                <Label className="text-lg font-medium">
                  Available Ingredients
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ingredient name (e.g., rice, chicken, vegetables)"
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 text-lg py-3"
                  />
                  <Input
                    placeholder="Quantity (e.g., 2 cups, 500g, 3 pieces)"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 text-lg py-3"
                  />
                  <Button
                    type="button"
                    onClick={addIngredient}
                    disabled={!newIngredient.trim() || !newQuantity.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Ingredients List */}
              {ingredientsList.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">
                    Added Ingredients ({ingredientsList.length})
                  </Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {ingredientsList.map((ingredient) => (
                      <motion.div
                        key={ingredient.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                          <span className="font-medium text-gray-800">{ingredient.name}</span>
                          <span className="text-sm text-gray-600">({ingredient.quantity})</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeIngredient(ingredient.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2"
                >
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-700">{error}</span>
                </motion.div>
              )}

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleGenerateRecipes}
                  disabled={ingredientsList.length === 0 || isGenerating || !isAuthenticated}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 text-lg disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Generating Recipe...
                    </>
                  ) : (
                    <>
                      <Utensils className="mr-2 h-5 w-5" />
                      Generate AI Recipe
                    </>
                  )}
                </Button>
              </motion.div>
              
              {!isAuthenticated && (
                <p className="text-sm text-gray-500 text-center">
                  Please log in to generate AI-powered recipes
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recipe Cards */}
        <AnimatePresence>
          {showRecipes && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <motion.div variants={cardVariants} className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Your Personalized Recipes
                </h2>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                  {foodType && (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                      {foodTypes.find(t => t.value === foodType)?.label}
                    </span>
                  )}
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                    Serves {numberOfPeople} {numberOfPeople === 1 ? 'person' : 'people'}
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                    {ingredientsList.length} ingredients
                  </span>
                </div>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generatedRecipes.map((recipe, index) => (
                  <motion.div
                    key={recipe.id}
                    variants={cardVariants}
                    whileHover={{ y: -5 }}
                    className="h-full"
                  >
                    <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2">
                            {recipe.title}
                          </CardTitle>
                          <div className="flex items-center space-x-1 bg-emerald-100 px-2 py-1 rounded-full">
                            <Star className="h-4 w-4 text-emerald-600 fill-current" />
                            <span className="text-sm font-medium text-emerald-800">
                              {recipe.rating}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {recipe.description}
                        </p>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {/* Recipe Stats */}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="mr-1 h-4 w-4" />
                            {recipe.prepTime}
                          </div>
                          <div className="flex items-center">
                            <Users className="mr-1 h-4 w-4" />
                            {recipe.servings}
                          </div>
                          <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                            {recipe.difficulty}
                          </span>
                        </div>

                        {/* Ingredients */}
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Ingredients:</h4>
                          <ul className="space-y-1">
                            {recipe.ingredients.map((ingredient, idx) => (
                              <li key={idx} className="text-sm text-gray-600 flex items-center">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></span>
                                {typeof ingredient === 'string' ? ingredient : `${ingredient.name} (${ingredient.quantity})`}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Instructions */}
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Instructions:</h4>
                          <ol className="space-y-2">
                            {recipe.instructions.map((instruction, idx) => (
                              <li key={idx} className="text-sm text-gray-600 flex">
                                <span className="font-semibold text-emerald-600 mr-2 min-w-[20px]">
                                  {idx + 1}.
                                </span>
                                {instruction}
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* Tips */}
                        {recipe.tips && (
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Tips:</h4>
                            <p className="text-sm text-gray-600 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                              {recipe.tips}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
