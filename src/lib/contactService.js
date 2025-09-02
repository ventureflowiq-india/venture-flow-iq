import { supabase } from './supabase';

class ContactService {
  /**
   * Submit a contact form message
   * @param {Object} formData - The contact form data
   * @param {string} formData.name - User's full name
   * @param {string} formData.email - User's email address
   * @param {string} formData.company - Company name (optional)
   * @param {string} formData.phone - Phone number (optional)
   * @param {string} formData.inquiryType - Type of inquiry
   * @param {string} formData.message - The message content
   * @param {string} userId - Optional user ID if logged in
   * @returns {Promise<Object>} - Result object with success/error status
   */
  async submitContactForm(formData, userId = null) {
    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.message || !formData.inquiryType) {
        throw new Error('Missing required fields');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Invalid email format');
      }

      // Insert message into database
      const { data, error } = await supabase
        .from('contact_messages')
        .insert([
          {
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            company: formData.company?.trim() || null,
            phone: formData.phone?.trim() || null,
            inquiry_type: formData.inquiryType,
            message: formData.message.trim(),
            user_id: userId,
            status: 'new'
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw new Error('Failed to save message. Please try again.');
      }

      // Send email notification (this would be handled by a backend service)
      // For now, we'll just log it - in production, you'd call an email service
      console.log('Contact form submitted:', {
        id: data.id,
        name: data.name,
        email: data.email,
        inquiryType: data.inquiry_type,
        message: data.message.substring(0, 100) + '...'
      });

      return {
        success: true,
        messageId: data.id,
        message: 'Thank you for your message! We\'ll get back to you within 24 hours.'
      };

    } catch (error) {
      console.error('Contact form submission error:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred. Please try again.'
      };
    }
  }

  /**
   * Get contact messages (admin only)
   * @param {Object} filters - Optional filters
   * @param {string} filters.status - Filter by status
   * @param {string} filters.inquiryType - Filter by inquiry type
   * @param {number} filters.limit - Number of messages to fetch
   * @param {number} filters.offset - Offset for pagination
   * @returns {Promise<Object>} - Result object with messages or error
   */
  async getContactMessages(filters = {}) {
    try {
      let query = supabase
        .from('contact_messages')
        .select(`
          id,
          name,
          email,
          company,
          phone,
          inquiry_type,
          message,
          status,
          created_at,
          updated_at,
          user_id,
          user_profiles!contact_messages_user_id_fkey (
            name as user_name,
            email as user_email
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.inquiryType) {
        query = query.eq('inquiry_type', filters.inquiryType);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching contact messages:', error);
        throw new Error('Failed to fetch messages');
      }

      return {
        success: true,
        messages: data || []
      };

    } catch (error) {
      console.error('Get contact messages error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch messages'
      };
    }
  }

  /**
   * Update message status (admin only)
   * @param {string} messageId - The message ID
   * @param {string} status - New status
   * @returns {Promise<Object>} - Result object
   */
  async updateMessageStatus(messageId, status) {
    try {
      const validStatuses = ['new', 'read', 'replied', 'closed'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status');
      }

      const { data, error } = await supabase
        .from('contact_messages')
        .update({ status })
        .eq('id', messageId)
        .select()
        .single();

      if (error) {
        console.error('Error updating message status:', error);
        throw new Error('Failed to update message status');
      }

      return {
        success: true,
        message: data
      };

    } catch (error) {
      console.error('Update message status error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update message status'
      };
    }
  }

  /**
   * Get message statistics (admin only)
   * @returns {Promise<Object>} - Statistics object
   */
  async getMessageStats() {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('status, inquiry_type, created_at');

      if (error) {
        console.error('Error fetching message stats:', error);
        throw new Error('Failed to fetch statistics');
      }

      const stats = {
        total: data.length,
        byStatus: {},
        byInquiryType: {},
        recent: 0
      };

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      data.forEach(message => {
        // Count by status
        stats.byStatus[message.status] = (stats.byStatus[message.status] || 0) + 1;
        
        // Count by inquiry type
        stats.byInquiryType[message.inquiry_type] = (stats.byInquiryType[message.inquiry_type] || 0) + 1;
        
        // Count recent messages
        if (new Date(message.created_at) > oneWeekAgo) {
          stats.recent++;
        }
      });

      return {
        success: true,
        stats
      };

    } catch (error) {
      console.error('Get message stats error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch statistics'
      };
    }
  }
}

export const contactService = new ContactService();
