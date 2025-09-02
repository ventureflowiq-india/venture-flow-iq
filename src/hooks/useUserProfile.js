import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Cache outside of hook to persist across component unmounts
const profileCache = new Map();

export const useUserProfile = (user) => {
  // Start with cached data if available, otherwise use reasonable defaults
  const getCachedProfile = () => {
    if (!user?.id) return {
      id: null,
      name: null,
      email: null,
      avatar: null,
      role: 'FREEMIUM',
      isActive: false
    };
    
    const cached = profileCache.get(user.id);
    if (cached) return cached;
    
    // Check localStorage for cached avatar
    const cachedAvatar = localStorage.getItem(`avatar_${user.id}`);
    const cachedName = localStorage.getItem(`name_${user.id}`);
    
    return {
      id: user.id,
      name: cachedName || user.email?.split('@')[0] || 'User',
      email: user.email,
      avatar: cachedAvatar,
      role: 'FREEMIUM', // Default role for cached data
      isActive: true
    };
  };

  const [userProfile, setUserProfile] = useState(() => getCachedProfile());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;
      
      // Check if we already have cached data for this user
      if (profileCache.get(user.id)) {
        return;
      }
      
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('first_name, last_name, user_avatar, role, is_active')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          const fullName = data.first_name && data.last_name 
            ? `${data.first_name} ${data.last_name}`.trim()
            : data.first_name || data.last_name || user.email?.split('@')[0] || 'User';

          const avatarUrl = data.user_avatar || user.user_metadata?.avatar_url || null;
          
          const newProfile = {
            id: user.id,
            name: fullName,
            email: user.email,
            avatar: avatarUrl,
            role: data.role || 'FREEMIUM',
            isActive: data.is_active !== false
          };
          
          // Cache in memory and localStorage
          profileCache.set(user.id, newProfile);
          localStorage.setItem(`name_${user.id}`, fullName);
          if (avatarUrl) {
            localStorage.setItem(`avatar_${user.id}`, avatarUrl);
          }
          
          setUserProfile(newProfile);
        }
      } catch (error) {
        console.log('Error fetching user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user?.id, user?.email, user?.user_metadata?.avatar_url]);

  useEffect(() => {
    // Listen for profile updates
    const handleProfileUpdate = () => {
      if (user?.id) {
        profileCache.delete(user.id);
        localStorage.removeItem(`name_${user.id}`);
      }
    };

    const handleAvatarUpdate = (event) => {
      if (event.detail && user?.id) {
        const updatedProfile = {
          ...userProfile,
          avatar: event.detail
        };
        
        setUserProfile(updatedProfile);
        profileCache.set(user.id, updatedProfile);
        localStorage.setItem(`avatar_${user.id}`, event.detail);
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    window.addEventListener('avatarUpdated', handleAvatarUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      window.removeEventListener('avatarUpdated', handleAvatarUpdate);
    };
  }, [userProfile, user?.id]);

  // Function to clear all cached data (useful for logout)
  const clearCache = () => {
    if (user?.id) {
      profileCache.delete(user.id);
      localStorage.removeItem(`avatar_${user.id}`);
      localStorage.removeItem(`name_${user.id}`);
    }
  };

  return { 
    ...userProfile, 
    isLoading,
    clearCache 
  };
};