-- Supabase Database Setup - STEP 1: Extensions and Types
-- Run this first in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create custom types
CREATE TYPE user_role AS ENUM ('super_admin', 'team', 'guest');
CREATE TYPE user_status AS ENUM ('pending', 'approved', 'blocked');
CREATE TYPE processing_status AS ENUM ('pending', 'processing', 'completed', 'failed'); 