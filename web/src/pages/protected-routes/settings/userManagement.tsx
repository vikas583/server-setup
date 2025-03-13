import { Avatar, Button, IconButton, Menu, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
// import { Link } from "react-router-dom";
import { AddIcon } from "../../../assets/icons/addIcon";
import { Colors } from "../../../common/colors";
// import { CircleRightIcon } from "../../../assets/icons/circleRightIcon";
// import { ThreeDRotation } from "@mui/icons-material";
import { DotsIcon } from "../../../assets/icons/dotsIcon";
import { CircleInfoIcon } from "../../../assets/icons/circleInfoIcon";
import { useEffect, useState } from "react";
import UserRolesPopup from "./user-rolesPopup";
import RemovePermissionPopup from "./remove-permission-popup";
import UserDetailsPopup from "./user-details-popup";
import { User } from "../../../types";
import projectService from "../../../services/projectService";
import userService from "../../../services/userService";
import { useLoading } from "../../../common/loader/loader-context";
import UserManagementTable from "../../../components/users/userManagementTable";
import { CustomPrimaryButton } from "../../../common/common.style";

export default function UserManagementSettings() {

    const [isRoleInfoDialogOpen, setRoleInfoDialogOpen] = useState(false);
    const [isUserDetailsDialogOpen, setUserDetailsDialogOpen] = useState(false);
    const [userDetailsDialogData, setUserDetailsDialogData] = useState<any>();
    const { loading, setLoading } = useLoading();
    const [users, setUsers] = useState<User[]>()






    const handleRoleInfoCloseDialog = () => {
        setRoleInfoDialogOpen(false);
    };
    const handleUserDetailsCloseDialog = () => {
        setUserDetailsDialogOpen(false);
    };
    const handleUserDetailsDialogData = (data: boolean) => {
        if (data) {
            getUserList()
        }
    }

    useEffect(() => {
        getUserList()
    }, [])


    const getUserList = async () => {
        try {

            setLoading(true)
            const response = await userService.list()
            if (response && response.status) {
                setUsers(response.data)
            }
            setLoading(false)
        } catch (err: any) {
            setLoading(false)
            // setError(error)
        }
    }
    const handleReload = (reload: boolean) => {
        getUserList()
    };

    let content: JSX.Element | null = null

    if (users) {
        content = <UserManagementTable usersData={users} onReload={handleReload} />
    } else {
        content = <div>No data found!</div>
    }


    return (
        <div>
            <div className="flex items-center justify-between">
                <Typography variant="h6" fontWeight={600}>
                    User Management
                </Typography>
                <CustomPrimaryButton disableRipple onClick={() => { setUserDetailsDialogOpen(true) }}>
                    <span className="me-2"><AddIcon fill='white' />
                    </span>
                    New User
                </CustomPrimaryButton>

            </div>
            <Typography variant="body1" mb={5} lineHeight={'21px'} width={'762px'}>As the account owner, you have access to assign users to be project owners or contributors. All new users must be assigned to a project with a role.</Typography>
            {content}
            <UserRolesPopup open={isRoleInfoDialogOpen}
                onClose={handleRoleInfoCloseDialog}>
            </UserRolesPopup>
            <UserDetailsPopup open={isUserDetailsDialogOpen}
                onClose={handleUserDetailsCloseDialog}
                onReceiveData={handleUserDetailsDialogData} // Callback to get data from the dialog
                dialogData={userDetailsDialogData}
                isAddOrEdit={'add'}
            />

        </div>
    );
}