# AnnaDan - Food Sharing Platform

A modern web application that connects communities through food sharing, featuring AI-powered recipe generation and a complete donation management system.

## 🚀 Project Overview

AnnaDan is a full-stack food sharing platform built with Next.js that allows users to:
- **Donate surplus food** to reduce waste
- **Request food** from community members
- **Generate AI recipes** using available ingredients
- **Manage pickup requests** with real-time status updates
- **Share feedback** and build community connections

## 🏗️ Architecture

### Frontend (Next.js 13+ App Router)
- **Framework**: Next.js with App Router
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Custom component library with shadcn/ui
- **State Management**: React hooks and context
- **Authentication**: JWT-based with localStorage
- **Animations**: Framer Motion

### Backend (Next.js API Routes)
- **API Routes**: Next.js API routes in `/app/api/`
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT tokens with bcrypt password hashing
- **File Storage**: Supabase Storage for images
- **AI Integration**: Google Gemini AI for recipe generation

### Database (Supabase)
- **Users**: User profiles and authentication
- **Food Donations**: Available food items
- **Pickup Requests**: Request management system
- **AI Recipes**: Generated recipe storage
- **Feedback**: Community feedback system
- **User Ratings**: User rating system

## 📁 Project Structure

```
annadan/
├── app/                          # Next.js App Router
│   ├── api/                      # Backend API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── donations/            # Food donation management
│   │   ├── pickup-requests/      # Pickup request system
│   │   ├── profile/              # User profile management
│   │   ├── recipes/              # AI recipe generation
│   │   └── feedback/             # Feedback system
│   ├── auth/                     # Authentication pages
│   │   ├── signin/               # Sign in page
│   │   └── signup/               # Sign up page
│   ├── donate/                   # Food donation page
│   ├── ai-recipe/                # AI recipe generation page
│   ├── feedback/                 # Feedback page
│   ├── profile/                  # User profile page
│   ├── about/                    # About page
│   ├── page.js                   # Home page
│   ├── layout.js                 # Root layout
│   └── globals.css               # Global styles
├── components/                   # Reusable UI components
│   ├── ui/                       # Base UI components
│   ├── FoodCard.js               # Food item display component
│   ├── Navbar.js                 # Navigation component
│   └── Footer.js                 # Footer component
├── lib/                          # Utility libraries
│   ├── api.js                    # API service layer
│   ├── hooks.js                  # Custom React hooks
│   ├── supabase.js               # Database operations
│   ├── auth.js                   # Authentication utilities
│   └── auth-context.js           # Authentication context
├── public/                       # Static assets
└── cleaned_schema_users_only.sql # Database schema
```

## 🔄 How Frontend & Backend Connect

### 1. API Service Layer (`lib/api.js`)
The frontend connects to the backend through a centralized API service layer:

```javascript
// Example: Making an API call
const response = await donationsAPI.getDonations()
if (response.success) {
  // Handle successful response
  setDonations(response.data)
} else {
  // Handle error
  setError(response.error)
}
```

**Key Features:**
- **Automatic Authentication**: Adds JWT tokens to all requests
- **Error Handling**: Centralized error management
- **Request Logging**: Detailed logging for debugging
- **Response Standardization**: Consistent response format

### 2. Custom React Hooks (`lib/hooks.js`)
Custom hooks manage API calls and state:

```javascript
// Example: Using the profile hook
const { profile, userDonations, isLoading, error } = useProfile()
```

**Available Hooks:**
- `useProfile()`: Manages user profile data
- `useDataFetch()`: Generic data fetching with loading states
- `useApiCall()`: Single API call management
- `useFormSubmit()`: Form submission with API integration

### 3. Authentication Flow
```javascript
// 1. User signs in
const response = await authAPI.signin(email, password)

// 2. Token is stored in localStorage
localStorage.setItem('authToken', response.data.token)

// 3. All subsequent requests include the token
headers.Authorization = `Bearer ${token}`

// 4. Backend validates the token
const auth = authenticateRequest(request)
```

## 🛠️ Backend API Endpoints

### Authentication (`/api/auth`)
- **POST `/api/auth`**: User registration
- **GET `/api/auth`**: User sign in
- **POST `/api/auth/verify`**: Email verification

**Data Flow:**
1. User submits signup form
2. Frontend calls `authAPI.signup()`
3. Backend creates user in database
4. JWT token generated and returned
5. Frontend stores token for future requests

### Food Donations (`/api/donations`)
- **GET `/api/donations`**: Get all available donations
- **GET `/api/donations?donor=me`**: Get user's donations
- **POST `/api/donations`**: Create new donation

**Data Flow:**
1. User fills donation form
2. Image uploaded to Supabase Storage
3. Donation data saved to database
4. Frontend refreshes donation list

### Pickup Requests (`/api/pickup-requests`)
- **POST `/api/pickup-requests`**: Create pickup request
- **GET `/api/pickup-requests?type=sent`**: Get user's sent requests
- **GET `/api/pickup-requests?type=received`**: Get user's received requests
- **PUT `/api/pickup-requests/[id]`**: Update request status
- **DELETE `/api/pickup-requests/[id]`**: Cancel request

**Data Flow:**
1. User requests food item
2. Request created with 'pending' status
3. Donor receives notification
4. Donor can approve/reject request
5. Status updates trigger UI changes

### Profile Management (`/api/profile`)
- **GET `/api/profile`**: Get user profile and statistics
- **PUT `/api/profile`**: Update user profile

**Data Flow:**
1. Profile page loads
2. Multiple API calls fetch user data
3. Data combined and displayed
4. User can edit and save changes

### AI Recipes (`/api/recipes`)
- **POST `/api/recipes`**: Generate AI recipe

**Data Flow:**
1. User submits ingredients
2. Frontend calls Gemini AI API
3. AI generates recipe
4. Recipe saved to database
5. User sees generated recipe

### Feedback System (`/api/feedback`)
- **POST `/api/feedback`**: Submit feedback
- **GET `/api/feedback`**: Get public feedback

**Data Flow:**
1. User submits feedback form
2. Feedback saved to database
3. Public feedback displayed on home page

## 🗄️ Database Schema

### Core Tables
- **users**: User accounts and profiles
- **food_donations**: Available food items
- **pickup_requests**: Food request management
- **ai_recipes**: Generated recipes
- **feedback**: Community feedback
- **user_ratings**: User rating system

### Key Relationships
- Users can have multiple donations
- Donations can have multiple pickup requests
- Users can rate each other
- Recipes are linked to users

## 🔐 Security Features

### Authentication
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Email Verification**: Required for account activation
- **Token Validation**: All protected routes validate tokens

### Data Protection
- **Row Level Security**: Database-level access control
- **Input Validation**: All inputs validated and sanitized
- **Error Handling**: Secure error messages
- **File Upload Security**: Image upload validation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Google Gemini API key

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run database migrations
5. Start development server: `npm run dev`

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

## 🎯 Key Features Explained

### 1. Food Donation System
- Users can donate surplus food
- Images uploaded to cloud storage
- Real-time status updates
- Location-based filtering

### 2. Pickup Request Management
- Requesters can request available food
- Donors can approve/reject requests
- Real-time status tracking
- Email notifications (planned)

### 3. AI Recipe Generation
- Google Gemini AI integration
- Ingredient-based recipe generation
- Recipe saving and sharing
- Dietary restriction support

### 4. User Profile System
- Complete profile management
- Statistics and activity tracking
- Image upload support
- Donation and request history

### 5. Feedback System
- Community feedback collection
- Public feedback display
- Rating system for users
- Admin feedback management

## 🔧 Development

### Adding New Features
1. Create API route in `/app/api/`
2. Add service function in `/lib/api.js`
3. Create custom hook if needed
4. Build frontend component
5. Test data flow end-to-end

### Database Changes
1. Update schema in Supabase
2. Modify database operations in `/lib/supabase.js`
3. Update API routes if needed
4. Test with existing data

## 📱 User Experience

### For Donors
- Easy food donation process
- Image upload with preview
- Request management dashboard
- Real-time status updates

### For Requesters
- Browse available food
- Request food with messages
- Track request status
- Contact donor information

### For All Users
- AI recipe generation
- Community feedback
- User rating system
- Responsive design

## 🚀 Deployment

The application is ready for deployment on platforms like:
- Vercel (recommended for Next.js)
- Netlify
- AWS
- Any Node.js hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

## 🍽️ **Complete Donations System - Backend to Frontend**

### 📋 **System Overview**

The donations system in AnnaDan is a complete food sharing platform that allows users to donate surplus food and others to request it. Here's the complete flow from backend to frontend:

---

### 🗄️ **Database Layer (Supabase)**

#### **Database Schema:**
```sql
-- food_donations table
CREATE TABLE food_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  food_type VARCHAR(50) NOT NULL,
  quantity VARCHAR(100),
  expiry_date DATE NOT NULL,
  pickup_location VARCHAR(255) NOT NULL,
  image_url TEXT,
  status VARCHAR(20) DEFAULT 'available',
  donor_contact JSONB,
  additional_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Status Values:**
- `available` - Food is available for pickup
- `reserved` - Food is reserved for someone
- `picked_up` - Food has been picked up
- `expired` - Food has expired
- `cancelled` - Donation was cancelled

---

### 🔧 **Backend API Layer**

#### **1. API Route: `/app/api/donations/route.js`**

##### **GET `/api/donations` - Fetch Donations**

**Purpose:** Get all available donations with optional filtering

**Query Parameters:**
- `foodType` - Filter by food type (Veg, Non-Veg, etc.)
- `location` - Filter by pickup location
- `donor=me` - Get current user's donations (requires auth)
- `limit` - Number of results (default: 20)
- `offset` - Pagination offset (default: 0)

**Two Different Flows:**

**A. Public Donations (No Auth Required):**
```javascript
// URL: /api/donations?foodType=Veg&location=New York
const { data: donations } = await db.donations.findAvailable({
  foodType: 'Veg',
  location: 'New York',
  limit: 20,
  offset: 0
})
```

**B. User's Own Donations (Auth Required):**
```javascript
// URL: /api/donations?donor=me
const auth = authenticateRequest(request)
const { data: donations } = await db.donations.findByUser(auth.user.userId)
```

**Response Format:**
```json
{
  "donations": [
    {
      "id": "uuid",
      "title": "Fresh Vegetables",
      "description": "Organic vegetables from my garden",
      "food_type": "Veg",
      "quantity": "2 kg",
      "expiry_date": "2024-01-15",
      "pickup_location": "123 Main St, New York",
      "image_url": "https://supabase.../image.jpg",
      "status": "available",
      "donor": {
        "id": "user-uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "avatar_url": "https://..."
      },
      "created_at": "2024-01-10T10:00:00Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

##### **POST `/api/donations` - Create Donation**

**Purpose:** Create a new food donation

**Authentication:** Required (JWT token)

**Request Format:** FormData (for file uploads)
```javascript
const formData = new FormData()
formData.append('foodName', 'Fresh Bread')
formData.append('foodType', 'Veg')
formData.append('quantity', '5 loaves')
formData.append('description', 'Freshly baked bread')
formData.append('expiryDate', '2024-01-15')
formData.append('pickupLocation', '123 Main St')
formData.append('contactName', 'John Doe')
formData.append('contactPhone', '+1234567890')
formData.append('contactEmail', 'john@example.com')
formData.append('foodImage', imageFile) // File object
```

**Validation:**
- Required fields: `foodName`, `foodType`, `quantity`, `expiryDate`, `pickupLocation`
- Expiry date must be in the future
- Image upload is optional

**Process:**
1. **Authenticate** user via JWT token
2. **Validate** required fields
3. **Upload image** to Supabase Storage (if provided)
4. **Create donation** record in database
5. **Return** created donation with donor info

---

### 🗃️ **Database Operations Layer**

#### **File: `lib/supabase.js`**

##### **Donations Operations:**
```javascript
donations: {
  // Get donation by ID
  findById: (id) => supabase.from('food_donations').select('*').eq('id', id).single(),
  
  // Get user's donations
  findByUser: (userId) => supabase
    .from('food_donations')
    .select('*')
    .eq('donor_id', userId)
    .order('created_at', { ascending: false }),
  
  // Get available donations with filters
  findAvailable: (filters = {}) => {
    let query = supabase
      .from('food_donations')
      .select(`
        *,
        donor:users!donor_id (
          id, name, email, phone, avatar_url
        )
      `)
      .eq('status', 'available')
      .gte('expiry_date', new Date().toISOString().split('T')[0])
      .order('created_at', { ascending: false })
    
    // Apply filters
    if (filters.foodType && filters.foodType !== 'All') {
      query = query.eq('food_type', filters.foodType)
    }
    if (filters.location) {
      query = query.ilike('pickup_location', `%${filters.location}%`)
    }
    if (filters.limit && filters.offset) {
      query = query.range(filters.offset, filters.offset + filters.limit - 1)
    }
    
    return query
  },
  
  // Create new donation
  create: (donationData) => supabase.from('food_donations').insert([donationData]).select().single(),
  
  // Update donation
  update: (id, updates) => supabase.from('food_donations').update(updates).eq('id', id).select().single(),
  
  // Delete donation
  delete: (id) => supabase.from('food_donations').delete().eq('id', id)
}
```

---

### 🌐 **API Service Layer**

#### **File: `lib/api.js`**

##### **Donations API Service:**
```javascript
export const donationsAPI = {
  // Get all available donations
  getDonations: async (filters = {}) => {
    const params = new URLSearchParams(filters)
    const response = await apiRequest(`/donations?${params}`)
    
    // Extract donations array from response
    if (response.success && response.data && response.data.donations) {
      return {
        ...response,
        data: response.data.donations
      }
    }
    return response
  },
  
  // Create new donation
  createDonation: async (donationData) => {
    if (donationData.foodImage) {
      // Use FormData for file uploads
      const formData = new FormData()
      formData.append('foodName', donationData.title)
      formData.append('foodType', donationData.food_type)
      // ... other fields
      formData.append('foodImage', donationData.foodImage)
      
      return apiRequest('/donations', {
        method: 'POST',
        body: formData,
        headers: {} // Let browser set Content-Type
      })
    } else {
      // Use JSON for regular data
      return apiRequest('/donations', {
        method: 'POST',
        body: JSON.stringify(donationData)
      })
    }
  }
}
```

---

### ⚛️ **Frontend Layer**

#### **1. Home Page - Display Donations**

##### **File: `app/page.js`**

**Data Fetching:**
```javascript
const { isLoading, error, data: donations, fetchData } = useDataFetch(donationsAPI.getDonations)

// Fetch data on component mount
useEffect(() => {
  fetchData().then(result => {
    console.log('Fetch result:', result)
  })
}, [fetchData])
```

**Data Transformation:**
```javascript
const transformDonationToFood = (donation) => {
  return {
    id: donation.id,
    name: donation.title,
    type: donation.food_type,
    description: donation.description,
    expiry: donation.expiry_date,
    location: donation.pickup_location,
    image: donation.image_url || '/placeholder-food.jpg',
    donor: {
      name: donation.donor?.name || 'Anonymous',
      phone: donation.donor_contact?.phone || 'N/A',
      email: donation.donor_contact?.email || 'N/A',
      contactName: donation.donor_contact?.name || donation.donor?.name || 'Anonymous'
    }
  }
}
```

**Filtering:**
```javascript
const filteredFoods = useMemo(() => {
  if (error || !Array.isArray(donations)) return []
  
  const transformedDonations = donations.map(transformDonationToFood).filter(Boolean)
  
  if (activeFilter === 'All') return transformedDonations
  
  return transformedDonations.filter(food => food.type === activeFilter)
}, [donations, activeFilter, error])
```

#### **2. Profile Page - User's Donations**

##### **File: `app/profile/page.js`**

**Data Fetching via Custom Hook:**
```javascript
const {
  profile,
  userDonations,        // User's own donations
  receivedRequests,     // Pickup requests for user's donations
  sentRequests,         // User's sent pickup requests
  isLoading,
  error
} = useProfile()
```

**Display User's Donations:**
```javascript
{userDonations && userDonations.length > 0 ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {userDonations.map((donation, index) => (
      <FoodCard 
        food={{
          name: donation.title,
          type: donation.food_type,
          description: donation.description,
          expiry: donation.expiry_date,
          location: donation.pickup_location,
          image: donation.image_url,
          quantity: donation.quantity
        }}
        actionType="donate"
        hideAction
      />
    ))}
  </div>
) : (
  <div className="text-center py-12">
    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <p className="text-gray-600">No donations yet</p>
  </div>
)}
```

#### **3. Donation Form - Create Donations**

##### **File: `app/donate/page.js`**

**Form Submission:**
```javascript
const handleFormSubmit = async (formData) => {
  setIsSubmitting(true)
  
  try {
    // Show success toast
    addToast({
      title: "Donation Submitted! 🎉",
      description: "Thank you for your generous food donation.",
      duration: 5000,
    })
    
    // Redirect to profile page
    window.location.href = '/profile'
    
  } catch (error) {
    addToast({
      title: "Submission Failed",
      description: "There was an error submitting your donation.",
      variant: "destructive",
    })
  } finally {
    setIsSubmitting(false)
  }
}
```

---

### 🔄 **Complete Data Flow**

#### **1. Creating a Donation:**

```
User fills form → DonationForm component → donationsAPI.createDonation() → 
POST /api/donations → authenticateRequest() → validateFormData() → 
uploadImage() → db.donations.create() → Supabase → 
Return success → Show toast → Redirect to profile
```

#### **2. Fetching Donations:**

```
Home page loads → useDataFetch(donationsAPI.getDonations) → 
GET /api/donations → db.donations.findAvailable() → Supabase query → 
Return donations with donor info → Transform data → 
Display in FoodCard components
```

#### **3. User's Profile Donations:**

```
Profile page loads → useProfile() hook → Multiple API calls:
- profileAPI.getProfile() → GET /api/profile
- profileAPI.getUserDonations() → GET /api/donations?donor=me
- profileAPI.getReceivedPickupRequests() → GET /api/pickup-requests?type=received
- profileAPI.getSentPickupRequests() → GET /api/pickup-requests?type=sent
→ Combine all data → Display in different sections
```

---

### 🎯 **Key Features**

#### **1. Image Upload:**
- Images uploaded to Supabase Storage
- Automatic filename generation with timestamp
- Fallback to placeholder if no image

#### **2. Real-time Status Updates:**
- Donations can be `available`, `reserved`, `picked_up`, `expired`, `cancelled`
- Status changes trigger UI updates
- Automatic filtering of expired donations

#### **3. Filtering & Search:**
- Filter by food type (Veg, Non-Veg, Packaged, Cooked)
- Search by location
- Pagination support

#### **4. Authentication & Security:**
- JWT token authentication for protected routes
- Users can only see their own donations in profile
- Public donations visible to all users

#### **5. Error Handling:**
- Comprehensive error handling at all levels
- User-friendly error messages
- Graceful fallbacks for missing data

---

### 🚀 **Performance Optimizations**

#### **1. Data Fetching:**
- Custom hooks for state management
- Automatic loading states
- Error boundary handling

#### **2. Database Queries:**
- Optimized Supabase queries with joins
- Pagination to limit data transfer
- Indexing on frequently queried fields

#### **3. Frontend:**
- Memoized filtering and transformation
- Lazy loading of images
- Responsive design with Tailwind CSS

---

**AnnaDan** - Connecting communities through food sharing, one meal at a time. 🍽️❤️