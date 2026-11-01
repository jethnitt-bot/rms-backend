//សម្រាប់ទា​ui បកប្រើ
import PropTypes from 'prop-types';
import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

// ឌីហ្សាញform login
import Alert from '@mui/material/Alert'; //ជូនដំណឹង
import Button from '@mui/material/Button'; //somrab joch
import Checkbox from '@mui/material/Checkbox'; //box crish
import FormControlLabel from '@mui/material/FormControlLabel'; //keep me sigin
import FormHelperText from '@mui/material/FormHelperText';   //bong hanh error
import Grid from '@mui/material/Grid';  //
import Link from '@mui/material/Link';  //forget password
import InputAdornment from '@mui/material/InputAdornment';   //pneak mel password
import InputLabel from '@mui/material/InputLabel';    //titile email
import OutlinedInput from '@mui/material/OutlinedInput';  //type em and pass
import Stack from '@mui/material/Stack';  //reab rlement
import Typography from '@mui/material/Typography'; //text atha bot jol form

// third-party
import * as Yup from 'yup'; // check email trov form ot
import { Formik } from 'formik';  //krobkrong form value rbos email password chab error ...

// project imports
import IconButton from 'components/@extended/IconButton'; //botton cute cute
import AnimateButton from 'components/@extended/AnimateButton';//them animetion oy button

// assets
import EyeOutlined from '@ant-design/icons/EyeOutlined';//pneack hide password
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';//

// ============================ JWT - LOGIN ============================ //

export default function AuthLogin({ isDemo = false }) {
const navigate = useNavigate();
const [checked, setChecked] = React.useState(false);

const [showPassword, setShowPassword] = React.useState(false);
const handleClickShowPassword = () => {
setShowPassword(!showPassword);
};

const handleMouseDownPassword = (event) => {
event.preventDefault();
};

return (
<>
<Formik
initialValues={{
email: '',
password: '',
submit: null
}}//
   ///សំខាន់កាពារ​ user​​វាយខុស
validationSchema={Yup.object().shape({
email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
password: Yup.string()
.required('Password is required')
.test('no-leading-trailing-whitespace', 'Password cannot start or end with spaces', (value) => value === value.trim())
.max(255, 'Password must be less than 255 characters')
})}//check data befor acecc to submit

//  Handle Login Submission & Validation សំខាន់គ្រប់គ្រងកា login បង្ហាញ alert
onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
try {
//  បំប្លែង Email ទៅជាអក្សរតូច ដើម្បីកុំឱ្យប្រកាន់ Case-sensitivity
const inputEmail = values.email.toLowerCase();
const inputPassword = values.password;

//  Check Fake Credentials ()
if (inputEmail !== 'jethnitt@gmail.com' || inputPassword !== 'Nit130905') {
throw new Error('Email ឬ ពាក្យសម្ងាត់មិនត្រឹមត្រូវឡើយ!');
}

          //  បើត្រូវ  រក្សាទុក រួចរុញទៅ Dashboard
localStorage.setItem('token', 'sample_jwt_token_12345');
setStatus({ success: true });
setSubmitting(false);

navigate('/');
} catch (err) {
//  បើខុស បង្ហាញ Error Alert
setStatus({ success: false });
setErrors({ submit: err.message || 'ការចូលប្រើប្រាស់បរាជ័យ!' });
setSubmitting(false);
}
}}
>
    
{({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
<form noValidate onSubmit={handleSubmit}>
<Grid container spacing={3}>
{/*  បង្ហាញ Alert ពណ៌ក្រហមប្រាប់ User ពេលវាយខុស */}
{errors.submit && (
<Grid size={12}>
<Alert severity="error">{errors.submit}</Alert>
</Grid>
)}

<Grid size={12}>
<Stack sx={{ gap: 1 }}>
<InputLabel htmlFor="email-login">Email Address</InputLabel>
<OutlinedInput

Nai phanit ណៃផានិត:
id="email-login"
type="email"
value={values.email}
name="email"
autoComplete="off" //  បិទ Chrome Auto-fill
onBlur={handleBlur}
onChange={handleChange}
placeholder="Enter email address"
fullWidth
error={Boolean(touched.email && errors.email)}
/>

</Stack>
{touched.email && errors.email && (
<FormHelperText error id="standard-weight-helper-text-email-login">
{errors.email}
</FormHelperText> //if fals data error
)}
</Grid>

<Grid size={12}>
<Stack sx={{ gap: 1 }}>
<InputLabel htmlFor="password-login">Password</InputLabel>
<OutlinedInput
fullWidth
error={Boolean(touched.password && errors.password)}
id="password-login"
type={showPassword ? 'text' : 'password'}
value={values.password}
name="password"
autoComplete="new-password" //  បិទ Chrome Auto-fill
onBlur={handleBlur}
onChange={handleChange}
endAdornment={
<InputAdornment position="end">
<IconButton
aria-label="toggle password visibility"
onClick={handleClickShowPassword}
onMouseDown={handleMouseDownPassword}
edge="end"
color="secondary"
>
{showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
</IconButton>
</InputAdornment>
}
placeholder="Enter password"
/>
</Stack>
{touched.password && errors.password && (
<FormHelperText error id="standard-weight-helper-text-password-login">
{errors.password}
</FormHelperText>
)}
</Grid>

<Grid sx={{ mt: -1 }} size={12}>
<Stack direction="row" sx={{ gap: 2, alignItems: 'baseline', justifyContent: 'space-between' }}>
<FormControlLabel
control={
<Checkbox
checked={checked}
onChange={(event) => setChecked(event.target.checked)}
name="checked"
color="primary"
size="small"
/>
}
label={<Typography variant="h6">Keep me sign in</Typography>}
/>
<Link variant="h6" component={RouterLink} to="#" color="text.primary">
Forgot Password?
</Link>
</Stack>
</Grid>

<Grid size={12}>
<AnimateButton>
<Button
disableElevation
disabled={isSubmitting}
fullWidth
size="large"
type="submit"
variant="contained"
color="primary"
>
Login
</Button>
</AnimateButton>
</Grid>
</Grid>
</form>
)}
</Formik>
</>
);
}

AuthLogin.propTypes = { isDemo: PropTypes.bool };
