import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';

// assets
import { EditOutlined, LogoutOutlined } from '@ant-design/icons';

import { Formik } from 'formik';

import { Stack, Button } from '@mui/material';
import { InputLabel, OutlinedInput, FormHelperText } from '@mui/material';
import * as Yup from 'yup';
import AnimateButton from 'components/@extended/AnimateButton';
import { Box, Grid, Modal } from '@mui/material';

import axios from 'axios';

import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import { decodeToken } from 'react-jwt';

import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

import { strengthColor, strengthIndicator } from 'utils/password-strength';

import {
  FormControl,
  IconButton,
  InputAdornment,
  Typography
} from '@mui/material';

// ==============================|| HEADER PROFILE - PROFILE TAB ||============================== //

const ProfileTab = ({ handleLogout }) => {
  const theme = useTheme();

  const [open, setOpen] = useState(false);
  const [user, setUser] = useState();

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  const handleUser = async (values, setErrors, setStatus, setSubmitting) => {
    const token = localStorage.getItem("token");
    const myDecodedToken = decodeToken(token);
    const request = {
      username: values.username,
      password: values.password ? values.password : null,
      gender: values.gender,
      phone: values.phone,
      email: values.email,
      age: values.age,
    }

    if(!values.password) {
      delete request.password;
    }

    axios.put(`http://127.0.0.1:5000/api/v1/users/${myDecodedToken.id}`, request)
      .then(() => {
        setOpen(false);
        setStatus({ success: false });
        setSubmitting(false);
      })
      .catch((error) => {
        setStatus({ success: false });
        setErrors({ submit: error.message });
        setSubmitting(false);
      });
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    const myDecodedToken = decodeToken(token);
    axios.get(`http://127.0.0.1:5000/api/v1/users/${myDecodedToken.id}`)
      .then((data) => {
        setUser(data.data);
      })
      .catch((error) => {
        console.error(error);
      });

  }, []);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);
  };

  const [level, setLevel] = useState();
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const changePassword = (value) => {
    const temp = strengthIndicator(value);
    setLevel(strengthColor(temp));
  };

  return (
    <>
      <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32, color: theme.palette.grey[500] } }}>
        <ListItemButton selected={selectedIndex === 0} onClick={(event) => handleListItemClick(event, 0)}>
          <ListItemIcon>
            <EditOutlined />
          </ListItemIcon>
          <ListItemText primary="Edit Profile" onClick={() => setOpen(true)} />
        </ListItemButton>
        <ListItemButton selected={selectedIndex === 2} onClick={handleLogout}>
          <ListItemIcon>
            <LogoutOutlined />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Formik
            initialValues={{
              username: user?.username,
              email: user?.email,
              gender: user?.gender,
              age: user?.age,
              phone: user?.phone,
              password: '',
              submit: null
            }}
            validationSchema={Yup.object().shape({
              username: Yup.string().max(255),
              gender: Yup.string().max(255),
              age: Yup.string().max(255),
              phone: Yup.string().max(255),
              email: Yup.string().email('Must be a valid email').max(255),
              password: Yup.string().max(255)
            })}
            onSubmit={(values, { setErrors, setStatus, setSubmitting }) => {
              handleUser(values, setErrors, setStatus, setSubmitting);
            }}
          >
            {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
              <form noValidate onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="title-signup">Username</InputLabel>
                      <OutlinedInput
                        fullWidth
                        error={Boolean(touched.username && errors.username)}
                        id="title-signup"
                        value={values.username}
                        name="username"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Username..."
                        inputProps={{}}
                      />
                      {touched.username && errors.username && (
                        <FormHelperText error id="helper-text-title-signup">
                          {errors.username}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="link_repo-signup">Email</InputLabel>
                      <OutlinedInput
                        fullWidth
                        error={Boolean(touched.email && errors.email)}
                        id="link_repo-login"
                        type="link_repo"
                        value={values.email}
                        name="email"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Email..."
                        inputProps={{}}
                      />
                      {touched.email && errors.email && (
                        <FormHelperText error id="helper-text-email-signup">
                          {errors.email}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="gender-signup">Gender</InputLabel>
                      <Select
                        id="gender-login"
                        type="gender"
                        value={values.gender}
                        name="gender"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Gender..."
                        fullWidth
                        error={Boolean(touched.gender && errors.gender)}
                      >
                        <MenuItem value={"Male"}>Male</MenuItem>
                        <MenuItem value={"Female"}>Female</MenuItem>
                      </Select>
                      {touched.gender && errors.gender && (
                        <FormHelperText error id="helper-text-gender-signup">
                          {errors.gender}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="link_repo-signup">Email</InputLabel>
                      <OutlinedInput
                        fullWidth
                        error={Boolean(touched.email && errors.email)}
                        id="link_repo-login"
                        type="link_repo"
                        value={values.email}
                        name="email"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Email..."
                        inputProps={{}}
                      />
                      {touched.email && errors.email && (
                        <FormHelperText error id="helper-text-email-signup">
                          {errors.email}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="link_repo-signup">Age</InputLabel>
                      <OutlinedInput
                        fullWidth
                        error={Boolean(touched.age && errors.age)}
                        id="link_repo-login"
                        type="link_repo"
                        value={values.age}
                        name="age"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Age..."
                        inputProps={{}}
                      />
                      {touched.age && errors.age && (
                        <FormHelperText error id="helper-text-age-signup">
                          {errors.age}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="link_repo-signup">Phone</InputLabel>
                      <OutlinedInput
                        fullWidth
                        error={Boolean(touched.phone && errors.phone)}
                        id="link_repo-login"
                        type="link_repo"
                        value={values.phone}
                        name="phone"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Phone..."
                        inputProps={{}}
                      />
                      {touched.phone && errors.phone && (
                        <FormHelperText error id="helper-text-phone-signup">
                          {errors.phone}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="password-signup">Password</InputLabel>
                      <OutlinedInput
                        fullWidth
                        error={Boolean(touched.password && errors.password)}
                        id="password-signup"
                        type={showPassword ? 'text' : 'password'}
                        value={values.password}
                        name="password"
                        onBlur={handleBlur}
                        onChange={(e) => {
                          handleChange(e);
                          changePassword(e.target.value);
                        }}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              onMouseDown={handleMouseDownPassword}
                              edge="end"
                              size="large"
                            >
                              {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                            </IconButton>
                          </InputAdornment>
                        }
                        placeholder="******"
                        inputProps={{}}
                      />
                      {touched.password && errors.password && (
                        <FormHelperText error id="helper-text-password-signup">
                          {errors.password}
                        </FormHelperText>
                      )}
                    </Stack>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item>
                          <Box sx={{ bgcolor: level?.color, width: 85, height: 8, borderRadius: '7px' }} />
                        </Grid>
                        <Grid item>
                          <Typography variant="subtitle1" fontSize="0.75rem">
                            {level?.label}
                          </Typography>
                        </Grid>
                      </Grid>
                    </FormControl>
                  </Grid>
                  {errors.submit && (
                    <Grid item xs={12}>
                      <FormHelperText error>{errors.submit}</FormHelperText>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <AnimateButton>
                      <Button disableElevation disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained" color="primary">
                        Update
                      </Button>
                    </AnimateButton>
                  </Grid>
                </Grid>
              </form>
            )}
          </Formik>
        </Box>
      </Modal>
    </>
  );
};

ProfileTab.propTypes = {
  handleLogout: PropTypes.func
};

export default ProfileTab;
