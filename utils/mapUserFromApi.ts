// utils/mapUserFromApi.ts
// Utility to map backend user API response to frontend user structure

export function mapUserFromApi(body: any) {
  // Add null/undefined checks to prevent errors
  if (!body) {
   
    throw new Error('User data is missing from API response');
  }

  if (!body._id) {
   
    throw new Error('User ID is missing from API response');
  }

  return {
    id: body._id,
    _id: body._id, // Add the required _id field
    name: body.name || '',
    email: body.email || '',
    avatar: body.profileImage || '',
    profileImage: body.profileImage || '',
    coverImage: body.coverImage || '',
    bio: body.bio || body.about?.summary || '',
    location: body.about?.location || '',
    website: body.about?.website || '',
    phone: body.about?.phone || '',
    headline: body.about?.headline || '',
    joinedDate: body.createAt ? new Date(body.createAt).getFullYear().toString() : new Date().getFullYear().toString(),
    education: (body.education || body.about?.education || []).map((e: any) => ({
      id: e._id || e.id,
      institution: e.institution || e.school || e.name || '',
      name: e.institution || e.school || e.name || '', // always provide 'name' for frontend
      degree: e.degree || '',
      field: e.field || e.fos || '',
      startYear: e.startYear || e.startDate || '',
      endYear: e.endYear || e.endDate || '',
      current: e.current || false,
      startDate: e.startDate ? e.startDate.substring(0,10) : '',
      endDate: e.endDate ? e.endDate.substring(0,10) : ''
    })),
    experience: (body.experience || body.about?.experience || []).map((e: any) => ({
      id: e._id || e.id,
      company: e.company || e.name || '',
      position: e.position || e.role || '',
      role: e.position || e.role || '',
      startDate: e.startDate || '',
      startYear: e.startDate ? new Date(e.startDate).getFullYear().toString() : '',
      endDate: e.endDate || '',
      endYear: e.endDate ? new Date(e.endDate).getFullYear().toString() : '',
      current: e.current || false,
      description: e.description || e.desc || '',
    })),
    skills: body.about?.skills || [],
    followers: Array.isArray(body.followers) ? body.followers.length : (body.followers || 0),
    following: Array.isArray(body.following) ? body.following.length : (body.following || 0),
    profileViews: body.profileViews || 0,
    socialLinks: [], // Add empty social links array
    isFollowing: false,
    isVerified: body.isVerified || false,
    // add any other fields you need
  };
}
