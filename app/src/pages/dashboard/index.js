import { useEffect, useState } from 'react';

// material-ui
import {
  Grid,
} from '@mui/material';

import { useNavigate } from 'react-router-dom';

import ComponentSkeleton from '../components-overview/ComponentSkeleton';


import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import "react-big-calendar/lib/css/react-big-calendar.css";

import axios from 'axios';

import { decodeToken } from 'react-jwt';



// Setup the localizer by providing the moment (or globalize, or Luxon) Object
// to the correct localizer.
const localizer = momentLocalizer(moment) // or globalizeLocalizer

// ==============================|| DASHBOARD - DEFAULT ||============================== //

const DashboardDefault = () => {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);

  const fetchTickets = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      const myDecodedToken = decodeToken(token);
      await axios.get(`http://localhost:5000/api/v1/users/${myDecodedToken.id}/tickets`)
        .then((data) => {
          data.data.map((ticket) => {
            ticket.start = new Date(ticket.created_at);
            ticket.end = new Date(ticket.end_date);
          })
          setTickets(data.data);
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      navigate("/login");
    }
  };


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
    fetchTickets();
  }, []);

  return (
    <ComponentSkeleton>
      <Grid>
        <Calendar
          localizer={localizer}
          events={tickets}
          startAccessor="start"
          endAccessor="end"
          defaultView="month"
          style={{ height: 800, width: '100%' }}
        />
      </Grid>
    </ComponentSkeleton>
  );
};

export default DashboardDefault;
