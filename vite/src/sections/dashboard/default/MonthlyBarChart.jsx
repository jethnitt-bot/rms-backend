// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { axisClasses, barClasses, BarChart } from '@mui/x-charts';

// assets
import InboxOutlined from '@ant-design/icons/InboxOutlined';

// ==============================|| EMPTY STATE ||============================== //
function EmptyState({ message = 'No data yet', height = 220 }) {
  return (
    <Box
      sx={{
        height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        color: 'text.secondary'
      }}
    >
      <InboxOutlined style={{ fontSize: '1.75rem' }} />
      <Typography variant="body2">{message}</Typography>
    </Box>
  );
}

// ==============================|| MONTHLY BAR CHART ||============================== //
// `data` / `labels` — TODO (backend): pass the real weekly revenue/order
// numbers once the API is connected, e.g.
//   data={[120, 95, ...]} labels={['Mo', 'Tu', ...]}
// Until then both default to empty and the chart shows "No data yet"
// instead of the old hardcoded [80, 95, 70, 42, 65, 55, 78] numbers.
export default function MonthlyBarChart({ data = [], labels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] }) {
  const theme = useTheme();
  const hasData = Array.isArray(data) && data.length > 0;

  if (!hasData) {
    return <EmptyState message="No data yet" height={380} />;
  }

  return (
    <BarChart
      hideLegend
      height={380}
      series={[{ data, label: 'Series-1' }]}
      xAxis={[{ data: labels, scaleType: 'band', tickSize: 7, disableLine: true, categoryGapRatio: 0.4 }]}
      yAxis={[{ position: 'none' }]}
      slotProps={{ bar: { rx: 5, ry: 5 } }}
      axisHighlight={{ x: 'none' }}
      margin={{ left: 20, right: 20 }}
      colors={[theme.vars.palette.info.light]}
      sx={{
        [`& .${barClasses.element}:hover`]: { opacity: 0.6 },
        [`& .${axisClasses.root}.${axisClasses.directionX} .${axisClasses.tick}`]: { stroke: 'transparent' }
      }}
    />
  );
}

