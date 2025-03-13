import { Drawer, List, ListItemText, Box, Button, Avatar, IconButton, Tooltip, Divider, ListItemIcon, Menu, MenuItem } from '@mui/material';
import { useSidebar } from './sidebarContext';
import {
    Dashboard, Files, FAQIcon,
    CollapseIcon,
    ArchiveIcon,
    SmallUserProfileIcon,

    Project
} from "../../assets/icons/dashboardIcons";
import Logo from "../../assets/imgs/logo.png";
import LogoSmall from "../../assets/imgs/logo_small.png";
import { CustomListItemIcon, CustomLListItem } from './sidebar.style';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services';
// import { useDispatch } from 'react-redux';

// import { showGlobalSnackbar } from '../snackbarProvider';
import { Logout } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { HelpIcon } from '../../assets/icons/helpIcon';
import { SettingIcon } from '../../assets/icons/settingIcon';
import { useLogout } from '../logout';
import { userDetails } from '../../types';
import { stringAvatar } from '../../utils/stringAvatar';
import { useSelector } from 'react-redux';
import { CustomAvatar } from '../common.style';
// import { UserIcon } from '../../assets/icons/userIcon';
// import { Colors } from '../colors';

export default function Sidebar() {
    const { isCollapsed, toggleSidebar } = useSidebar();
    const { globalLogout } = useLogout();
    const userDetails = useSelector((state: any) => state.auth.userData);
    
    // const [userDetails, setUserDetails] = useState<userDetails>({
    //     id: NaN,
    //     name: 'John Deo',
    //     email: '',
    //     role: '',
    // });

    const logout = async () => {
        await globalLogout()
    }
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    // useEffect(() => {
    //     const persistAuth = JSON.parse(localStorage.getItem('persist:auth') || '{}')
    //     const userData = JSON.parse(persistAuth.userData || '{}')

    //     setUserDetails(userData)
    //     checkUser()
    // }, [])
    const checkUser = async () => {
        const response = await authService.checkUserLoggedIn()
        if (!response?.status) {
            await globalLogout()
        }
    }

    return (
        <Drawer
            variant="permanent"
            sx={{
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: isCollapsed ? 60 : 200,
                    transition: 'width 0.3s ease',
                    height: '100vh', // Full height
                    display: 'flex',
                    flexDirection: 'column',
                },
            }}
        >
            {isCollapsed ?
            
                <Box p={2}>
                    <Link to="/">
                        <img src={LogoSmall} alt="" height='24px' width="24px" />
                    </Link>
                </Box>
                :
                <Box p={2}>
                    <Link to="/">
                        <img src={Logo} alt="" height='65px' width="160px" />
                    </Link>
                </Box>
            }


            <Box
                sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    WebkitOverflowScrolling: 'touch', // Smooth scrolling in Safari
                    scrollbarWidth: 'none', // Hide scrollbar in Firefox
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100vh',
                    '&::-webkit-scrollbar': {
                        display: 'none', // Hide scrollbar in WebKit browsers (Chrome, Safari)
                    },
                }}
                className="scrollbar-hide"
            >
                <List>
                    <Link to="/dashboard">
                        <CustomLListItem>
                            <CustomListItemIcon>
                                <Dashboard />
                            </CustomListItemIcon>
                            {!isCollapsed && <ListItemText className='text-[#158277] custom-font' primary="Dashboard" />}
                        </CustomLListItem>
                    </Link>

                    <Link to="/projects">
                        <CustomLListItem>
                            <CustomListItemIcon>
                                <Project />
                            </CustomListItemIcon>
                            {!isCollapsed && <ListItemText className='text-[#158277] custom-font' primary="Projects" />}
                        </CustomLListItem>
                    </Link>
                    {/* <Link to="/allfiles">
                        <CustomLListItem>
                            <CustomListItemIcon>
                                <Files />
                            </CustomListItemIcon>
                            {!isCollapsed && <ListItemText className='text-[#158277] custom-font' primary="Files" />}
                        </CustomLListItem>
                    </Link> */}
                    <Link to="/archive">
                        <CustomLListItem>
                            <CustomListItemIcon>
                                <ArchiveIcon />
                            </CustomListItemIcon>
                            {!isCollapsed && <ListItemText className='text-[#158277] custom-font' primary="Archive" />}
                        </CustomLListItem>
                    </Link>
                </List>
                <List>
                    <CustomLListItem onClick={toggleSidebar} >
                        <CustomListItemIcon>
                            <CollapseIcon />
                        </CustomListItemIcon>
                        {!isCollapsed && <ListItemText className='text-[#158277] custom-font' primary="Collapse Menu" />}
                    </CustomLListItem>
                    {/* <CustomLListItem>
                        <CustomListItemIcon>
                            <FAQIcon />
                        </CustomListItemIcon>
                        {!isCollapsed && <ListItemText className='text-[#158277] custom-font' primary="FAQ" />}
                    </CustomLListItem> */}
                    {/* <span onClick={logout}>
                        <CustomLListItem>
                            <CustomListItemIcon>
                                <LogoutIcon />
                            </CustomListItemIcon>
                            {!isCollapsed && <ListItemText className='text-[#158277] custom-font' primary="Logout" />}
                        </CustomLListItem>
                    </span> */}
                    {/* <CustomLListItem>
                        <CustomListItemIcon>
                            <Settings />
                        </CustomListItemIcon>
                        {!isCollapsed && <ListItemText className='text-[#158277] custom-font' primary="Settings" />}
                    </CustomLListItem> */}

                    {/* <CustomLListItem>
                        <CustomListItemIcon>
                            <AdminPortalIcon />
                        </CustomListItemIcon>
                        {!isCollapsed && <ListItemText className='text-[#158277]' primary="Admin Portal" />}
                    </CustomLListItem> */}
                    <CustomLListItem sx={{ paddingLeft: '10px' }}>
                        <CustomListItemIcon>
                            {!isCollapsed &&
                                <IconButton
                                    onClick={handleClick}
                                    size="small"
                                    // sx={{ ml: 2 }}
                                    aria-controls={open ? 'account-menu' : undefined}
                                    aria-haspopup="true"
                                    aria-expanded={open ? 'true' : undefined}
                                >
                                    {/* <UserProfileIcon /> */}
                                    <Box sx={{ background: '#18988B' }} className="px-2 py-1 rounded-2xl">
                                        <div className="flex items-center">

                                            <span className='me-2'><svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M7 8C4.78125 8 3 6.21875 3 4C3 1.8125 4.78125 0 7 0C9.1875 0 11 1.8125 11 4C11 6.21875 9.1875 8 7 8ZM5.5625 9.5H8.40625C11.5 9.5 14 12 14 15.0938C14 15.5938 13.5625 16 13.0625 16H0.90625C0.40625 16 0 15.5938 0 15.0938C0 12 2.46875 9.5 5.5625 9.5Z" fill="white" />
                                            </svg>

                                            </span>
                                            <CustomAvatar sx={{color:'white', background:'transparent'}}  {...stringAvatar(userDetails?.name)} />
                                        </div>
                                    </Box>


                                    {/* <Avatar {...stringAvatar(userDetails?.name)} /> */}
                                </IconButton>
                            }

                            {isCollapsed &&
                                <IconButton
                                    onClick={handleClick}
                                    size="small"
                                    aria-controls={open ? 'account-menu' : undefined}
                                    aria-haspopup="true"
                                    aria-expanded={open ? 'true' : undefined}
                                    sx={{p:0}}
                                    >

                                    <SmallUserProfileIcon />
                                </IconButton>
                            }
                        </CustomListItemIcon>

                    </CustomLListItem>

                    <Menu
                        anchorEl={anchorEl}
                        id="account-menu"
                        open={open}
                        onClose={handleClose}
                        onClick={handleClose}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
                        slotProps={{
                            paper: {
                                elevation: 0,
                                sx: {
                                    overflow: 'visible',
                                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                    mt: '-35px',
                                    '& .MuiAvatar-root': {
                                        width: 32,
                                        height: 32,
                                        ml: -0.5,
                                        mr: 1,
                                    },

                                },
                            },
                        }}

                    >

                        <MenuItem onClick={handleClose}>
                            <div className='flex'>
                                <div>
                                    <CustomAvatar {...stringAvatar(userDetails?.name)} />

                                </div>
                                <div>
                                    <span className='text-sm'>{userDetails?.name}</span>
                                    <div>
                                        <span className='text-xs text-[#5C5F5B]'>{userDetails?.email}</span>
                                    </div>
                                </div>

                            </div>
                        </MenuItem>
                        <MenuItem component={Link} to={'/settings'} onClick={handleClose}>
                            <ListItemIcon>
                                <SettingIcon fill="#757874" />
                            </ListItemIcon>
                            Settings
                        </MenuItem>
                        <MenuItem onClick={handleClose}>
                            <ListItemIcon>
                                <HelpIcon />
                            </ListItemIcon>
                            Help
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={logout}>
                            <ListItemIcon>
                                <Logout fontSize="small" />
                            </ListItemIcon>
                            Logout
                        </MenuItem>
                    </Menu>
                </List>
            </Box>
        </Drawer>
    );
};


