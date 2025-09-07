import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { db, handleSupabaseError } from '../../../lib/supabase'
import { authenticateRequest } from '../../../lib/auth'

// Initialize Gemini client
if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set in environment variables')
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
// Use a currently supported model
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

// POST /api/recipes/generate - Generate AI recipe
export async function POST(request) {
  try {
    // Authenticate request
    const auth = authenticateRequest(request)
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: auth.error },
        { status: 401 }
      )
    }

    const { ingredients, numberOfPeople, foodType, dietaryRestrictions } = await request.json()

    // Validate input
    if (!ingredients || ingredients.length === 0) {
      return NextResponse.json(
        { error: 'Ingredients are required' },
        { status: 400 }
      )
    }

    // Prepare ingredients list
    const ingredientsList = ingredients.map(ing => `${ing.name} (${ing.quantity})`).join(', ')

    // Create prompt for AI
    const prompt = `Create a delicious recipe using these ingredients: ${ingredientsList}
    
    Requirements:
    - Number of servings: ${numberOfPeople || 2}
    - Food type: ${foodType || 'any'}
    - Dietary restrictions: ${dietaryRestrictions?.join(', ') || 'none'}
    
    Please provide:
    1. Recipe title
    2. Brief description
    3. List of ingredients with quantities
    4. Step-by-step cooking instructions
    5. Preparation time
    6. Difficulty level (Easy/Medium/Hard)
    7. Any additional tips or notes
    
    IMPORTANT: Respond ONLY with valid JSON in this exact format (no additional text or markdown):
    {
      "title": "Recipe Title",
      "description": "Brief description",
      "ingredients": [{"name": "ingredient", "quantity": "amount"}],
      "instructions": ["step 1", "step 2", "step 3"],
      "prepTime": "time in minutes",
      "difficulty": "Easy",
      "tips": "Additional tips"
    }`

    // Generate recipe using Gemini
    let recipeText
    try {
      const result = await model.generateContent([
        "You are a professional chef and recipe creator. Create delicious, practical recipes using the given ingredients.",
        prompt
      ])
      
      recipeText = result.response.text()
    } catch (geminiError) {
      console.error('Gemini API error:', geminiError)
      throw new Error('Failed to generate recipe with AI service')
    }
    
    let recipeData

    try {
      // Clean the response text to extract JSON
      const jsonMatch = recipeText.match(/\{[\s\S]*\}/)
      const jsonText = jsonMatch ? jsonMatch[0] : recipeText
      
      // Try to parse JSON response
      recipeData = JSON.parse(jsonText)
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      console.error('Raw response:', recipeText)
      
      // If JSON parsing fails, create a structured response
      recipeData = {
        title: "Generated Recipe",
        description: "A delicious recipe using your ingredients",
        ingredients: ingredients,
        instructions: ["Follow the recipe instructions carefully", "Adjust seasoning to taste"],
        prepTime: "30 minutes",
        difficulty: "Medium",
        tips: "Feel free to adjust ingredients based on your preferences"
      }
    }

    // Try to save recipe to database, but don't fail if it doesn't work
    let savedRecipe = null
    let saveError = null
    
    try {
      const result = await db.recipes.create({
        user_id: auth.user.userId,
        title: recipeData.title,
        description: recipeData.description,
        ingredients: recipeData.ingredients,
        instructions: recipeData.instructions,
        prep_time: recipeData.prepTime,
        servings: numberOfPeople || 2,
        difficulty: recipeData.difficulty,
        dietary_restrictions: dietaryRestrictions || [],
        tips: recipeData.tips
      })
      
      savedRecipe = result.data
      saveError = result.error
      
      if (saveError) {
        console.error('Save recipe error:', saveError)
      } else {
        console.log('Recipe saved successfully to database')
      }
    } catch (dbError) {
      console.error('Database connection error:', dbError)
      saveError = dbError
    }

    return NextResponse.json({
      message: 'Recipe generated successfully',
      recipe: {
        ...recipeData,
        id: savedRecipe?.id || `temp_${Date.now()}`
      },
      saved: !saveError
    })

  } catch (error) {
    console.error('Generate recipe error:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Failed to generate recipe'
    let statusCode = 500
    
    if (error.message.includes('Failed to generate recipe with AI service')) {
      errorMessage = 'AI service is currently unavailable. Please try again later.'
      statusCode = 503
    } else if (error.message.includes('API_KEY_INVALID')) {
      errorMessage = 'AI service configuration error. Please contact support.'
      statusCode = 500
    } else if (error.message.includes('QUOTA_EXCEEDED')) {
      errorMessage = 'AI service quota exceeded. Please try again later.'
      statusCode = 429
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}

// GET /api/recipes - Get user's saved recipes
export async function GET(request) {
  try {
    // Authenticate request
    const auth = authenticateRequest(request)
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: auth.error },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || 10)
    const offset = parseInt(searchParams.get('offset') || 0)

    // Use centralized database operations
    const { data: recipes, error } = await db.recipes.findByUser(auth.user.userId, limit, offset)

    if (error) {
      const errorResult = handleSupabaseError(error, 'Fetch recipes')
      return NextResponse.json(
        { error: errorResult.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      recipes,
      pagination: {
        limit,
        offset,
        hasMore: recipes.length === limit
      }
    })

  } catch (error) {
    console.error('Get recipes error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
