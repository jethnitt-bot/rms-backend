import { useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// project imports
import SalesChart from 'sections/dashboard/SalesChart';

// assets
import InboxOutlined from '@ant-design/icons/InboxOutlined';

// sales report status
const status = [
  {
    value: 'today',
    label: 'Today'
  },
  {
    value: 'month',
    label: 'This Month'
  },
  {
    value: 'year',
    label: 'This Year'
  }
];

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

// ==============================|| DEFAULT - SALES REPORT ||============================== //
// `data` — TODO (backend): pass real sales-by-period data once the API is
// connected, e.g. data={{ today: [...], month: [...], year: [...] }}.
// Until then it defaults to empty and the card shows "No sales data yet"
// instead of a chart with fake numbers.
export default function SaleReportCard({ data }) {
  const [value, setValue] = useState('today');

  const seriesForValue = data ? data[value] : null;
  const hasData = Array.isArray(seriesForValue) && seriesForValue.length > 0;

  return (
    <>
      <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Grid>
          <Typography variant="h5">Sales Report</Typography>
        </Grid>
        <Grid>
          <TextField
            id="standard-select-currency"
            size="small"
            select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            slotProps={{ htmlInput: { sx: { py: 0.75, fontSize: '0.875rem' } } }}
          >
            {status.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
      {hasData ? (
        // SalesChart.jsx may still have its own internal mock data — send me
        // that file too if you want it fully driven by `series` below
        // instead of its own hardcoded numbers.
        <SalesChart filter={value} series={seriesForValue} />
      ) : (
        <EmptyState message="No sales data yet" />
      )}
    </>
  );
}

