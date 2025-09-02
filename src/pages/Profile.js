import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, uploadAvatar } from '../lib/supabase';
import Header from '../components/common/Header';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';
import { 
  Eye, 
  EyeOff, 
  Save, 
  Camera,
  CheckCircle,
  AlertCircle,
  Search,
  FileText,
  Users,
  Clock
} from 'lucide-react';

const Profile = () => {
  const { user, updatePassword } = useAuth();
  const navigate = useNavigate();
  const { clearAvatarCache, ...userProfile } = useUserProfile(user);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
     // Profile data state
   const [profileData, setProfileData] = useState({
     first_name: '',
     last_name: '',
     company_name: '',
     phone: '',
     role: 'FREEMIUM',
     user_avatar: null
   });
   
   // Original profile data for change detection
   const [originalProfileData, setOriginalProfileData] = useState({
     first_name: '',
     last_name: '',
     company_name: '',
     phone: '',
     role: 'FREEMIUM',
     user_avatar: null
   });
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  // Activity stats state
  const [activityStats, setActivityStats] = useState({
    companies_viewed: 0,
    searches_performed: 0,
    reports_generated: 0,
    watchlist_items: 0,
    last_activity: null,
    api_quota_used: 0,
    api_quota_limit: 100
  });

  const createProfile = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .insert([{
          id: user.id,
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          company_name: '',
          phone: '',
          role: 'FREEMIUM',
          is_active: true,
          api_quota_used: 0,
          api_quota_limit: 100
        }]);

      if (error) throw error;
      
      // After creating profile, fetch it directly instead of calling fetchProfileData
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfileData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          company_name: data.company_name || '',
          phone: data.phone || '',
          role: data.role || 'FREEMIUM',
          user_avatar: data.user_avatar || null
        });
        
        setActivityStats(prev => ({
          ...prev,
          api_quota_used: data.api_quota_used || 0,
          api_quota_limit: data.api_quota_limit || 100
        }));
      }

              // Create some sample activity data for demonstration
        try {
          const sampleActivities = [
            {
              id: `sample-${user.id}-1`,
              user_id: user.id,
              activity_type: 'VIEW_PROFILE',
              timestamp: new Date().toISOString(),
              created_at: new Date().toISOString()
            },
            {
              id: `sample-${user.id}-2`,
              user_id: user.id,
              activity_type: 'SEARCH',
              search_query: 'Sample search',
              timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
              created_at: new Date().toISOString()
            }
          ];

          const { error: activityError } = await supabase
            .from('user_activity_logs')
            .insert(sampleActivities);

          if (activityError) {
            console.log('Sample activity creation error:', activityError);
          }

          // Create a sample watchlist for demonstration
          try {
            const { data: watchlistData, error: watchlistError } = await supabase
              .from('watchlists')
              .insert([{
                id: `sample-watchlist-${user.id}`,
                user_id: user.id,
                name: 'My Watchlist',
                description: 'Sample watchlist for demonstration'
              }])
              .select()
              .single();

            if (watchlistError) {
              console.log('Sample watchlist creation error:', watchlistError);
            } else if (watchlistData) {
              // Add a sample company to the watchlist if companies exist
              const { data: sampleCompany } = await supabase
                .from('companies')
                .select('id')
                .limit(1)
                .single();

              if (sampleCompany) {
                await supabase
                  .from('watchlist_companies')
                  .insert([{
                    id: `sample-watchlist-company-${user.id}`,
                    watchlist_id: watchlistData.id,
                    company_id: sampleCompany.id,
                    notes: 'Sample company added for demonstration'
                  }]);
              }
            }
          } catch (watchlistError) {
            console.log('Sample watchlist creation failed:', watchlistError);
          }
        } catch (activityError) {
          console.log('Sample activity creation failed:', activityError);
        }
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  }, [user?.id, user?.user_metadata?.first_name, user?.user_metadata?.last_name]);

  const fetchActivityStats = useCallback(async () => {
    try {
      // Get companies viewed count - simplified query
      let companiesViewed = 0;
      try {
        const { count, error } = await supabase
          .from('user_activity_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('activity_type', 'VIEW_PROFILE');

        if (error) {
          console.log('View profile count error:', error);
        } else {
          companiesViewed = count || 0;
        }
      } catch (error) {
        console.log('View profile count processing error:', error);
      }

      // Get searches count - simplified query
      let searches = 0;
      try {
        const { count, error } = await supabase
          .from('user_activity_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('activity_type', 'SEARCH');

        if (error) {
          console.log('Search count error:', error);
        } else {
          searches = count || 0;
        }
      } catch (error) {
        console.log('Search count processing error:', error);
      }

      // Get watchlist count - first get user's watchlists, then count companies
      let watchlistItems = 0;
      try {
        const { data: userWatchlists, error: watchlistError } = await supabase
          .from('watchlists')
          .select('id')
          .eq('user_id', user.id);

        if (watchlistError) {
          console.log('Watchlists error:', watchlistError);
        } else if (userWatchlists && userWatchlists.length > 0) {
          const watchlistIds = userWatchlists.map(w => w.id);
          const { count: watchlistCount, error: watchlistCountError } = await supabase
            .from('watchlist_companies')
            .select('*', { count: 'exact', head: true })
            .in('watchlist_id', watchlistIds);

          if (watchlistCountError) {
            console.log('Watchlist companies count error:', watchlistCountError);
          } else {
            watchlistItems = watchlistCount || 0;
          }
        }
      } catch (watchlistError) {
        console.log('Watchlist processing error:', watchlistError);
      }

      // Get last activity - simplified query without complex ordering
      let lastActivity = null;
      try {
        // First check if there are any activity logs for this user
        const { count: totalActivities, error: countError } = await supabase
          .from('user_activity_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (countError) {
          console.log('Activity count error:', countError);
        } else if (totalActivities && totalActivities > 0) {
          // Only try to get the last activity if there are activities
          const { data: lastActivityData, error: lastActivityError } = await supabase
            .from('user_activity_logs')
            .select('timestamp')
            .eq('user_id', user.id)
            .order('timestamp', { ascending: false })
            .limit(1)
            .single();

          if (lastActivityError && lastActivityError.code !== 'PGRST116') {
            console.log('Last activity error:', lastActivityError);
          } else if (lastActivityData) {
            lastActivity = lastActivityData.timestamp;
          }
        }
      } catch (lastActivityError) {
        console.log('Last activity processing error:', lastActivityError);
      }

      setActivityStats({
        companies_viewed: companiesViewed,
        searches_performed: searches,
        reports_generated: 0, // Placeholder for future implementation
        watchlist_items: watchlistItems,
        last_activity: lastActivity,
        api_quota_used: 0, // Will be fetched from user_profiles
        api_quota_limit: 100
      });
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      // Set default values on error
      setActivityStats(prev => ({
        ...prev,
        companies_viewed: 0,
        searches_performed: 0,
        watchlist_items: 0,
        last_activity: null
      }));
    }
  }, [user?.id]);

  const fetchProfileData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        // If there's an error, try to create a profile
        await createProfile();
        return;
      }

             if (data) {
         const profileDataToSet = {
           first_name: data.first_name || '',
           last_name: data.last_name || '',
           company_name: data.company_name || '',
           phone: data.phone || '',
           role: data.role || 'FREEMIUM',
           user_avatar: data.user_avatar || null
         };
         
         setProfileData(profileDataToSet);
         setOriginalProfileData(profileDataToSet);
         
         // Update activity stats with API quota info
         setActivityStats(prev => ({
           ...prev,
           api_quota_used: data.api_quota_used || 0,
           api_quota_limit: data.api_quota_limit || 100
         }));
       } else {
        // Create profile if it doesn't exist
        await createProfile();
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Set default profile data on error
      setProfileData({
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        company_name: '',
        phone: '',
        role: 'FREEMIUM',
        user_avatar: null
      });
    }
  }, [user?.id, createProfile, user.user_metadata]);

  useEffect(() => {
    if (user) {
      fetchProfileData();
      fetchActivityStats();
    }
  }, [user, fetchProfileData, fetchActivityStats]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      console.log('Starting avatar upload for user:', user.id);
      
      // Test: Check if we can read the current profile first
      console.log('Testing profile read access...');
      const { data: testRead, error: testReadError } = await supabase
        .from('user_profiles')
        .select('user_avatar')
        .eq('id', user.id)
        .single();
      
      if (testReadError) {
        console.error('Test read failed:', testReadError);
      } else {
        console.log('Current avatar in database:', testRead?.user_avatar);
      }
      
      // First, fetch the current profile data to ensure we have all fields
      const { data: currentProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching current profile:', fetchError);
        throw fetchError;
      }

      // Upload the new avatar
      console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });
      
      const { data, error } = await uploadAvatar(file, user.id);
      
      if (error) {
        console.error('Upload error details:', error);
        throw error;
      }

             const avatarUrl = `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/avatars/${data.path}?t=${Date.now()}`;
       console.log('Avatar uploaded successfully, URL:', avatarUrl);
      
             // Test: Verify the file exists in storage
       console.log('Verifying file exists in storage...');
       try {
         const { data: storageData, error: storageError } = await supabase.storage
           .from('avatars')
           .list('', { limit: 100 });
         
         if (storageError) {
           console.error('Storage list error:', storageError);
         } else {
           // The uploaded file path includes the userId folder, so we need to search for the full path
           const uploadedFile = storageData.find(f => f.name === data.path);
           console.log('File found in storage:', uploadedFile);
           console.log('All files in avatars bucket:', storageData);
           console.log('Looking for file with path:', data.path);
         }
       } catch (storageError) {
         console.error('Storage verification failed:', storageError);
       }
      
      // Update local state immediately
      setProfileData(prev => ({
        ...prev,
        user_avatar: avatarUrl
      }));

      // Save to database with complete profile data
      console.log('Attempting to save avatar URL to database...');
      console.log('Profile data being saved:', {
        id: user.id,
        first_name: currentProfile?.first_name || profileData.first_name || '',
        last_name: currentProfile?.last_name || profileData.last_name || '',
        company_name: currentProfile?.company_name || profileData.company_name || '',
        phone: currentProfile?.phone || profileData.phone || '',
        role: currentProfile?.role || profileData.role || 'FREEMIUM',
        user_avatar: avatarUrl,
        is_active: true,
        updated_at: new Date().toISOString()
      });

      const { data: saveData, error: saveError } = await supabase
        .from('user_profiles')
        .upsert([{
          id: user.id,
          first_name: currentProfile?.first_name || profileData.first_name || '',
          last_name: currentProfile?.last_name || profileData.last_name || '',
          company_name: currentProfile?.company_name || profileData.company_name || '',
          phone: currentProfile?.phone || profileData.phone || '',
          role: currentProfile?.role || profileData.role || 'FREEMIUM',
          user_avatar: avatarUrl,
          is_active: true,
          updated_at: new Date().toISOString()
        }], {
          onConflict: 'id'
        });

      if (saveError) {
        console.error('Database save error:', saveError);
        console.error('Save error details:', {
          message: saveError.message,
          details: saveError.details,
          hint: saveError.hint,
          code: saveError.code
        });
        throw saveError;
      }

      console.log('Avatar URL saved to database successfully:', saveData);
      
      // Verify the database update by fetching the profile again
      const { data: verifyData, error: verifyError } = await supabase
        .from('user_profiles')
        .select('user_avatar')
        .eq('id', user.id)
        .single();

      if (verifyError) {
        console.error('Verification error:', verifyError);
      } else {
        console.log('Database verification - stored avatar URL:', verifyData?.user_avatar);
        console.log('Expected avatar URL:', avatarUrl);
        console.log('URLs match:', verifyData?.user_avatar === avatarUrl);
      }

             setMessage({ type: 'success', text: 'Avatar updated successfully!' });
       
       // Dispatch avatar update events to ensure Header gets the new avatar
       window.dispatchEvent(new CustomEvent('avatarUpdated', { detail: avatarUrl }));
       window.dispatchEvent(new CustomEvent('globalAvatarRefresh', { detail: avatarUrl }));
       
       // Update local state
       setProfileData(prev => ({
         ...prev,
         user_avatar: avatarUrl
       }));
       
       // Reset the file input to allow re-uploading the same file
       e.target.value = '';
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setMessage({ type: 'error', text: 'Failed to upload avatar. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async () => {
    try {
      setSaving(true);
      
      // Check if any changes were actually made by comparing with original data
      const hasChanges = 
        originalProfileData.first_name !== profileData.first_name ||
        originalProfileData.last_name !== profileData.last_name ||
        originalProfileData.company_name !== profileData.company_name ||
        originalProfileData.phone !== profileData.phone;
      
      if (!hasChanges) {
        setMessage({ type: 'info', text: 'No changes made' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        return;
      }
      
      const { error } = await supabase
        .from('user_profiles')
        .upsert([{
          id: user.id,
          ...profileData,
          updated_at: new Date().toISOString()
        }]);

      if (error) throw error;

      // Update original data after successful save
      setOriginalProfileData({
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        company_name: profileData.company_name,
        phone: profileData.phone,
        role: profileData.role,
        user_avatar: profileData.user_avatar
      });

             setMessage({ type: 'success', text: 'Profile updated successfully!' });
       
       // Dispatch event to notify Header component of profile update
       window.dispatchEvent(new CustomEvent('profileUpdated', { detail: true }));
       
       // Clear message after 3 seconds
       setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordData.new_password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }

    try {
      setSaving(true);
      
      const { error } = await updatePassword(passwordData.new_password);
      
      if (error) throw error;

      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error updating password:', error);
      setMessage({ type: 'error', text: 'Failed to update password' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    navigate('/');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'PREMIUM':
        return 'bg-blue-100 text-blue-800';
      case 'FREEMIUM':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
                   <Header 
        isLoggedIn={!!user}
        user={userProfile}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account information and preferences
          </p>
        </div>

        {/* Message Display */}
                 {message.text && (
           <div className={`mb-6 p-4 rounded-md flex items-center ${
             message.type === 'success' 
               ? 'bg-green-50 border border-green-200 text-green-600' 
               : message.type === 'error'
               ? 'bg-red-50 border border-red-200 text-red-600'
               : 'bg-blue-50 border border-blue-200 text-blue-600'
           }`}>
             {message.type === 'success' ? (
               <CheckCircle className="h-5 w-5 mr-2" />
             ) : message.type === 'error' ? (
               <AlertCircle className="h-5 w-5 mr-2" />
             ) : (
               <CheckCircle className="h-5 w-5 mr-2" />
             )}
             {message.text}
           </div>
         )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                                 <button
                   onClick={handleProfileSave}
                   disabled={saving || (
                     originalProfileData.first_name === profileData.first_name &&
                     originalProfileData.last_name === profileData.last_name &&
                     originalProfileData.company_name === profileData.company_name &&
                     originalProfileData.phone === profileData.phone
                   )}
                   className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                 >
                                     {saving ? (
                     <>
                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                       Saving...
                     </>
                   ) : (
                     <>
                       <Save className="h-4 w-4 mr-2" />
                       {(
                         originalProfileData.first_name === profileData.first_name &&
                         originalProfileData.last_name === profileData.last_name &&
                         originalProfileData.company_name === profileData.company_name &&
                         originalProfileData.phone === profileData.phone
                       ) ? 'No Changes' : 'Save Changes'}
                     </>
                   )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={profileData.first_name}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter first name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={profileData.last_name}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter last name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={profileData.company_name}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Email address cannot be changed. Contact support if needed.
                  </p>
                </div>
              </div>
            </div>

            {/* Password Change Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="current_password"
                      value={passwordData.current_password}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new password"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirm_password"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="md:col-span-2">
                  <button
                    onClick={handlePasswordUpdate}
                    disabled={saving || !passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Avatar & Stats */}
          <div className="space-y-6">
            {/* Avatar Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Picture</h2>
              
              <div className="text-center">
                                                  <div className="relative inline-block">
                                         <img
                       src={profileData.user_avatar || `https://ui-avatars.com/api/?name=${profileData.first_name || 'User'}&background=2563eb&color=ffffff&size=128`}
                       alt="Profile"
                       className="h-32 w-32 rounded-full object-cover border-4 border-gray-200"
                       onError={(e) => {
                         e.target.src = `https://ui-avatars.com/api/?name=${profileData.first_name || 'User'}&background=2563eb&color=ffffff&size=128`;
                       }}
                     />
                                     <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                     <Camera className="h-4 w-4" />
                                           <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={loading}
                      />
                   </label>
                </div>
                
                {loading && (
                  <div className="mt-4 text-sm text-gray-500">
                    Uploading...
                  </div>
                )}
                
                <p className="text-sm text-gray-500 mt-4">
                  Click the camera icon to upload a new profile picture
                </p>
              </div>
            </div>

            {/* Account Status Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Status</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Account Type</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(profileData.role)}`}>
                    {profileData.role}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="text-sm text-gray-900">
                    {formatDate(user?.created_at)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Login</span>
                  <span className="text-sm text-gray-900">
                    {formatDate(user?.last_sign_in_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Activity Statistics Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Activity Overview</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-600">Companies Viewed</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {activityStats.companies_viewed}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Search className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm text-gray-600">Searches</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {activityStats.searches_performed}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-purple-600 mr-2" />
                    <span className="text-sm text-gray-600">Reports</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {activityStats.reports_generated}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-orange-600 mr-2" />
                    <span className="text-sm text-gray-600">Watchlist</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {activityStats.watchlist_items}
                  </span>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-600 mr-2" />
                      <span className="text-sm text-gray-600">Last Activity</span>
                    </div>
                    <span className="text-sm text-gray-900">
                      {formatDate(activityStats.last_activity)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription & Billing Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Subscription & Billing</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Plan</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(profileData.role)}`}>
                    {profileData.role}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Quota Used</span>
                  <span className="text-sm text-gray-900">
                    {activityStats.api_quota_used || 0} / {activityStats.api_quota_limit || 100}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(((activityStats.api_quota_used || 0) / (activityStats.api_quota_limit || 100)) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <button className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                    Upgrade Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
