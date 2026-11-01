import PropTypes from 'prop-types';

// material-ui
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';

// project imports
import MainCard from 'components/MainCard';

// assets
import RiseOutlined from '@ant-design/icons/RiseOutlined';
import FallOutlined from '@ant-design/icons/FallOutlined';

const iconSX = { fontSize: '0.75rem', color: 'inherit', marginLeft: 0, marginRight: 0 };

export default function AnalyticEcommerce({ color = 'primary', title, count, percentage, isLoss, extra, icon }) {
  return (
    <MainCard contentSX={{ p: 2.25 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
        <Stack sx={{ gap: 0.75, flex: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {title}
          </Typography>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'flex-start', gap: 1.5 }}>
            <Typography variant="h4" sx={{ color: 'inherit', fontWeight: 'bold' }}>
              {count}
            </Typography>
            {percentage !== undefined && percentage !== null && percentage !== 0 && (
              <Chip
                variant="combined"
                color={color}
                icon={isLoss ? <FallOutlined style={iconSX} /> : <RiseOutlined style={iconSX} />}
                label={`${percentage}%`}
                sx={{ pl: 1 }}
                size="small"
              />
            )}
          </Stack>
        </Stack>
        {icon && (
          <Avatar
            variant="rounded"
            sx={{
              width: 40,
              height: 40,
              bgcolor: `${color || 'primary'}.lighter`,
              color: `${color || 'primary'}.main`,
              fontSize: '1.25rem',
              ml: 1
            }}
          >
            {icon}
          </Avatar>
        )}
      </Stack>

      <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider', mt: 1.5 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
          You made an extra{' '}
          <Typography component="span" variant="caption" sx={{ color: `${color || 'primary'}.main`, fontWeight: 'bold' }}>
            {extra}
          </Typography>{' '}
          this year
        </Typography>
      </Box>
    </MainCard>
  );
}

AnalyticEcommerce.propTypes = {
  color: PropTypes.string,
  title: PropTypes.string,
  count: PropTypes.string,
  percentage: PropTypes.number,
  isLoss: PropTypes.bool,
  extra: PropTypes.string,
  icon: PropTypes.node
};
