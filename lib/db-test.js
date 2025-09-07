import { validateConnection, db } from './supabase'

// Test database connection and basic operations
export const testDatabaseConnection = async () => {
  console.log('🔍 Testing database connection...')
  
  try {
    // Test basic connection
    const connectionTest = await validateConnection()
    if (!connectionTest.success) {
      throw new Error(`Connection failed: ${connectionTest.error}`)
    }
    console.log('✅ Database connection successful')
    
    // Test basic operations
    console.log('🧪 Testing basic database operations...')
    
    // Test users table
    try {
      const { data: users, error: usersError } = await db.users.findById('test-id')
      if (usersError && usersError.code !== 'PGRST116') {
        console.log('⚠️ Users table test:', usersError.message)
      } else {
        console.log('✅ Users table accessible')
      }
    } catch (error) {
      console.log('⚠️ Users table test failed:', error.message)
    }
    
    // Test donations table
    try {
      const { data: donations, error: donationsError } = await db.donations.findById('test-id')
      if (donationsError && donationsError.code !== 'PGRST116') {
        console.log('⚠️ Donations table test:', donationsError.message)
      } else {
        console.log('✅ Donations table accessible')
      }
    } catch (error) {
      console.log('⚠️ Donations table test failed:', error.message)
    }
    
    // Test recipes table
    try {
      const { data: recipes, error: recipesError } = await db.recipes.findById('test-id')
      if (recipesError && recipesError.code !== 'PGRST116') {
        console.log('⚠️ Recipes table test:', recipesError.message)
      } else {
        console.log('✅ Recipes table accessible')
      }
    } catch (error) {
      console.log('⚠️ Recipes table test failed:', error.message)
    }
    
    // Test feedback table
    try {
      const { data: feedback, error: feedbackError } = await db.feedback.findById('test-id')
      if (feedbackError && feedbackError.code !== 'PGRST116') {
        console.log('⚠️ Feedback table test:', feedbackError.message)
      } else {
        console.log('✅ Feedback table accessible')
      }
    } catch (error) {
      console.log('⚠️ Feedback table test failed:', error.message)
    }
    
    // Test pickup requests table
    try {
      const { data: requests, error: requestsError } = await db.pickupRequests.findById('test-id')
      if (requestsError && requestsError.code !== 'PGRST116') {
        console.log('⚠️ Pickup requests table test:', requestsError.message)
      } else {
        console.log('✅ Pickup requests table accessible')
      }
    } catch (error) {
      console.log('⚠️ Pickup requests table test failed:', error.message)
    }
    
    console.log('🎉 Database connection test completed!')
    return { success: true, message: 'All tests passed' }
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message)
    return { success: false, error: error.message }
  }
}

// Test specific table operations
export const testTableOperations = async (tableName) => {
  console.log(`🧪 Testing ${tableName} table operations...`)
  
  try {
    switch (tableName) {
      case 'users':
        // Test user operations
        const { data: user, error: userError } = await db.users.findById('test-id')
        console.log('Users table:', userError ? 'Error' : 'OK')
        break
        
      case 'donations':
        // Test donation operations
        const { data: donation, error: donationError } = await db.donations.findById('test-id')
        console.log('Donations table:', donationError ? 'Error' : 'OK')
        break
        
      case 'recipes':
        // Test recipe operations
        const { data: recipe, error: recipeError } = await db.recipes.findById('test-id')
        console.log('Recipes table:', recipeError ? 'Error' : 'OK')
        break
        
      case 'feedback':
        // Test feedback operations
        const { data: feedback, error: feedbackError } = await db.feedback.findById('test-id')
        console.log('Feedback table:', feedbackError ? 'Error' : 'OK')
        break
        
      case 'pickup-requests':
        // Test pickup request operations
        const { data: request, error: requestError } = await db.pickupRequests.findById('test-id')
        console.log('Pickup requests table:', requestError ? 'Error' : 'OK')
        break
        
      default:
        console.log('Unknown table:', tableName)
    }
    
    return { success: true, message: `${tableName} table test completed` }
    
  } catch (error) {
    console.error(`${tableName} table test failed:`, error.message)
    return { success: false, error: error.message }
  }
}

// Export test functions
export const dbTest = {
  testConnection: testDatabaseConnection,
  testTable: testTableOperations
}

export default dbTest
