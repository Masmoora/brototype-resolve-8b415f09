-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'student');

-- Create enum for approval status
CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');

-- Create enum for complaint status
CREATE TYPE public.complaint_status AS ENUM ('pending', 'assigned', 'in_progress', 'resolved');

-- Create enum for complaint priority
CREATE TYPE public.complaint_priority AS ENUM ('low', 'medium', 'high');

-- Create enum for batch type
CREATE TYPE public.batch_type AS ENUM ('remote', 'offline');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  role app_role NOT NULL,
  status approval_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student_details table
CREATE TABLE public.student_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  batch_type batch_type NOT NULL,
  batch_number TEXT NOT NULL,
  course TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create staff_details table
CREATE TABLE public.staff_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create complaint_categories table
CREATE TABLE public.complaint_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create complaints table
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.complaint_categories(id) ON DELETE SET NULL,
  priority complaint_priority NOT NULL DEFAULT 'medium',
  status complaint_status NOT NULL DEFAULT 'pending',
  assigned_staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create complaint_comments table
CREATE TABLE public.complaint_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin' AND status = 'approved'
  );
$$;

-- Create security definer function to check if user is staff
CREATE OR REPLACE FUNCTION public.is_staff(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'staff' AND status = 'approved'
  );
$$;

-- Profiles RLS policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Student details RLS policies
CREATE POLICY "Students can view own details"
  ON public.student_details FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all student details"
  ON public.student_details FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Students can insert own details"
  ON public.student_details FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Staff details RLS policies
CREATE POLICY "Staff can view own details"
  ON public.staff_details FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all staff details"
  ON public.staff_details FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Staff can insert own details"
  ON public.staff_details FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Complaint categories RLS policies
CREATE POLICY "Anyone can view categories"
  ON public.complaint_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.complaint_categories FOR ALL
  USING (public.is_admin(auth.uid()));

-- Complaints RLS policies
CREATE POLICY "Students can view own complaints"
  ON public.complaints FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Staff can view assigned complaints"
  ON public.complaints FOR SELECT
  USING (auth.uid() = assigned_staff_id);

CREATE POLICY "Admins can view all complaints"
  ON public.complaints FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Students can create complaints"
  ON public.complaints FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Staff can update assigned complaints"
  ON public.complaints FOR UPDATE
  USING (auth.uid() = assigned_staff_id);

CREATE POLICY "Admins can update all complaints"
  ON public.complaints FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Complaint comments RLS policies
CREATE POLICY "Users can view comments on their complaints"
  ON public.complaint_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.complaints
      WHERE id = complaint_id 
      AND (student_id = auth.uid() OR assigned_staff_id = auth.uid())
    ) OR public.is_admin(auth.uid())
  );

CREATE POLICY "Users can create comments on relevant complaints"
  ON public.complaint_comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    (EXISTS (
      SELECT 1 FROM public.complaints
      WHERE id = complaint_id 
      AND (student_id = auth.uid() OR assigned_staff_id = auth.uid())
    ) OR public.is_admin(auth.uid()))
  );

-- Notifications RLS policies
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone, role, status)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    (NEW.raw_user_meta_data->>'role')::app_role,
    'pending'::approval_status
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert default admin user (will be created via signup)
-- Insert some default categories
INSERT INTO public.complaint_categories (name, description) VALUES
  ('Technical', 'Technical and infrastructure related issues'),
  ('Hostel', 'Hostel accommodation and facilities'),
  ('Mess', 'Food and mess related complaints'),
  ('Course', 'Course content and teaching related'),
  ('Facilities', 'General facility and amenities issues');

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;
ALTER PUBLICATION supabase_realtime ADD TABLE public.complaint_comments;