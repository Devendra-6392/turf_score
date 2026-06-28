import { useTheme } from '@mui/material/styles';
import logoIcon from 'assets/images/s_icon.png';

// ==============================|| LOGO ICON ||============================== //

export default function LogoIcon() {
  return (
    <img src={logoIcon} alt="Skipers Logo" width={36} height={36} style={{ borderRadius: 8 }} />
  );
}
