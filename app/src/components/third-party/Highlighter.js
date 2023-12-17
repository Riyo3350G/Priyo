import PropTypes from 'prop-types';
import { decodeToken } from 'react-jwt';

// material-ui
import { Box, CardActions, Divider, IconButton, Tooltip } from '@mui/material';

// assets
import { EditOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';


// ==============================|| CLIPBOARD & HIGHLIGHTER   ||============================== //

const Highlighter = ({ openDetailsProject, openEditProject, openDeleteProject, project, projectChosen, members }) => {

  const myDecodedToken = decodeToken(localStorage.getItem('token'));

  return (
    <Box sx={{ position: 'relative' }}>
      <CardActions sx={{ justifyContent: 'flex-end', p: 1, mb: 0 }}>
        <Box sx={{ display: 'flex', position: 'inherit', right: 0, top: 6 }}>
          { myDecodedToken.id === projectChosen?.created_by?.id ? ( 
            <>
              <Tooltip title="Edit Project">
                <IconButton
                  sx={{ fontSize: '0.875rem' }}
                  size="small"
                  color={'secondary'}
                  onClick={() => {
                    project(projectChosen)
                    openEditProject(true)
                    const transformedData = (projectChosen.members?.map((user) => {
                      return {
                        value: user.id,
                        title: user.username,
                      };
                    }));
                    members(transformedData)
                  }}
                >
                  <EditOutlined />
                </IconButton>
              </Tooltip>
              <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 1 }} /> 
              <Tooltip title="Delete Project">
                <IconButton
                  sx={{ fontSize: '0.875rem' }}
                  size="small"
                  color={'secondary'}
                  onClick={() => {
                    project(projectChosen)
                    openDeleteProject(true)
                  }}
                >
                  <DeleteOutlined />
                </IconButton>
              </Tooltip>
              <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 1 }} />
            </>
          ) : null}
          <Tooltip title="Details Project">
            <IconButton
              sx={{ fontSize: '0.875rem' }}
              size="small"
              color={'secondary'}
              onClick={() => {
                project(projectChosen)
                openDetailsProject(true)
              }}
            >
              <InfoCircleOutlined />
            </IconButton>
          </Tooltip>
        </Box>
      </CardActions>
    </Box>
  );
};

Highlighter.propTypes = {
  children: PropTypes.node
};

export default Highlighter;
