# PostCard Navigation Fix Test

## Changes Made:

1. **Added `getUserById` function** in `api/user.ts`:
   - New API function to fetch a specific user by ID
   - Will try to fetch from `/user/{userId}` endpoint

2. **Updated `fetchUserProfile` function** in `app/profile/[id].tsx`:
   - Now properly handles different user IDs
   - If viewing own profile: fetches current user's profile using existing `/user/getUser` endpoint
   - If viewing another user's profile: 
     - First tries to get user data from existing post data (fallback mechanism)
     - If that fails, tries the new API endpoint
     - If that also fails, shows error

## How to Test:

1. **Open the social app** in your development environment
2. **Navigate to the home/feed screen** where PostCard components are displayed
3. **Click on a user's profile photo or name** in any post
4. **Verify that it navigates to that specific user's profile**, not your own profile

## Expected Behavior:

- ✅ Clicking on post creator's avatar should navigate to `/profile/{post.author.id}`
- ✅ Profile screen should show the post creator's information (name, bio, posts, etc.)
- ✅ If viewing your own profile, it should use the existing `/user/getUser` endpoint
- ✅ If viewing another user's profile, it should use user data from posts as fallback
- ✅ Posts tab should show only posts from that specific user

## Fallback Mechanism:

Since the backend might not have a `/user/{id}` endpoint yet, the solution uses user data from the posts store as a fallback. This means:

- User information displayed will be based on what's available in the post author data
- Basic profile info like name, avatar, headline will be shown
- Full profile details (experience, education, etc.) might not be available until proper backend support is added

## Future Backend Implementation:

When the backend is ready, add this endpoint:
```
GET /user/{userId}
Authorization: Bearer {token}

Returns:
{
  "body": {
    "_id": "user_id",
    "name": "User Name",
    "profileImage": "avatar_url",
    "bio": "User bio",
    // ... other user fields
  }
}
```
