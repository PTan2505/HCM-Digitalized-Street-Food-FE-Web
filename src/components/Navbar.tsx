import { useAppDispatch } from '@hooks/reduxHooks';
import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { logout } from '@slices/auth';

import { type JSX } from 'react';

export default function Navbar(): JSX.Element {
  const dispatch = useAppDispatch();

  return (
    <Box className="grow">
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            className="mr-4"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" className="grow">
            News
          </Typography>
          <Button color="inherit" onClick={() => dispatch(logout())}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
