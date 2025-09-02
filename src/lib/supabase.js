import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for storage buckets
export const uploadAvatar = async (file, userId) => {
  // Check authentication status
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    console.error('No active session found. Cannot upload file.');
    return { data: null, error: new Error('User is not authenticated.') };
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${userId}.${fileExt}`
  
  console.log('Uploading avatar:', {
    userId,
    fileName,
    fileSize: file.size,
    fileType: file.type,
    bucket: 'avatars'
  })
  
  // Upload the file to storage
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true })
  
  if (error) {
    console.error('Avatar upload error:', error)
    console.error('Error details:', {
      message: error.message,
      statusCode: error.statusCode,
      error: error.error
    })
  } else {
    console.log('Avatar upload successful:', data)
  }
  
  return { data, error }
}

export const uploadCompanyAsset = async (file, companyId, type = 'logo') => {
  // Use the company-logos subfolder structure that matches existing files
  const fileName = `company-logos/${companyId}-${file.name}`
  
  const { data, error } = await supabase.storage
    .from('company-assets')
    .upload(fileName, file, { upsert: true })
  
  return { data, error }
}

export const uploadCompanyDocument = async (file, companyId, documentType = 'regulatory') => {
  // Create a structured folder for company documents
  const timestamp = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
  const fileName = `${documentType}/${companyId}/${timestamp}-${file.name}`
  
  const { data, error } = await supabase.storage
    .from('company-assets')
    .upload(fileName, file, { upsert: true })
  
  return { data, error }
}

export const getPublicUrl = (bucket, path) => {
  console.log('getPublicUrl called - bucket:', bucket, 'path:', path)
  
  // Always construct the URL manually for now to ensure it works
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
  const manualUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
  console.log('Manual URL constructed:', manualUrl)
  
  // Also try the Supabase method for comparison
  try {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    console.log('Supabase getPublicUrl data:', data)
    
    if (data && data.publicUrl) {
      console.log('Supabase URL:', data.publicUrl)
      // Use the Supabase URL if it exists, otherwise use manual URL
      return data.publicUrl
    }
  } catch (error) {
    console.error('Supabase getPublicUrl error:', error)
  }
  
  console.log('Using manual URL:', manualUrl)
  return manualUrl
}

// Test function to debug storage issues
export const testStorageAccess = async () => {
  console.log('=== TESTING STORAGE ACCESS ===')
  
  try {
    // Test 1: Check if we can list buckets
    console.log('Test 1: Listing buckets...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    if (bucketsError) {
      console.error('Buckets error:', bucketsError)
    } else {
      console.log('Buckets:', buckets)
    }
    
    // Test 2: Check if we can list objects in avatars bucket
    console.log('Test 2: Listing objects in avatars bucket...')
    const { data: objects, error: objectsError } = await supabase.storage
      .from('avatars')
      .list('', { limit: 10 })
    if (objectsError) {
      console.error('Objects error:', objectsError)
    } else {
      console.log('Objects:', objects)
    }
    
    // Test 3: Check authentication context
    console.log('Test 3: Checking auth context...')
    const { data: { session } } = await supabase.auth.getSession()
    console.log('Session:', session)
    
    console.log('=== STORAGE ACCESS TEST COMPLETE ===')
  } catch (error) {
    console.error('Test error:', error)
  }
}