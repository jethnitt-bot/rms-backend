import PropTypes from 'prop-types';
import { useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import { axisClasses, barClasses, BarChart, chartsGridClasses } from '@mui/x-charts';

// project imports
import MainCard from 'components/MainCard';
import { withAlpha } from 'utils/colorUtils';

// ==============================|| SALES CHART ||============================== //

export default function SalesChart({ filter = 'today', series }) {
  const theme = useTheme();
  const downSM = useMediaQuery(theme.breakpoints.down('sm'));

  const [seriesVisibility, setSeriesVisibility] = useState({ Revenue: true, 'Food Cost': true });
  const [highlightedItem, setHighlightedItem] = useState({ seriesId: 'Revenue' });

  const toggleSeriesVisibility = (seriesId, seriesLabel) => {
    setSeriesVisibility((prev) => {
      const isNowHidden = prev[seriesLabel];
      if (isNowHidden && highlightedItem?.seriesId === seriesId) {
        setHighlightedItem(null);
      }
      return { ...prev, [seriesLabel]: !prev[seriesLabel] };
    });
  };

  const handleHighLightedSeries = (newHighLightedSeries) => {
    if (newHighLightedSeries !== null) {
      setHighlightedItem((prev) => ({
        ...prev,
        seriesId: newHighLightedSeries
      }));
    }
  };

  const valueFormatter = (value) => `$ ${value}`;
  const primaryColor = theme.vars.palette.primary.main;
  const primaryLightColor = theme.vars.palette.primary.lighter;
  const warningColor = theme.vars.palette.warning.main;
  const warningLightColor = theme.vars.palette.warning.lighter;

  // ប្រើប្រាស់ទិន្នន័យពិតដែលបញ្ជូនមកពី Backend (ผ่าน prop series)
  const labels = Array.isArray(series) ? series.map((item) => item.label) : [];
  const revenueData = Array.isArray(series) ? series.map((item) => item.value) : [];
  // សម្រាប់តម្លៃបន្ទាប់បន្សំ ឬ Food Cost អាចទាញយកតាមទម្រង់ទិន្នន័យ API របស់អ្នក
  const revenue2Data = revenueData.map((val) => Math.round(val * 0.15));
  const costData = revenueData.map((val) => Math.round(val * 0.35));
  const cost2Data = revenueData.map((val) => Math.round(val * 0.05));
  
  const netProfit = revenueData.reduce((acc, val) => acc + val, 0);

  const initialSeries = [
    { id: 'Revenue', data: revenueData, stack: 'revenue', label: 'Revenue', color: warningColor, valueFormatter },
    { id: 'Revenue2', data: revenue2Data, stack: 'revenue', label: 'Revenue', color: warningLightColor, valueFormatter },
    { id: 'FoodCost', data: costData, stack: 'cost', label: 'Food Cost', color: primaryColor, valueFormatter },
    { id: 'FoodCost2', data: cost2Data, stack: 'cost', label: 'Food Cost', color: primaryLightColor, valueFormatter }
  ];

  const initialSeriesCopy = [...initialSeries.slice(0, 1), ...initialSeries.slice(2, 3)];

  return (
    <MainCard sx={{ mt: 1 }} content={false}>
      <Box sx={{ p: 2.5, pb: 0 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
              Net Profit
            </Typography>
            <Typography variant="h4">${netProfit.toLocaleString()}</Typography>
          </Box>

          <Stack direction="row" sx={{ gap: 3 }}>
            {initialSeriesCopy.map((s) => (
              <Stack
                key={s.label}
                direction="row"
                onClick={() => toggleSeriesVisibility(s.id, s.label)}
                onMouseEnter={() => handleHighLightedSeries(s.id)}
                onMouseLeave={() => setHighlightedItem(null)}
                sx={{
                  gap: 1,
                  alignItems: 'center',
                  opacity: seriesVisibility[s.label] ? 1 : 0.45,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s ease-in-out'
                }}
              >
                <Box sx={{ height: 10, width: 10, borderRadius: '50%', backgroundColor: s.color }} />
                <Typography>{s.label}</Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>

        <BarChart
          hideLegend
          height={380}
          grid={{ horizontal: true }}
          xAxis={[
            {
              id: 'sales-x-axis',
              data: labels,
              tickSize: 7,
              disableLine: true,
              categoryGapRatio: downSM ? 0.5 : 0.7,
              barGapRatio: downSM ? 0.4 : 0.7
            }
          ]}
          yAxis={[{ disableLine: true, tickSize: 7 }]}
          series={initialSeries
            .map((s) => ({ ...s, type: 'bar', color: withAlpha(s.color, 0.85), visible: seriesVisibility[s.label] }))
            .filter((s) => s.visible)}
          highlightedItem={highlightedItem}
          slotProps={{ bar: { rx: 4, ry: 4 }, tooltip: { trigger: 'item' } }}
          axisHighlight={{ x: 'none' }}
          margin={{ top: 30, left: -5, bottom: 25, right: 10 }}
          sx={{
            [`& .${barClasses.element}:hover`]: { opacity: 0.6 },
            [`& .${chartsGridClasses.line}`]: { strokeDasharray: '4 4', stroke: theme.vars.palette.divider },
            '& .MuiBarElement-series-auto-generated-id-0, & .MuiBarElement-series-auto-generated-id-1': { width: 15 },
            [`& .${axisClasses.root}.${axisClasses.directionX} .${axisClasses.tick}`]: { stroke: 'transparent' },
            [`& .${axisClasses.root}.${axisClasses.directionY} .${axisClasses.tick}`]: { stroke: 'transparent' }
          }}
        />
      </Box>
    </MainCard>
  );
}

SalesChart.propTypes = { filter: PropTypes.any, series: PropTypes.any };
