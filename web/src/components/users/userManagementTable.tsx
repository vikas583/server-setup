import {
    Avatar,
    IconButton,
    Menu,
    MenuItem,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material"
import { User, UserCreateFormData, userDetailsInfo, UserRoles, UserRolesDisplayListing } from "../../types"
import { CircleInfoIcon } from "../../assets/icons/circleInfoIcon"
import { DotsIcon } from "../../assets/icons/dotsIcon"
import { Colors } from "../../common/colors"
import UserRolesPopup from "../../pages/protected-routes/settings/user-rolesPopup"
import { useState } from "react"
import { stringAvatar, truncateString } from "../../utils/stringAvatar"
import UserDetailsPopup from "../../pages/protected-routes/settings/user-details-popup"
import RemovePermissionPopup from "../../pages/protected-routes/settings/remove-permission-popup"
import { CustomAvatar } from "../../common/common.style"

const UserManagementTable: React.FC<{
    usersData: User[]
    onReload: (reload: boolean) => void;
}> = ({ usersData, onReload }) => {
    const [removePermissionDialogData, setRemovePermissionDialogData] = useState<number | undefined>();
    const [userDetailsDialogData, setUserDetailsDialogData] = useState<UserCreateFormData>();
    const [isRoleInfoDialogOpen, setRoleInfoDialogOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isRemovePermissionDialogOpen, setRemovePermissionDialogOpen] = useState(false);
    const [isUserDetailsDialogOpen, setUserDetailsDialogOpen] = useState(false);
    const [userId, setUserId] = useState<User>();

    const handleRoleInfoCloseDialog = () => {
        setRoleInfoDialogOpen(false);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleRemovePermissionCloseDialog = () => {
        onReload(true);
        setRemovePermissionDialogOpen(false)
    }
    const handleRemovePermissionDialogData = () => {
        
        setRemovePermissionDialogOpen(true)
    }
    const handleUserDetailsCloseDialog = () => {
        onReload(true);
        setUserDetailsDialogOpen(false);

    }
    const handleUserDetailsDialogData = () => {
        setUserDetailsDialogOpen(false)
        onReload(true);
    }
    const openUserDialogData = () => {

        setUserDetailsDialogOpen(true)
        setUserDetailsDialogData({
            firstName: userId?.firstName || '',
            lastName: userId?.lastName || '',
            email: userId?.email || '',
            roleId: userId?.userRole || '',
            userId: userId?.id || undefined
        })
    }
    const openUserPermissionData = () =>{
        setRemovePermissionDialogOpen(true)
        setRemovePermissionDialogData(userId?.id)
    }

    return (
        <>
            <TableContainer component={Paper} sx={{ mb: 5 }}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table" size="small">
                    <TableHead className='bg-[#f0f1ec]'>
                        <TableRow>
                            <TableCell><span className="font-semibold">User Name</span></TableCell>
                            <TableCell><span className="font-semibold">
                                <div className="flex items-center">
                                    User Role
                                    <IconButton onClick={() => setRoleInfoDialogOpen(true)} className="ms-2">
                                        <CircleInfoIcon />
                                    </IconButton>
                                </div>
                            </span>
                            </TableCell>
                            <TableCell><span className="font-semibold">Projects</span></TableCell>
                            <TableCell><span className="font-semibold"></span></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {usersData && usersData.map((user, index) => (<TableRow
                            key={index + 1}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row" ><div className="flex items-center">
                                <CustomAvatar {...stringAvatar(user.firstName + ' ' + user.lastName)}></CustomAvatar>
                                <div className="ms-2">

                                    <p>{user.firstName + ' ' + user.lastName}</p>
                                </div>
                            </div></TableCell>
                            {/* <TableCell>{row.role}</TableCell> */}
                            <TableCell>
                                <Typography
                                    sx={{ background: Colors.neutralGrey010, color: Colors.naturalGrey600, borderColor: Colors.neutralGrey500, fontWeight: 600 }}
                                    className='w-10/12 px-1 rounded-lg border justify-center flex items-center'
                                >
                                    {UserRolesDisplayListing[user.userRole]}
                                </Typography>
                            </TableCell>
                            <TableCell><span className={`text-[${Colors.tertiary}]`} title={user.projects.join(', ')}>

                                {user.projects ? truncateString(user.projects.join(', ')) : "-"}
                            </span></TableCell>
                            <TableCell>
                                <IconButton onClick={(event) => { setUserId(user); handleClick(event); }}
                                    aria-controls={open ? (user.id).toString() : undefined}
                                    aria-haspopup="true"
                                    aria-expanded={open ? 'true' : undefined}
                                    className="checkplease"
                                    id={(user.id).toString()}>
                                    <DotsIcon />
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    id={(user.id).toString()}
                                    open={open}
                                    onClose={handleClose}
                                    onClick={handleClose}
                                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                >
                                    <MenuItem onClick={() => { openUserDialogData() }}>
                                        Edit Details
                                    </MenuItem>
                                    <MenuItem onClick={() => { openUserPermissionData() }}>
                                        Remove Permissions
                                    </MenuItem>
                                </Menu>
                            </TableCell>

                        </TableRow>
                        ))}
                    </TableBody>

                </Table>
                {/* <div className="flex items-center justify-between border"> */}



                {/* </div> */}
                <p className='p-2 text-xs py-3 ps-4 text-[#757874] italic text-left'>Last updated a minute ago</p>
            </TableContainer>
            <UserRolesPopup open={isRoleInfoDialogOpen}
                onClose={handleRoleInfoCloseDialog}>
            </UserRolesPopup>
            <RemovePermissionPopup open={isRemovePermissionDialogOpen}
                onClose={handleRemovePermissionCloseDialog}
                onReceiveData={handleRemovePermissionDialogData} // Callback to get data from the dialog
                dialogData={removePermissionDialogData}
            />
            <UserDetailsPopup open={isUserDetailsDialogOpen}
                onClose={handleUserDetailsCloseDialog}
                onReceiveData={handleUserDetailsDialogData} // Callback to get data from the dialog
                dialogData={userDetailsDialogData}
                isAddOrEdit={'edit'}
            />
        </>
    )
}


export default UserManagementTable