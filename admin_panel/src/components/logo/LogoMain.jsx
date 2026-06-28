import { Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import logoIcon from 'assets/images/s_icon.png';

// ==============================|| LOGO MAIN ||============================== //

export default function LogoMain() {
  const theme = useTheme();
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <img src={logoIcon} alt="Skipers Logo" width={32} height={32} style={{ borderRadius: 8 }} />
      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: 800, 
          color: theme.palette.primary.main,
          letterSpacing: '-0.5px'
        }}
      >
        Skipers
      </Typography>
    </Box>
  );
}
