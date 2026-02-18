#Project Overview

Smart Bookmarks is a full-stack web application that allows authenticated users to securely store and manage personal bookmarks. Users can sign in using Google OAuth, add new bookmarks with a title and URL, and delete existing ones through a clean, responsive dashboard interface.

The application is built using Next.js (App Router) for the frontend and Supabase for authentication and database management. It demonstrates authenticated CRUD operations, protected routes using middleware, and client-side state synchronization for immediate UI updates.

This project was designed to showcase practical full-stack development skills, including authentication flows, database integration, production deployment, and handling real-world edge cases in a modern web stack.

##Challenges & Solutions
###1. Client State Not Updating After Insert

After adding a new bookmark, the UI did not update until the page was manually refreshed.

Root Cause:
BookmarkList is a client component that manages its own local state. Inserting a new row into Supabase does not automatically update that local React state. Additionally, router.refresh() only re-renders server components and does not reset client component state.

Solution:
After a successful insert, the newly created row is retrieved using .select().single() and dispatched via a CustomEvent. BookmarkList listens for this event and prepends the new bookmark to its local state. This ensures immediate UI updates without requiring a full page reload.

###2. Supabase Realtime Configuration

Initially, realtime updates were inconsistent.

Root Cause:
The bookmarks table was not added to the supabase_realtime publication, so database changes were not being broadcast.

Solution:
The table was added to the realtime publication in Supabase. However, for simplicity and reliability in this project, explicit state updates were preferred over realtime subscriptions.

###3. Deployment Issues on Vercel (Middleware Error 500)

After deploying, the app returned a MIDDLEWARE_INVOCATION_FAILED error.

Root Cause:
Supabase environment variables were not configured in the Vercel production environment.

Solution:
Added the required environment variables:

NEXT_PUBLIC_SUPABASE_URL

NEXT_PUBLIC_SUPABASE_ANON_KEY

Then redeployed the project.

###4. OAuth Redirect Configuration

Google login initially failed after deployment.

Root Cause:
Production URLs were not properly configured in Supabase and Google Cloud Console.

Solution:

Updated Supabase Site URL and redirect URL to the Vercel production domain.

Added the production domain to Google OAuth authorized origins.

Ensured Google redirect URI pointed to Supabase (/auth/v1/callback).
