import React, { useEffect, useState } from 'react';
// material-ui
import { Box, Typography, Grid, Modal, TextField, Autocomplete } from '@mui/material';
import { Card, CardContent, CardActions } from "@mui/material";
import { Draggable } from "@hello-pangea/dnd";
import { Droppable } from "@hello-pangea/dnd";
import { DragDropContext } from "@hello-pangea/dnd";
// project import
import ComponentSkeleton from './ComponentSkeleton';
import MainCard from 'components/MainCard';

import { Stack, Button } from '@mui/material';

import { decodeToken } from 'react-jwt';

import axios from 'axios';

import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';

import { useNavigate } from 'react-router-dom';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import {
  FormHelperText,
  InputLabel,
  OutlinedInput
} from '@mui/material';

import dayjs from 'dayjs';


// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

import AnimateButton from 'components/@extended/AnimateButton';

import TextareaAutosize from '@mui/base/TextareaAutosize';
import { styled } from '@mui/system';

import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import UpdateIcon from '@mui/icons-material/Update';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const TicketCard = ({ ticket, index, ticketChosen, openTicket, openDeleteTicket, openDetailsTicket }) => {

  const setColor = (ticket_type) => {
    if (ticket_type === "Feature") {
      return "primary";
    } else if (ticket_type === "Bug") {
      return "error";
    } else if (ticket_type === "Improvement") {
      return "success";
    } else if (ticket_type === "Task") {
      return "info";
    }
  }

  return (
    <Draggable index={index} draggableId={ticket.id}>
      {(provided, snapshot) => (
        <Box
          sx={{ marginBottom: 1 }}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          <Card
            style={{
              opacity: snapshot.isDragging ? 0.9 : 1,
              transform: snapshot.isDragging ? "rotate(-2deg)" : "",
            }}
            elevation={snapshot.isDragging ? 3 : 1}
          >
            <CardContent>
              <Stack direction="row" justifyContent="space-between" sx={{ alignItems: "center" }}>
                <Typography variant="h5" component="div">
                  {ticket.title}
                </Typography>
                <Typography sx={{ fontSize: 2 }} color="text.secondary">
                  <Chip label={ticket.ticket_type} color={setColor(ticket.ticket_type)} size="small" sx={{ fontSize: 12 }} />
                </Typography>
              </Stack>
              <Typography variant="body2">Project : {ticket.project.name}</Typography>
            </CardContent>
            <CardActions justifyContent="flex-end">
              <Stack direction="row" justifyContent="space-between" sx={{ alignItems: "center", ml: "auto" }}>
                <IconButton onClick={() => {
                  ticketChosen(ticket);
                  openDetailsTicket(true)
                }}>
                  <VisibilityIcon />
                </IconButton>
                <IconButton onClick={() => {
                  ticketChosen(ticket);
                  openDeleteTicket(true)
                }}>
                  <DeleteIcon />
                </IconButton>
                <IconButton size="small" onClick={() => {
                  ticketChosen(ticket);
                  openTicket(true)
                }}>
                  <UpdateIcon />
                </IconButton>
              </Stack>
            </CardActions>
          </Card>


        </Box>
      )
      }
    </Draggable >

  );
};

const ComponentTicket = () => {

  const navigate = useNavigate();

  const [openAddTicket, setOpenAddTicket] = useState(false);
  const [openTicket, setOpenTicket] = useState(false);
  const [openDeleteTicket, setOpenDeleteTicket] = useState(false);
  const [openDetailsTicket, setOpenDetailsTicket] = useState(false);
  const [ticketChosen, setTicketChosen] = useState(null);
  const [projects, setProjects] = useState([]);
  const [project, setProject] = useState([]);
  const [ticketsProposed, setTicketsProposed] = useState([]);
  const [ticketsInProgress, setTicketsInProgress] = useState([]);
  const [ticketsBlocked, setTicketsBlocked] = useState([]);
  const [ticketsReadyToReview, setTicketsReadyToReview] = useState([]);
  const [ticketsDone, setTicketsDone] = useState([]);
  const [projectsOriginal, setProjectsOriginal] = useState([]);

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


  const updateStatus = async (ticket, status) => {
    const request = {
      ticket_type: ticket.ticket_type,
      title: ticket.title,
      description: ticket.description,
      status: status,
      parent_id: ticket.parent_id,
      created_by: ticket.created_by
    };
    await axios
      .put(`http://127.0.0.1:5000/api/v1/tickets/${ticket.id}`, request)
      .then(() => {
        console.log("Ticket updated");
        setOpenTicket(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (destination) {
      if (destination.droppableId === "proposed") {
        if (source.droppableId === "inprogress") {
          const updatedTicketsInProgress = ticketsInProgress.filter(ticket => ticket.id === draggableId);
          const removeTicketFromInProgress = ticketsInProgress.filter(ticket => ticket.id !== draggableId);
          setTicketsInProgress(removeTicketFromInProgress);
          setTicketsProposed([...ticketsProposed, updatedTicketsInProgress[0]]);
          updateStatus(updatedTicketsInProgress[0], "Proposed");
        }
        if (source.droppableId === "blocked") {
          const updatedTicketsBlocked = ticketsBlocked.filter(ticket => ticket.id === draggableId);
          const removeTicketFromBlocked = ticketsBlocked.filter(ticket => ticket.id !== draggableId);
          setTicketsBlocked(removeTicketFromBlocked);
          setTicketsProposed([...ticketsProposed, updatedTicketsBlocked[0]]);
          updateStatus(updatedTicketsBlocked[0], "Proposed");
        }
        if (source.droppableId === "readytoreview") {
          const updatedTicketsReadyToReview = ticketsReadyToReview.filter(ticket => ticket.id === draggableId);
          const removeTicketFromReadyToReview = ticketsReadyToReview.filter(ticket => ticket.id !== draggableId);
          setTicketsReadyToReview(removeTicketFromReadyToReview);
          setTicketsProposed([...ticketsProposed, updatedTicketsReadyToReview[0]]);
          updateStatus(updatedTicketsReadyToReview[0], "Proposed");
        }
        if (source.droppableId === "done") {
          const updatedTicketsDone = ticketsDone.filter(ticket => ticket.id === draggableId);
          const removeTicketFromDone = ticketsDone.filter(ticket => ticket.id !== draggableId);
          setTicketsDone(removeTicketFromDone);
          setTicketsProposed([...ticketsProposed, updatedTicketsDone[0]]);
          updateStatus(updatedTicketsDone[0], "Proposed");
        }
      }
      if (destination.droppableId === "inprogress") {
        if (source.droppableId === "proposed") {
          const updatedTicketsProposed = ticketsProposed.filter(ticket => ticket.id === draggableId);
          const removeTicketFromProposed = ticketsProposed.filter(ticket => ticket.id !== draggableId);
          setTicketsProposed(removeTicketFromProposed);
          setTicketsInProgress([...ticketsInProgress, updatedTicketsProposed[0]]);
          updateStatus(updatedTicketsProposed[0], "In Progress");
        }
        if (source.droppableId === "blocked") {
          const updatedTicketsBlocked = ticketsBlocked.filter(ticket => ticket.id === draggableId);
          const removeTicketFromBlocked = ticketsBlocked.filter(ticket => ticket.id !== draggableId);
          setTicketsBlocked(removeTicketFromBlocked);
          setTicketsInProgress([...ticketsInProgress, updatedTicketsBlocked[0]]);
          updateStatus(updatedTicketsBlocked[0], "In Progress");
        }
        if (source.droppableId === "readytoreview") {
          const updatedTicketsReadyToReview = ticketsReadyToReview.filter(ticket => ticket.id === draggableId);
          const removeTicketFromReadyToReview = ticketsReadyToReview.filter(ticket => ticket.id !== draggableId);
          setTicketsReadyToReview(removeTicketFromReadyToReview);
          setTicketsInProgress([...ticketsInProgress, updatedTicketsReadyToReview[0]]);
          updateStatus(updatedTicketsReadyToReview[0], "In Progress");
        }
        if (source.droppableId === "done") {
          const updatedTicketsDone = ticketsDone.filter(ticket => ticket.id === draggableId);
          const removeTicketFromDone = ticketsDone.filter(ticket => ticket.id !== draggableId);
          setTicketsDone(removeTicketFromDone);
          setTicketsInProgress([...ticketsInProgress, updatedTicketsDone[0]]);
          updateStatus(updatedTicketsDone[0], "In Progress");
        }
      } else if (destination.droppableId === "done") {
        if (source.droppableId === "proposed") {
          const updatedTicketsProposed = ticketsProposed.filter(ticket => ticket.id === draggableId);
          const removeTicketFromProposed = ticketsProposed.filter(ticket => ticket.id !== draggableId);
          setTicketsProposed(removeTicketFromProposed);
          setTicketsDone([...ticketsDone, updatedTicketsProposed[0]]);
          updateStatus(updatedTicketsProposed[0], "Done");
        }
        if (source.droppableId === "blocked") {
          const updatedTicketsBlocked = ticketsBlocked.filter(ticket => ticket.id === draggableId);
          const removeTicketFromBlocked = ticketsBlocked.filter(ticket => ticket.id !== draggableId);
          setTicketsBlocked(removeTicketFromBlocked);
          setTicketsDone([...ticketsDone, updatedTicketsBlocked[0]]);
          updateStatus(updatedTicketsBlocked[0], "Done");
        }
        if (source.droppableId === "readytoreview") {
          const updatedTicketsReadyToReview = ticketsReadyToReview.filter(ticket => ticket.id === draggableId);
          const removeTicketFromReadyToReview = ticketsReadyToReview.filter(ticket => ticket.id !== draggableId);
          setTicketsReadyToReview(removeTicketFromReadyToReview);
          setTicketsDone([...ticketsDone, updatedTicketsReadyToReview[0]]);
          updateStatus(updatedTicketsReadyToReview[0], "Done");
        }
        if (source.droppableId === "inprogress") {
          const updatedTicketsInProgress = ticketsInProgress.filter(ticket => ticket.id === draggableId);
          const removeTicketFromInProgress = ticketsInProgress.filter(ticket => ticket.id !== draggableId);
          setTicketsInProgress(removeTicketFromInProgress);
          setTicketsDone([...ticketsDone, updatedTicketsInProgress[0]]);
          updateStatus(updatedTicketsInProgress[0], "Done");
        }
      } else if (destination.droppableId === "blocked") {
        if (source.droppableId === "proposed") {
          const updatedTicketsProposed = ticketsProposed.filter(ticket => ticket.id === draggableId);
          const removeTicketFromProposed = ticketsProposed.filter(ticket => ticket.id !== draggableId);
          setTicketsProposed(removeTicketFromProposed);
          setTicketsBlocked([...ticketsBlocked, updatedTicketsProposed[0]]);
          updateStatus(updatedTicketsProposed[0], "Blocked");
        }
        if (source.droppableId === "inprogress") {
          const updatedTicketsInProgress = ticketsInProgress.filter(ticket => ticket.id === draggableId);
          const removeTicketFromInProgress = ticketsInProgress.filter(ticket => ticket.id !== draggableId);
          setTicketsInProgress(removeTicketFromInProgress);
          setTicketsBlocked([...ticketsBlocked, updatedTicketsInProgress[0]]);
          updateStatus(updatedTicketsInProgress[0], "Blocked");
        }
        if (source.droppableId === "readytoreview") {
          const updatedTicketsReadyToReview = ticketsReadyToReview.filter(ticket => ticket.id === draggableId);
          const removeTicketFromReadyToReview = ticketsReadyToReview.filter(ticket => ticket.id !== draggableId);
          setTicketsReadyToReview(removeTicketFromReadyToReview);
          setTicketsBlocked([...ticketsBlocked, updatedTicketsReadyToReview[0]]);
          updateStatus(updatedTicketsReadyToReview[0], "Blocked");
        }
        if (source.droppableId === "done") {
          const updatedTicketsDone = ticketsDone.filter(ticket => ticket.id === draggableId);
          const removeTicketFromDone = ticketsDone.filter(ticket => ticket.id !== draggableId);
          setTicketsDone(removeTicketFromDone);
          setTicketsBlocked([...ticketsBlocked, updatedTicketsDone[0]]);
          updateStatus(updatedTicketsDone[0], "Blocked");
        }
      } else if (destination.droppableId === "readytoreview") {
        if (source.droppableId === "proposed") {
          const updatedTicketsProposed = ticketsProposed.filter(ticket => ticket.id === draggableId);
          const removeTicketFromProposed = ticketsProposed.filter(ticket => ticket.id !== draggableId);
          setTicketsProposed(removeTicketFromProposed);
          setTicketsReadyToReview([...ticketsReadyToReview, updatedTicketsProposed[0]]);
          updateStatus(updatedTicketsProposed[0], "Ready To Review");
        }
        if (source.droppableId === "inprogress") {
          const updatedTicketsInProgress = ticketsInProgress.filter(ticket => ticket.id === draggableId);
          const removeTicketFromInProgress = ticketsInProgress.filter(ticket => ticket.id !== draggableId);
          setTicketsInProgress(removeTicketFromInProgress);
          setTicketsReadyToReview([...ticketsReadyToReview, updatedTicketsInProgress[0]]);
          updateStatus(updatedTicketsInProgress[0], "Ready To Review");
        }
        if (source.droppableId === "blocked") {
          const updatedTicketsBlocked = ticketsBlocked.filter(ticket => ticket.id === draggableId);
          const removeTicketFromBlocked = ticketsBlocked.filter(ticket => ticket.id !== draggableId);
          setTicketsBlocked(removeTicketFromBlocked);
          setTicketsReadyToReview([...ticketsReadyToReview, updatedTicketsBlocked[0]]);
          updateStatus(updatedTicketsBlocked[0], "Ready To Review");
        }
        if (source.droppableId === "done") {
          const updatedTicketsDone = ticketsDone.filter(ticket => ticket.id === draggableId);
          const removeTicketFromDone = ticketsDone.filter(ticket => ticket.id !== draggableId);
          setTicketsDone(removeTicketFromDone);
          setTicketsReadyToReview([...ticketsReadyToReview, updatedTicketsDone[0]]);
          updateStatus(updatedTicketsDone[0], "Ready To Review");
        }
      }
    }
  };

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

  const fetchTickets = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      const myDecodedToken = decodeToken(token);
      await axios.get(`http://localhost:5000/api/v1/users/${myDecodedToken.id}/tickets`)
        .then((data) => {
          setTicketsProposed(data.data.filter(ticket => ticket.status === "Proposed"));
          setTicketsInProgress(data.data.filter(ticket => ticket.status === "In Progress"));
          setTicketsBlocked(data.data.filter(ticket => ticket.status === "Blocked"));
          setTicketsReadyToReview(data.data.filter(ticket => ticket.status === "Ready To Review"));
          setTicketsDone(data.data.filter(ticket => ticket.status === "Done"));
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchTickets();
    handleModal();
  }, []);

  const handleModal = async () => {

    const token = localStorage.getItem("token");
    if (token) {
      const myDecodedToken = decodeToken(token);
      await axios.get(`http://localhost:5000/api/v1/users/${myDecodedToken.id}/projects`)
        .then((data) => {
          setProjectsOriginal(data.data);
          const transformedData = data.data.map((project) => {
            return {
              value: project.id,
              title: project.name,
            };
          })
          setProjects(transformedData);
        })
        .catch(() => {
          navigate("/login");
        });
    }
  };

  const handleTickets = async (values, setErrors, setStatus, setSubmitting) => {

    const token = localStorage.getItem("token");
    const myDecodedToken = decodeToken(token);

    const request = {
      created_by: myDecodedToken.id,
      title: values.title,
      description: values.description,
      status: "Proposed",
      ticket_type: values.ticket_type,
      parent_id: project.value,
      end_date: values.deliverydate.toISOString()
    };

    await axios
      .post("http://127.0.0.1:5000/api/v1/tickets", request)
      .then(() => {
        fetchTickets();
        setOpenAddTicket(false);
        setStatus({ success: false });
        setSubmitting(false);
      })
      .catch((error) => {
        setStatus({ success: false });
        setErrors({ submit: error.message });
        setSubmitting(false);
      });
  };

  const removeTicket = async () => {
    await axios
      .delete(`http://127.0.0.1:5000/api/v1/tickets/${ticketChosen.id}`)
      .then(() => {
        console.log("Ticket deleted!");
        setOpenDeleteTicket(false);
        fetchTickets();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const updateTicket = async (values, setErrors, setStatus, setSubmitting) => {
    const request = {
      id: ticketChosen.id,
      title: values.title,
      description: values.description,
      ticket_type: values.ticket_type,
      parent_id: ticketChosen.parent_id,
      created_by: values.created_by,
      end_date: values.deliverydate.toISOString()
    };
    await axios
      .put(`http://127.0.0.1:5000/api/v1/tickets/${ticketChosen.id}`, request)
      .then(() => {
        setOpenTicket(false);
        fetchTickets();
        setStatus({ success: false });
        setSubmitting(false);
      })
      .catch((error) => {
        setStatus({ success: false });
        setErrors({ submit: error.message });
        setSubmitting(false);
      });
  }

  return (
    <ComponentSkeleton>
      <Stack direction="row" justifyContent="end" sx={{ paddingY: 2 }}>
        <Button
          size="small"
          variant="contained"
          sx={{ textTransform: 'capitalize' }}
          onClick={() => {
            setOpenAddTicket(true);
            handleModal();
          }}
        >
          Create Ticket
        </Button>
      </Stack>
      <DragDropContext onDragEnd={onDragEnd}>
        <Box display="flex" sx={{ justifyContent: 'space-between', width: '100%', p: 0 }}>
          <MainCard title="Proposed" sx={{ width: '18%' }}>
            <Droppable droppableId={"proposed"} index={0}>
              {(droppableProvided, snapshot) => (
                <Box
                  ref={droppableProvided.innerRef}
                  {...droppableProvided.droppableProps}
                  className={snapshot.isDraggingOver ? " isDraggingOver" : ""}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    "&.isDraggingOver": {
                      bgcolor: "#dadadf",
                    },
                  }}
                >
                  {ticketsProposed.length > 0 && ticketsProposed.map((ticket, index) => (
                    <TicketCard key={ticket.id} ticket={ticket} index={index} ticketChosen={setTicketChosen} openTicket={setOpenTicket} openDeleteTicket={setOpenDeleteTicket} openDetailsTicket={setOpenDetailsTicket} />
                  ))}
                  {droppableProvided.placeholder}
                </Box>
              )}
            </Droppable>
          </MainCard>

          <MainCard title="In Progress" sx={{ width: '18%' }}>
            <Droppable droppableId={"inprogress"} index={1}>
              {(droppableProvided, snapshot) => (
                <Box
                  ref={droppableProvided.innerRef}
                  {...droppableProvided.droppableProps}
                  className={snapshot.isDraggingOver ? " isDraggingOver" : ""}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    "&.isDraggingOver": {
                      bgcolor: "#dadadf",
                    },
                  }}
                >
                  {ticketsInProgress.length > 0 && ticketsInProgress.map((ticket, index) => (
                    <TicketCard key={ticket.id} ticket={ticket} index={index} ticketChosen={setTicketChosen} openTicket={setOpenTicket} openDeleteTicket={setOpenDeleteTicket} openDetailsTicket={setOpenDetailsTicket} />
                  ))}
                  {droppableProvided.placeholder}
                </Box>
              )}
            </Droppable>
          </MainCard>

          <MainCard title="Blocked" sx={{ width: '18%' }}>
            <Droppable droppableId={"blocked"} index={2}>
              {(droppableProvided, snapshot) => (
                <Box
                  ref={droppableProvided.innerRef}
                  {...droppableProvided.droppableProps}
                  className={snapshot.isDraggingOver ? " isDraggingOver" : ""}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    "&.isDraggingOver": {
                      bgcolor: "#dadadf",
                    },
                  }}
                >
                  {ticketsBlocked.length > 0 && ticketsBlocked.map((ticket, index) => (
                    <TicketCard key={ticket.id} ticket={ticket} index={index} ticketChosen={setTicketChosen} openTicket={setOpenTicket} openDeleteTicket={setOpenDeleteTicket} openDetailsTicket={setOpenDetailsTicket} />
                  ))}
                  {droppableProvided.placeholder}
                </Box>
              )}
            </Droppable>
          </MainCard>

          <MainCard title="Ready to Review" sx={{ width: '18%' }}>
            <Droppable droppableId={"readytoreview"} index={3}>
              {(droppableProvided, snapshot) => (
                <Box
                  ref={droppableProvided.innerRef}
                  {...droppableProvided.droppableProps}
                  className={snapshot.isDraggingOver ? " isDraggingOver" : ""}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    "&.isDraggingOver": {
                      bgcolor: "#dadadf",
                    },
                  }}
                >
                  {ticketsReadyToReview.length > 0 && ticketsReadyToReview.map((ticket, index) => (
                    <TicketCard key={ticket.id} ticket={ticket} index={index} ticketChosen={setTicketChosen} openTicket={setOpenTicket} openDeleteTicket={setOpenDeleteTicket} openDetailsTicket={setOpenDetailsTicket} />
                  ))}
                  {droppableProvided.placeholder}
                </Box>
              )}
            </Droppable>
          </MainCard>

          <MainCard title="Done" sx={{ width: '18%' }}>
            <Droppable droppableId={"done"} index={4}>
              {(droppableProvided, snapshot) => (
                <Box
                  ref={droppableProvided.innerRef}
                  {...droppableProvided.droppableProps}
                  className={snapshot.isDraggingOver ? " isDraggingOver" : ""}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    "&.isDraggingOver": {
                      bgcolor: "#dadadf",
                    },
                  }}
                >
                  {ticketsDone.length > 0 && ticketsDone.map((ticket, index) => (
                    <TicketCard key={ticket.id} ticket={ticket} index={index} ticketChosen={setTicketChosen} openTicket={setOpenTicket} openDeleteTicket={setOpenDeleteTicket} openDetailsTicket={setOpenDetailsTicket} />
                  ))}
                  {droppableProvided.placeholder}
                </Box>
              )}
            </Droppable>
          </MainCard>
        </Box>
      </DragDropContext>
      <Modal
        open={openAddTicket}
        onClose={() => setOpenAddTicket(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Formik
            initialValues={{
              title: '',
              description: '',
              ticket_type: '',
              deliverydate: dayjs(Date.now()),
              submit: null
            }}
            validationSchema={Yup.object().shape({
              title: Yup.string().max(255).required('Title is required'),
              ticket_type: Yup.string().max(255).required('The Ticket Type is required'),
              description: Yup.string().max(255).required('Description is required'),
              deliverydate: Yup.date(),
            })}
            onSubmit={(values, { setErrors, setStatus, setSubmitting }) => {
              handleTickets(values, setErrors, setStatus, setSubmitting);
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
                        type="title"
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
                      <InputLabel htmlFor="delivery-date">Delivery Date</InputLabel>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker
                          value={values.deliverydate}
                          onChange={(date) => {
                            handleChange({
                              target: {
                                name: 'deliverydate',
                                value: date,
                              },
                            });
                          }}
                          onBlur={handleBlur}
                          renderInput={(props) => (
                            <TextField
                              {...props}
                              variant="standard"
                              label="Delivery Date"
                              placeholder="Delivery Date..."
                            />
                          )}
                          error={Boolean(touched.deliverydate && errors.deliverydate)}
                        />
                      </LocalizationProvider>
                      {touched.deliverydate && errors.deliverydate && (
                        <FormHelperText error id="helper-text-delivery-date">
                          {errors.deliverydate}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <Autocomplete
                        id="tags-standard"
                        options={projects}
                        getOptionLabel={(option) => option.title}
                        onChange={(event, value) => {
                          setProject(value);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="standard"
                            label="Project Parent"
                            placeholder="Project..."
                          />
                        )}
                      />
                      {touched.projects && errors.projects && (
                        <FormHelperText error id="helper-text-projects-signup">
                          {errors.projects}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="role-signup">Ticket Type</InputLabel>
                      <Select
                        id="ticket-type-login"
                        type="ticket_type"
                        value={values.ticket_type}
                        name="ticket_type"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Ticket Type..."
                        fullWidth
                        error={Boolean(touched.ticket_type && errors.ticket_type)}
                      >
                        <MenuItem value={"Feature"}>Feature</MenuItem>
                        <MenuItem value={"Bug"}>Bug</MenuItem>
                        <MenuItem value={"Improvement"}>Improvement</MenuItem>
                        <MenuItem value={"Task"}>Task</MenuItem>
                      </Select>
                      {touched.ticket_type && errors.ticket_type && (
                        <FormHelperText error id="helper-text-ticket_type-signup">
                          {errors.ticket_type}
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
        open={openTicket}
        onClose={() => setOpenTicket(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Formik
            initialValues={{
              title: ticketChosen ? ticketChosen.title : '',
              description: ticketChosen ? ticketChosen.description : '',
              ticket_type: ticketChosen ? ticketChosen.ticket_type : '',
              parent_id: ticketChosen ? ticketChosen.parent_id : '',
              deliverydate: ticketChosen ? dayjs(ticketChosen.end_date) : dayjs(Date.now()),
              created_by: ticketChosen ? ticketChosen.created_by : '',
              submit: null
            }}
            validationSchema={Yup.object().shape({
              title: Yup.string().max(255).required('Title is required'),
              ticket_type: Yup.string().max(255).required('The Ticket Type is required'),
              description: Yup.string().max(255).required('Description is required'),
              deliverydate: Yup.date(),
            })}
            onSubmit={(values, { setErrors, setStatus, setSubmitting }) => {
              updateTicket(values, setErrors, setStatus, setSubmitting);
            }}
          >
            {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
              <form noValidate onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="role-signup">Assignee</InputLabel>
                      <Select
                        id="ticket-type-login"
                        type="created_by"
                        value={values.created_by}
                        name="created_by"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Assignee..."
                        fullWidth
                        error={Boolean(touched.created_by && errors.created_by)}
                      >
                        {projectsOriginal.find(p => p.id === values.parent_id).members.map(member => (
                          <MenuItem key={member.id} value={member.id}>{member.username}</MenuItem>
                        ))}
                        <MenuItem 
                          key={projectsOriginal.find(p => p.id === values.parent_id).created_by.id} 
                          value={projectsOriginal.find(p => p.id === values.parent_id).created_by.id}>
                            {projectsOriginal.find(p => p.id === values.parent_id).created_by.username}
                        </MenuItem>
                      </Select>
                      {touched.created_by && errors.created_by && (
                        <FormHelperText error id="helper-text-created_by-signup">
                          {errors.created_by}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
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
                      <InputLabel htmlFor="delivery-date">Delivery Date</InputLabel>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker
                          value={values.deliverydate}
                          onChange={(date) => {
                            handleChange({
                              target: {
                                name: 'deliverydate',
                                value: date,
                              },
                            });
                          }}
                          onBlur={handleBlur}
                          renderInput={(props) => (
                            <TextField
                              {...props}
                              variant="standard"
                              label="Delivery Date"
                              placeholder="Delivery Date..."
                            />
                          )}
                          error={Boolean(touched.deliverydate && errors.deliverydate)}
                        />
                      </LocalizationProvider>
                      {touched.deliverydate && errors.deliverydate && (
                        <FormHelperText error id="helper-text-delivery-date">
                          {errors.deliverydate}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="role-signup">Project</InputLabel>
                      <Select
                        id="parent_id-login"
                        type="parent_id"
                        value={values.parent_id}
                        name="parent_id"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Project..."
                        fullWidth
                        error={Boolean(touched.parent_id && errors.parent_id)}
                      >
                        {projects.map((project) => (
                          <MenuItem key={project.value} value={project.value}>{project.title}</MenuItem>
                        ))}
                      </Select>
                      {touched.parent_id && errors.parent_id && (
                        <FormHelperText error id="helper-text-parent_id-signup">
                          {errors.parent_id}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="role-signup">Ticket Type</InputLabel>
                      <Select
                        id="ticket-type-login"
                        type="ticket_type"
                        value={values.ticket_type}
                        name="ticket_type"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Ticket Type..."
                        fullWidth
                        error={Boolean(touched.ticket_type && errors.ticket_type)}
                      >
                        <MenuItem value={"Feature"}>Feature</MenuItem>
                        <MenuItem value={"Bug"}>Bug</MenuItem>
                        <MenuItem value={"Improvement"}>Improvement</MenuItem>
                        <MenuItem value={"Task"}>Task</MenuItem>
                      </Select>
                      {touched.ticket_type && errors.ticket_type && (
                        <FormHelperText error id="helper-text-ticket_type-signup">
                          {errors.ticket_type}
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
        open={openDeleteTicket}
        onClose={() => setOpenDeleteTicket(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Delete Ticket"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this Ticket?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteTicket(false)}>Cancel</Button>
          <Button autoFocus onClick={removeTicket}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Modal
        open={openDetailsTicket}
        onClose={() => setOpenDetailsTicket(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="title-signup">Title</InputLabel>
                <Typography>{ticketChosen?.title}</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="description-signup">Description</InputLabel>
                <Typography>{ticketChosen?.description}</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="role-signup">Project</InputLabel>
                <Typography>{ticketChosen?.project.name}</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="role-signup">Ticket Type</InputLabel>
                <Typography>{ticketChosen?.ticket_type}</Typography>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </ComponentSkeleton>
  )
};

export default ComponentTicket;
