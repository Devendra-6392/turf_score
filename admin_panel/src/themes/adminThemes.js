// Admin Panel Theme Configurations
// Separate themes for Super Admin and Turf Admin

export const SUPER_ADMIN_THEME = {
  name: 'Super Admin',
  colors: {
    primary: '#7C3AED', // Purple - Authority & Control
    secondary: '#EC4899', // Pink - Accent
    success: '#10B981', // Emerald
    warning: '#F59E0B', // Amber
    error: '#EF4444', // Red
    background: '#0F172A', // Dark Blue-Black
    surface: '#1E293B', // Deep Slate
    surfaceLight: '#334155', // Medium Slate
    text: '#F1F5F9', // Light Slate
    textSecondary: '#CBD5E1', // Medium Slate
    border: '#475569', // Border Slate
    hover: '#1E293B',
    gradient: {
      start: '#7C3AED',
      end: '#EC4899'
    }
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    heading: {
      fontSize: '32px',
      fontWeight: 700,
      letterSpacing: '-0.5px'
    },
    subheading: {
      fontSize: '20px',
      fontWeight: 600
    },
    body: {
      fontSize: '14px',
      fontWeight: 400
    }
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px -3px rgba(124, 58, 237, 0.2)'
  }
};

export const TURF_ADMIN_THEME = {
  name: 'Turf Admin',
  colors: {
    primary: '#06B6D4', // Cyan - Professional & Friendly
    secondary: '#3B82F6', // Blue - Trust
    success: '#34D399', // Teal
    warning: '#FBBF24', // Yellow
    error: '#F87171', // Red
    background: '#F8FAFC', // Light Gray
    surface: '#FFFFFF', // White
    surfaceLight: '#F1F5F9', // Very Light Gray
    text: '#0F172A', // Dark Blue
    textSecondary: '#64748B', // Slate
    border: '#E2E8F0', // Light Slate
    hover: '#F1F5F9',
    gradient: {
      start: '#06B6D4',
      end: '#3B82F6'
    }
  },
  typography: {
    fontFamily: "'Poppins', 'Segoe UI', sans-serif",
    heading: {
      fontSize: '28px',
      fontWeight: 700,
      letterSpacing: '0px'
    },
    subheading: {
      fontSize: '18px',
      fontWeight: 600
    },
    body: {
      fontSize: '14px',
      fontWeight: 400
    }
  },
  shadows: {
    sm: '0 1px 3px 0 rgba(6, 182, 212, 0.1)',
    md: '0 4px 12px 0 rgba(6, 182, 212, 0.15)',
    lg: '0 20px 25px -5px rgba(6, 182, 212, 0.12)'
  }
};

// Get theme based on admin role
export const getThemeByRole = (role) => {
  return role === 'SUPER_ADMIN' ? SUPER_ADMIN_THEME : TURF_ADMIN_THEME;
};
