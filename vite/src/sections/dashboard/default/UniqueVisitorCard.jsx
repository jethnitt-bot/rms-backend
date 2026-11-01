import { useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'components/MainCard';
import IncomeAreaChart from './IncomeAreaChart';

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

// ==============================|| DEFAULT - UNIQUE VISITOR ||============================== //
// `data` — TODO (backend): pass real page-views/sessions series once the API
// is connected, e.g. data={{ monthly: [...], weekly: [...] }}.
// Until then it defaults to empty and the card shows "No data yet" instead
// of a chart with fake numbers.
export default function UniqueVisitorCard({ data }) {
  const [view, setView] = useState('monthly'); // 'monthly' or 'weekly'

  const seriesForView = data ? data[view] : null;
  const hasData = Array.isArray(seriesForView) && seriesForView.length > 0;

  return (
    <>
      <Grid container sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Grid>
          <Typography variant="h5">Unique Visitor</Typography>
        </Grid>
        <Grid>
          <Stack direction="row" sx={{ alignItems: 'center' }}>
            <Button
              size="small"
              onClick={() => setView('monthly')}
              color={view === 'monthly' ? 'primary' : 'secondary'}
              variant={view === 'monthly' ? 'outlined' : 'text'}
            >
              Month
            </Button>
            <Button
              size="small"
              onClick={() => setView('weekly')}
              color={view === 'weekly' ? 'primary' : 'secondary'}
              variant={view === 'weekly' ? 'outlined' : 'text'}
            >
              Week
            </Button>
          </Stack>
        </Grid>
      </Grid>
      <MainCard content={false} sx={{ mt: 1.5 }}>
        {hasData ? (
          <Box sx={{ pt: 1, pr: 2 }}>
            {/* IncomeAreaChart.jsx may still have its own internal mock data —
                send me that file too if you want it fully driven by `series` below
                instead of its own hardcoded numbers. */}
            <IncomeAreaChart view={view} series={seriesForView} />
          </Box>
        ) : (
          <Box sx={{ p: 2 }}>
            <EmptyState message="No visitor data yet" />
          </Box>
        )}
      </MainCard>
    </>
  );
}

