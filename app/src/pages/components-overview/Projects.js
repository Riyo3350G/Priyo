// material-ui
import { Breadcrumbs, Grid, Stack, Typography, Button, Box, Modal, Paper } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { decodeToken } from 'react-jwt';
import axios from 'axios';
// project import
import ComponentSkeleton from './ComponentSkeleton';
import MainCard from 'components/MainCard';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useNavigate } from 'react-router-dom';

import TextareaAutosize from '@mui/base/TextareaAutosize';
import { styled } from '@mui/system';

import {
  FormHelperText,
  InputLabel,
  OutlinedInput
} from '@mui/material';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

import AnimateButton from 'components/@extended/AnimateButton';

// assets
// ==============================|| COMPONENTS - TYPOGRAPHY ||============================== //

const ComponentProjects = () => {

  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [openAddProject, setOpenAddProject] = useState(false);
  const [users, setUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [openEditProject, setOpenEditProject] = useState(false);
  const [openDeleteProject, setOpenDeleteProject] = useState(false);
  const [openDetailsProject, setOpenDetailsProject] = useState(false);
  const [project, setProject] = useState({});

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

  async function fetchData() {
    const token = localStorage.getItem("token");
    if (token) {
      const myDecodedToken = decodeToken(token);
      await axios
        .get(`http://127.0.0.1:5000/api/v1/users/${myDecodedToken.id}/projects`)
        .then((data) => {
          setProjects(data.data);
          console.log(projects)
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      navigate("/login");
    }
  }

  useEffect(() => {
    fetchData();
    handleModal();
  }, []);

  const handleProjects = async (values, setErrors, setStatus, setSubmitting) => {

    const token = localStorage.getItem("token");
    const myDecodedToken = decodeToken(token);

    const request = {
      created_by: myDecodedToken.id,
      name: values.title,
      description: values.description,
      link_repo: values.link_repo,
      members: members.map(item => item.value)
    };

    await axios
      .post("http://127.0.0.1:5000/api/v1/projects", request)
      .then(() => {
        fetchData()
        setOpenAddProject(false);
        setStatus({ success: false });
        setSubmitting(false);
      })
      .catch((error) => {
        setStatus({ success: false });
        setErrors({ submit: error.message });
        setSubmitting(false);
      });
  };

  const updateProjects = async (values, setErrors, setStatus, setSubmitting) => {

    const token = localStorage.getItem("token");
    const myDecodedToken = decodeToken(token);

    const request = {
      id: project.id,
      created_by: myDecodedToken.id,
      name: values.title,
      description: values.description,
      link_repo: values.link_repo,
      members: members.map(item => item.value)
    };

    await axios
      .put(`http://127.0.0.1:5000/api/v1/projects/${project.id}`, request)
      .then(() => {
        fetchData()
        setOpenAddProject(false);
        setStatus({ success: false });
        setSubmitting(false);
      })
      .catch((error) => {
        setStatus({ success: false });
        setErrors({ submit: error.message });
        setSubmitting(false);
      });
  };

  const handleModal = async () => {
    await axios
      .get(`http://127.0.0.1:5000/api/v1/users`)
      .then((data) => {
        const transformedData = data.data.map((user) => {
          return {
            value: user.id,
            title: user.username,
          };
        })
        setUsers(transformedData);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleDeleteProject = async () => {
    console.log(project);
    await axios
      .delete(`http://127.0.0.1:5000/api/v1/projects/${project.id}`)
      .then(() => {
        fetchData()
        setOpenDeleteProject(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const blue = {
    100: '#DAECFF',
    200: '#b6daff',
    400: '#3399FF',
    500: '#007FFF',
    600: '#0072E5',
    900: '#003A75',
  };

  const grey = {
    50: '#F3F6F9',
    100: '#E5EAF2',
    200: '#DAE2ED',
    300: '#C7D0DD',
    400: '#B0B8C4',
    500: '#9DA8B7',
    600: '#6B7A90',
    700: '#434D5B',
    800: '#303740',
    900: '#1C2025',
  };

  const Textarea = styled(TextareaAutosize)(
    ({ theme }) => `
    width: 320px;
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 0.875rem;
    font-weight: 400;
    line-height: 1.5;
    padding: 8px 12px;
    border-radius: 8px;
    color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
    background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
    border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
    box-shadow: 0px 2px 2px ${theme.palette.mode === 'dark' ? grey[900] : grey[50]};

    &:hover {
      border-color: ${blue[400]};
    }

    &:focus {
      border-color: ${blue[400]};
      box-shadow: 0 0 0 3px ${theme.palette.mode === 'dark' ? blue[600] : blue[200]};
    }

    // firefox
    &:focus-visible {
      outline: 0;
    }
  `,
  );

  return (
    <ComponentSkeleton>
      {projects && projects.length > 0 ? (
        <>
          <Stack direction="row" justifyContent="end" sx={{ paddingY: 2 }}>
            <Button
              size="small"
              variant="contained"
              sx={{ textTransform: 'capitalize' }}
              onClick={() => {
                setOpenAddProject(true);
                handleModal();
              }}
            >
              Create Project
            </Button>
          </Stack>
          <Grid container spacing={3}>
            {projects.map((project) => (
              <Grid item key={project.id} xs={12} sm={6} md={4}>
                <MainCard
                  title={project.name}
                  codeHighlight
                  openDeleteProject={setOpenDeleteProject}
                  openEditProject={setOpenEditProject}
                  openDetailsProject={setOpenDetailsProject}
                  project={setProject}
                  projectChosen={project}
                  members={setMembers}
                >
                  <>
                    <Typography variant="subtitle1" gutterBottom>
                      {project.description}
                    </Typography>
                    <Breadcrumbs aria-label="breadcrumb">
                      <Typography variant="h6">Tickets: {project.tickets.length}</Typography>
                      <Typography variant="h6">Members: {project.members.length}</Typography>
                    </Breadcrumbs>
                  </>
                </MainCard>
              </Grid>
            ))}
          </Grid>

        </>

      ) : (
        <Grid container sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <MainCard title="" codeHighlight>
            <>
              <Typography variant="subtitle1" gutterBottom>
                None projects found. To Create one click on the button below.
              </Typography>
              <Button
                size="small"
                variant="contained"
                sx={{ textTransform: 'capitalize' }}
                onClick={() => {
                  setOpenAddProject(true);
                  handleModal();
                }}
              >
                Create Project
              </Button>
            </>
          </MainCard>
        </Grid>

      )}
      <Modal
        open={openAddProject}
        onClose={() => setOpenAddProject(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Formik
            initialValues={{
              title: '',
              description: '',
              members: [],
              link_repo: '',
              submit: null
            }}
            validationSchema={Yup.object().shape({
              title: Yup.string().max(255).required('Title is required'),
              description: Yup.string().max(255).required('Description is required'),
              link_repo: Yup.string().max(255).required('Repository Link is required')
            })}
            onSubmit={(values, { setErrors, setStatus, setSubmitting }) => {
              handleProjects(values, setErrors, setStatus, setSubmitting);
            }}
          >
            {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
              <form noValidate onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="title-signup">Title</InputLabel>
                      <OutlinedInput
                        fullWidth
                        error={Boolean(touched.title && errors.title)}
                        id="title-signup"
                        value={values.title}
                        name="title"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="title..."
                        inputProps={{}}
                      />
                      {touched.title && errors.title && (
                        <FormHelperText error id="helper-text-title-signup">
                          {errors.title}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="description-signup">Description</InputLabel>
                      <Textarea
                        fullWidth
                        error={Boolean(touched.description && errors.description)}
                        id="description-login"
                        type="description"
                        value={values.description}
                        name="description"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Description..."
                        inputProps={{}}
                      />
                      {touched.description && errors.description && (
                        <FormHelperText error id="helper-text-description-signup">
                          {errors.description}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <Autocomplete
                        multiple
                        id="tags-standard"
                        options={users}
                        getOptionLabel={(option) => option.title}
                        onChange={(event, value) => {
                          setMembers(value);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="standard"
                            label="Members"
                            placeholder="Members..."
                          />
                        )}
                      />
                      {touched.members && errors.members && (
                        <FormHelperText error id="helper-text-members-signup">
                          {errors.members}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="link_repo-signup">Repository</InputLabel>
                      <OutlinedInput
                        fullWidth
                        error={Boolean(touched.link_repo && errors.link_repo)}
                        id="link_repo-login"
                        type="link_repo"
                        value={values.link_repo}
                        name="link_repo"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Repository..."
                        inputProps={{}}
                      />
                      {touched.link_repo && errors.link_repo && (
                        <FormHelperText error id="helper-text-link_repo-signup">
                          {errors.link_repo}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  {errors.submit && (
                    <Grid item xs={12}>
                      <FormHelperText error>{errors.submit}</FormHelperText>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <AnimateButton>
                      <Button disableElevation disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained" color="primary">
                        Create
                      </Button>
                    </AnimateButton>
                  </Grid>
                </Grid>
              </form>
            )}
          </Formik>
        </Box>
      </Modal>
      <Modal
        open={openEditProject}
        onClose={() => setOpenEditProject(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Formik
            initialValues={{
              title: project.name,
              description: project.description,
              link_repo: project.link_repo,
              submit: null
            }}
            validationSchema={Yup.object().shape({
              title: Yup.string().max(255).required('Title is required'),
              description: Yup.string().max(255).required('Description is required'),
              link_repo: Yup.string().max(255).required('Repository Link is required')
            })}
            onSubmit={(values, { setErrors, setStatus, setSubmitting }) => {
              updateProjects(values, setErrors, setStatus, setSubmitting);
            }}
          >
            {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
              <form noValidate onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="title-signup">Title</InputLabel>
                      <OutlinedInput
                        fullWidth
                        error={Boolean(touched.title && errors.title)}
                        id="title-signup"
                        value={values.title}
                        name="title"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="title..."
                        inputProps={{}}
                      />
                      {touched.title && errors.title && (
                        <FormHelperText error id="helper-text-title-signup">
                          {errors.title}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="description-signup">Description</InputLabel>
                      <Textarea
                        fullWidth
                        error={Boolean(touched.description && errors.description)}
                        id="description-login"
                        type="description"
                        value={values.description}
                        name="description"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Description..."
                        inputProps={{}}
                      />
                      {touched.description && errors.description && (
                        <FormHelperText error id="helper-text-description-signup">
                          {errors.description}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <Autocomplete
                        multiple
                        id="tags-standard"
                        options={users}
                        defaultValue={members}
                        getOptionLabel={(option) => option.title}
                        onChange={(event, value) => {
                          setMembers(value);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="standard"
                            label="Members"
                            placeholder="Members..."
                          />
                        )}
                      />
                      {touched.members && errors.members && (
                        <FormHelperText error id="helper-text-members-signup">
                          {errors.members}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="link_repo-signup">Repository</InputLabel>
                      <OutlinedInput
                        fullWidth
                        error={Boolean(touched.link_repo && errors.link_repo)}
                        id="link_repo-login"
                        type="link_repo"
                        value={values.link_repo}
                        name="link_repo"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Repository..."
                        inputProps={{}}
                      />
                      {touched.link_repo && errors.link_repo && (
                        <FormHelperText error id="helper-text-link_repo-signup">
                          {errors.link_repo}
                        </FormHelperText>
                      )}
                    </Stack>
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
      <Dialog
        open={openDeleteProject}
        onClose={() => setOpenDeleteProject(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Delete Project"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this project?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteProject(false)}>Cancel</Button>
          <Button autoFocus onClick={handleDeleteProject}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openDetailsProject} onClose={() => setOpenDetailsProject(false)}>
        <DialogTitle>Project Details</DialogTitle>
        <DialogContent>
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper>
                  <Stack spacing={2} p={2}>
                    <Typography variant="h5" fontWeight="bold">
                      Title
                    </Typography>
                    <Typography variant="body1">{project.name}</Typography>
                  </Stack>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper>
                  <Stack spacing={2} p={2}>
                    <Typography variant="h5" fontWeight="bold">
                      Description
                    </Typography>
                    <Typography variant="body1">{project.description}</Typography>
                  </Stack>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper>
                  <Stack spacing={2} p={2}>
                    <Typography variant="h5" fontWeight="bold">
                      Members
                    </Typography>
                    {project.members?.map((member, index) => (
                      <Typography variant="body1" key={index} gutterBottom>
                        {member.username}
                      </Typography>
                    ))}
                  </Stack>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper>
                  <Stack spacing={2} p={2}>
                    <Typography variant="h5" fontWeight="bold">
                      Repository
                    </Typography>
                    <Typography variant="body1"><a href={project.link_repo}>{project.link_repo}..</a></Typography>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>
    </ComponentSkeleton>
  );
}

export default ComponentProjects;
