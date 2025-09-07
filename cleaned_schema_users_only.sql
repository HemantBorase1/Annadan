-- =============================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- =============================================
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS food_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pickup_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ai_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_ratings ENABLE ROW LEVEL SECURITY;

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying(100) NOT NULL,
  email character varying(255) NOT NULL UNIQUE,
  password_hash character varying(255) NOT NULL,
  phone character varying(20),
  avatar_url character varying(500),
  avatar_public_id character varying(255),
  address text,
  city character varying(100),
  state character varying(100),
  zip_code character varying(20),
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- =============================================
-- FOOD DONATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.food_donations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  donor_id uuid NOT NULL,
  title character varying(255) NOT NULL,
  description text,
  food_type character varying(50) NOT NULL,
  quantity character varying(100) NOT NULL,
  expiry_date date NOT NULL,
  pickup_location text NOT NULL,
  image_url character varying(500),
  image_public_id character varying(255),
  status character varying(20) DEFAULT 'available'::character varying CHECK (status::text = ANY (ARRAY['available', 'reserved', 'picked_up', 'expired', 'cancelled'])),
  donor_contact jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT food_donations_pkey PRIMARY KEY (id),
  CONSTRAINT food_donations_donor_id_fkey FOREIGN KEY (donor_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- =============================================
-- PICKUP REQUESTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.pickup_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  donation_id uuid NOT NULL,
  requester_id uuid NOT NULL,
  status character varying(20) DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending', 'approved', 'rejected', 'cancelled', 'completed'])),
  message text,
  pickup_time timestamp with time zone,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pickup_requests_pkey PRIMARY KEY (id),
  CONSTRAINT pickup_requests_donation_id_fkey FOREIGN KEY (donation_id) REFERENCES public.food_donations(id) ON DELETE CASCADE,
  CONSTRAINT pickup_requests_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- =============================================
-- AI RECIPES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.ai_recipes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title character varying(255) NOT NULL,
  description text,
  ingredients jsonb NOT NULL,
  instructions jsonb NOT NULL,
  prep_time character varying(50),
  servings integer,
  difficulty character varying(20) CHECK (difficulty::text = ANY (ARRAY['Easy', 'Medium', 'Hard'])),
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT ai_recipes_pkey PRIMARY KEY (id),
  CONSTRAINT ai_recipes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- =============================================
-- FEEDBACK TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  name character varying(100),
  email character varying(255),
  subject character varying(255),
  message text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  category character varying(50) DEFAULT 'general' CHECK (category::text = ANY (ARRAY['general', 'bug_report', 'feature_request', 'complaint', 'praise'])),
  status character varying(20) DEFAULT 'open' CHECK (status::text = ANY (ARRAY['open', 'in_progress', 'resolved', 'closed'])),
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT feedback_pkey PRIMARY KEY (id),
  CONSTRAINT feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL
);

-- =============================================
-- USER RATINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_ratings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  rater_id uuid NOT NULL,
  rated_user_id uuid NOT NULL,
  donation_id uuid,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT user_ratings_pkey PRIMARY KEY (id),
  CONSTRAINT user_ratings_rater_id_fkey FOREIGN KEY (rater_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT user_ratings_donation_id_fkey FOREIGN KEY (donation_id) REFERENCES public.food_donations(id) ON DELETE CASCADE,
  CONSTRAINT user_ratings_rated_user_id_fkey FOREIGN KEY (rated_user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- =============================================
-- ROW LEVEL SECURITY POLICIES (IDEMPOTENT)
-- =============================================

-- USERS
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- FOOD DONATIONS
DROP POLICY IF EXISTS "Anyone can view available donations" ON public.food_donations;
CREATE POLICY "Anyone can view available donations" ON public.food_donations
  FOR SELECT USING (status = 'available');

DROP POLICY IF EXISTS "Users can view their own donations" ON public.food_donations;
CREATE POLICY "Users can view their own donations" ON public.food_donations
  FOR SELECT USING (auth.uid() = donor_id);

DROP POLICY IF EXISTS "Authenticated users can create donations" ON public.food_donations;
CREATE POLICY "Authenticated users can create donations" ON public.food_donations
  FOR INSERT WITH CHECK (auth.uid() = donor_id);

DROP POLICY IF EXISTS "Users can update their own donations" ON public.food_donations;
CREATE POLICY "Users can update their own donations" ON public.food_donations
  FOR UPDATE USING (auth.uid() = donor_id);

DROP POLICY IF EXISTS "Users can delete their own donations" ON public.food_donations;
CREATE POLICY "Users can delete their own donations" ON public.food_donations
  FOR DELETE USING (auth.uid() = donor_id);

-- PICKUP REQUESTS
DROP POLICY IF EXISTS "Users can view their own pickup requests" ON public.pickup_requests;
CREATE POLICY "Users can view their own pickup requests" ON public.pickup_requests
  FOR SELECT USING (
    auth.uid() = requester_id OR 
    auth.uid() IN (SELECT donor_id FROM public.food_donations WHERE id = donation_id)
  );

DROP POLICY IF EXISTS "Authenticated users can create pickup requests" ON public.pickup_requests;
CREATE POLICY "Authenticated users can create pickup requests" ON public.pickup_requests
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Donors can update pickup requests for their donations" ON public.pickup_requests;
CREATE POLICY "Donors can update pickup requests for their donations" ON public.pickup_requests
  FOR UPDATE USING (
    auth.uid() IN (SELECT donor_id FROM public.food_donations WHERE id = donation_id)
  );

DROP POLICY IF EXISTS "Requesters can update their own requests" ON public.pickup_requests;
CREATE POLICY "Requesters can update their own requests" ON public.pickup_requests
  FOR UPDATE USING (auth.uid() = requester_id);

-- AI RECIPES
DROP POLICY IF EXISTS "Users can view their own recipes" ON public.ai_recipes;
CREATE POLICY "Users can view their own recipes" ON public.ai_recipes
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can create recipes" ON public.ai_recipes;
CREATE POLICY "Authenticated users can create recipes" ON public.ai_recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own recipes" ON public.ai_recipes;
CREATE POLICY "Users can update their own recipes" ON public.ai_recipes
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own recipes" ON public.ai_recipes;
CREATE POLICY "Users can delete their own recipes" ON public.ai_recipes
  FOR DELETE USING (auth.uid() = user_id);

-- FEEDBACK
DROP POLICY IF EXISTS "Anyone can view public feedback" ON public.feedback;
CREATE POLICY "Anyone can view public feedback" ON public.feedback
  FOR SELECT USING (status IN ('open', 'resolved') AND category IN ('general', 'praise', 'feature_request'));

DROP POLICY IF EXISTS "Anyone can create feedback" ON public.feedback;
CREATE POLICY "Anyone can create feedback" ON public.feedback
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own feedback" ON public.feedback;
CREATE POLICY "Users can view their own feedback" ON public.feedback
  FOR SELECT USING (auth.uid() = user_id);

-- USER RATINGS
DROP POLICY IF EXISTS "Users can view ratings for their donations" ON public.user_ratings;
CREATE POLICY "Users can view ratings for their donations" ON public.user_ratings
  FOR SELECT USING (
    auth.uid() = rated_user_id OR 
    auth.uid() IN (SELECT donor_id FROM public.food_donations WHERE id = donation_id)
  );

DROP POLICY IF EXISTS "Authenticated users can create ratings" ON public.user_ratings;
CREATE POLICY "Authenticated users can create ratings" ON public.user_ratings
  FOR INSERT WITH CHECK (auth.uid() = rater_id);

DROP POLICY IF EXISTS "Users can update their own ratings" ON public.user_ratings;
CREATE POLICY "Users can update their own ratings" ON public.user_ratings
  FOR UPDATE USING (auth.uid() = rater_id);

DROP POLICY IF EXISTS "Users can delete their own ratings" ON public.user_ratings;
CREATE POLICY "Users can delete their own ratings" ON public.user_ratings
  FOR DELETE USING (auth.uid() = rater_id);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Food Donations
CREATE INDEX IF NOT EXISTS idx_food_donations_donor_id ON public.food_donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_food_donations_status ON public.food_donations(status);
CREATE INDEX IF NOT EXISTS idx_food_donations_food_type ON public.food_donations(food_type);
CREATE INDEX IF NOT EXISTS idx_food_donations_expiry_date ON public.food_donations(expiry_date);
CREATE INDEX IF NOT EXISTS idx_food_donations_created_at ON public.food_donations(created_at);

-- Pickup Requests
CREATE INDEX IF NOT EXISTS idx_pickup_requests_donation_id ON public.pickup_requests(donation_id);
CREATE INDEX IF NOT EXISTS idx_pickup_requests_requester_id ON public.pickup_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_pickup_requests_status ON public.pickup_requests(status);

-- AI Recipes
CREATE INDEX IF NOT EXISTS idx_ai_recipes_user_id ON public.ai_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_recipes_created_at ON public.ai_recipes(created_at);

-- Feedback
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON public.feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_category ON public.feedback(category);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at);

-- User Ratings
CREATE INDEX IF NOT EXISTS idx_user_ratings_rater_id ON public.user_ratings(rater_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_rated_user_id ON public.user_ratings(rated_user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_donation_id ON public.user_ratings(donation_id);
