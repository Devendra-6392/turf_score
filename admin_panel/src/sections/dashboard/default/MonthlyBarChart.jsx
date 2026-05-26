// material-ui
import { useTheme } from '@mui/material/styles';

import { BarChart } from '@mui/x-charts/BarChart';

// ==============================|| MONTHLY BAR CHART ||============================== //

export default function MonthlyBarChart({ data = [], labels = [] }) {
  const theme = useTheme();

  return (
    <BarChart
      hideLegend
      height={380}
      series={[{ data, label: 'Revenue' }]}
      xAxis={[{ data: labels, scaleType: 'band', tickSize: 7, disableLine: true, categoryGapRatio: 0.4 }]}
      yAxis={[{ position: 'none' }]}
      slotProps={{ bar: { rx: 5, ry: 5 } }}
      axisHighlight={{ x: 'none' }}
      margin={{ left: 20, right: 20 }}
      colors={[theme.vars.palette.info.light]}
      sx={{
        '& .MuiBarElement-root:hover': { opacity: 0.6 },
        '& .MuiChartsAxis-root.MuiChartsAxis-directionX .MuiChartsAxis-tick': { stroke: 'transparent' }
      }}
    />
  );
}
