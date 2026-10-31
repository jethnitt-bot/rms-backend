// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { axisClasses, chartsGridClasses, LineChart, lineClasses } from '@mui/x-charts';

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

// ==============================|| REPORT AREA CHART ||============================== //
// `data` / `labels` — TODO (backend): pass the real order-status trend once
// the API is connected, e.g. data={[3, 5, 2, ...]} labels={['Mon', 'Tue', ...]}
// Until then `data` defaults to empty and the chart shows "No data yet"
// instead of the old hardcoded [58, 115, 28, 83, 63, 75, 35] numbers.
export default function ReportAreaChart({ data = [], labels = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] }) {
  const theme = useTheme();
  const hasData = Array.isArray(data) && data.length > 0;

  if (!hasData) {
    return <EmptyState message="No data yet" height={340} />;
  }

  return (
    <LineChart
      hideLegend
      grid={{ horizontal: true }}
      xAxis={[{ data: labels, scaleType: 'point', disableLine: true, tickSize: 7 }]}
      yAxis={[{ tickMaxStep: 20, position: 'none' }]}
      series={[{ data, showMark: false, id: 'ReportAreaChart', color: theme.vars.palette.warning.main, label: 'Series 1' }]}
      height={340}
      margin={{ top: 30, bottom: 25, left: 20, right: 20 }}
      sx={{
        [`& .${lineClasses.line}`]: { strokeWidth: 1 },
        [`& .${chartsGridClasses.line}`]: { strokeDasharray: '4 4' },
        [`& .${axisClasses.root}.${axisClasses.directionX} .${axisClasses.tick}`]: { stroke: 'transparent' }
      }}
    />
  );
}

