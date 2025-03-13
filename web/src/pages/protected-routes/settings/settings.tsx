import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Button, Tab } from "@mui/material";
import { useEffect, useState } from "react";
import { Colors } from "../../../common/colors";
import GeneralSettings from "./general";
import AuditScopeSettings from "./auditScope";
import UserManagementSettings from "./userManagement";
import { authService } from "../../../services";
import { useLoading } from "../../../common/loader/loader-context";
import { userDetailsInfo } from "../../../types";
import { useLocation, useNavigate } from "react-router-dom";

export default function Settings() {
    const { setLoading } = useLoading();
    const [userDetails, setUserDetails] = useState<userDetailsInfo>();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Extract the tab index from state or default to 0
    // const state = location.state as { tab?: string };

    const [value, setValue] = useState('1');
    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        // setValue(newValue);
        setValue(newValue); // Update the local state
        navigate(".", { state: { tab: newValue } });
    };
    useEffect(() => {
        userDetailsInfo()
    }, [])
    // useEffect(() => {
        
    //     if (state && state?.tab !== undefined) {
    //         console.log(state);
    //         setValue((state && state?.tab ? state?.tab : '1' ));
    //     }
    // }, [state?.tab]);
    useEffect(() => {
        const tabValue = location.state?.tab || "1"; // Fallback to "1" if no state
        setValue(tabValue);
    }, [location.state]);

    const userDetailsInfo = async () => {
        try {
            setLoading(true)
            const resp = await authService.getUserInfoDetails()
            setUserDetails(resp?.data)
            setLoading(false)
        } catch (error) {
            setLoading(false)
        }

    }
    const refreshApi = () => {
        userDetailsInfo()
    };
    return (
        <div>
            <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList onChange={handleChange} aria-label="lab API tabs example" className="text-bold"
                        variant="fullWidth"
                        sx={{

                            '& .MuiTabs-indicator': {
                                backgroundColor: Colors.tertiary,
                                height: '4px'
                            },
                            '& .MuiTab-root': {
                                color: Colors.lightGrey,
                                fontWeight: 'bold',
                            },
                            '& .MuiTab-root.Mui-selected': {
                                color: Colors.garkGrey,
                                fontWeight: 'bold',
                            },
                            padding: '0px 0px 0px 0px'

                        }}>
                        <Tab label="General" value="1" sx={{ width: '100%', flex: 1 }} />
                        {userDetails?.role === 'account_owner' && [
                            <Tab label="Audit Scope" value="2" sx={{ width: '100%', flex: 1 }} key="tab-audit" />,
                            <Tab label="User  Management" value="3" sx={{ width: '100%', flex: 1 }} key="tab-user-management" />
                        ]}
                    </TabList>
                </Box>
                {value === '1' && (

                    <TabPanel value="1">
                        <GeneralSettings userDetails={userDetails} refreshApi={refreshApi} />

                        {/* <GeneralSettings userDetails={userDetails} /> */}
                    </TabPanel>
                )}
                {userDetails?.role === 'account_owner' && [
                    <>
                    { value === '2' && (
                        <TabPanel value="2" key="tab2">
                            <AuditScopeSettings />
                        </TabPanel>
                    )}
                {value === '3' && (
                    <TabPanel value="3" key="tab3">
                        <UserManagementSettings />
                    </TabPanel>
                )}
                    </>
                ]}
            </TabContext>
        </div>
    )
}