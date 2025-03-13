
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
// import BellIcon from '../assets/icons/bellIocn';
// import NotificationIcon from '../assets/icons/notificationIcon';
import { Avatar, Breadcrumbs, Tooltip } from '@mui/material';
import LogoSmall from "../assets/imgs/logo_small.png";
import { Link } from "react-router-dom";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Project } from '../assets/icons/dashboardIcons';
import { Colors } from './colors';
import { GreaterThenIcon } from '../assets/icons/greaterThenIcon';
import { useEffect, useState } from 'react';
import { authService } from '../services';
import { useLogout } from '../common/logout';
import { ArchiveIcon } from '../assets/icons/archiveIcon';
import { stringAvatar, truncateString } from '../utils/stringAvatar';
import { userDetails } from '../types';
import { CustomAvatar } from './common.style';

interface PageWrapperProps {
    pageName?: string,
    title?: string,
    breadCrumb1?: string
    breadCrumb2?: Breadcrumbs
    breadCrumb3?: string
}
interface Breadcrumbs {
name:string,
link:string
}

export default function Header({ pageName, title, breadCrumb1, breadCrumb2, breadCrumb3 }: PageWrapperProps) {
    const { globalLogout } = useLogout();
    const [userDetails, setUserDetails] = useState<userDetails>({
        id: 0,
        name: 'John Deo',
        email: '',
        role: '',
    });
 

    useEffect(() => {
        checkUser()
    }, [])
    const checkUser = async () => {
        // const user = JSON.parse(localStorage.getItem('persist:auth') || '{}')
        // setUserDetails(JSON.parse(user?.userData))

        const response = await authService.checkUserLoggedIn()
        if (!response?.status) {
            await globalLogout()
        }else{
            setUserDetails(response.data)
        }

    }
    return (
        <Box>
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static" color="transparent" >
                    <Toolbar>
                        <Link to="/">
                        <img src={LogoSmall} alt="" height='34px' width="38px" />
                        </Link>
                        {pageName &&
                            <Typography variant="h6" fontWeight={600} color='#757874' marginLeft={'16px'} component="div" sx={{ flexGrow: 1 }}>
                                {pageName}
                            </Typography>
                        }
                        {title && <Typography className='break-all' variant="h6" fontWeight={600} 
                        color={Colors.tertiary} marginLeft={'16px'} component="div" sx={{ flexGrow: 1 }} title={title}>
                            <Tooltip title={title}><span>{title}</span></Tooltip>
                            <br />
                            <Breadcrumbs aria-label="breadcrumb" separator={<GreaterThenIcon fill={Colors.lightGrey} />}>
                                <Link to={breadCrumb1 === 'Archive' ? '/archive' :'/projects'}>
                                    <div className="flex items-center">
                                        {breadCrumb1 === 'Archive' ?
                                        <ArchiveIcon />
                                        :
                                        <Project fill='#AAACA7' />
                                        }
                                        <span className={`ms-1 text-[#AAACA7] font-semibold`}>{breadCrumb1}</span>
                                    </div>
                                </Link>
                                <div >
                                    {breadCrumb3 ?
                                        <Link to={`${breadCrumb2?.link}`}>
                                            <Typography sx={{ color: breadCrumb3 ? '#AAACA7' : '#757874', fontWeight: '600' }}>
                                                {breadCrumb2?.name}

                                            </Typography>
                                        </Link>
                                        :
                                        <span className='font-semibold'>{breadCrumb2?.name}</span>
                                    }
                                </div>
                                {breadCrumb3 &&
                                    <Typography sx={{ color: '#757874', fontWeight: '600' }}><span className='mb-1'>{breadCrumb3}</span> </Typography>
                                }
                            </Breadcrumbs>

                        </Typography>
                        }
                        {/* <IconButton>
                            <BellIcon />
                        </IconButton>
                        <IconButton>
                            <NotificationIcon />
                        </IconButton> */}
                        <IconButton>
                            <CustomAvatar {...stringAvatar(userDetails?.name)} />

                        </IconButton>
                    </Toolbar>
                </AppBar>
            </Box>
        </Box>
    )
}