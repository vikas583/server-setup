import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Button, FormControlLabel, Radio, RadioGroup, Tab, TablePagination, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Colors } from "../../../../common/colors";
import CustomButtonTabs from "./results-tabs";
import moment from "moment";
import StatusTypography from "../../../../common/status-message/status-message";
import { AuditResult, AuditStatus } from "../../../../types";
import { ProcessingIcon } from "../../../../assets/icons/processingIcon";
import { truncateString } from "../../../../utils/stringAvatar";

interface AuditSidebarProps {
    docData: any
    auditData: AuditResult
}

export default function AuditSidebar({ docData, auditData }: AuditSidebarProps) {
    const [value, setValue] = useState('1');
    const [selectedTab, setSelectedTab] = useState(0);

    const handleTabChange = (newValue: number) => {
        setSelectedTab(newValue);
    };

    const tabData = [
        { label: 'All Issues', content: <div>All Issues Content</div> },
        // { label: 'Majors', content: <div>Majors Content</div> },
        // { label: 'Minors', content: <div>Minors Content</div> },
        // { label: 'By Document', content: <div>By Document Content</div> },
    ];

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };
    return (
        <Box sx={{ width: '100%', typography: 'body1', background: Colors.lightestGrey, boxShadow: '0px 0px 4px 0px rgba(170, 172, 167, 0.40), 0px 3px 8px 0px rgba(170, 172, 167, 0.50)', height: '100%' }}>
            <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList onChange={handleChange} aria-label="lab API tabs example" className="text-bold"
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

                        }}>
                        <Tab label="Details" value="1" sx={{ width: '100%', flex: 1 }} />
                        <Tab label="Results" value="2" sx={{ width: '100%', flex: 1 }} />
                    </TabList>
                </Box>
                <TabPanel value="1">
                    <Box padding={2} borderRadius={5} sx={{ background: 'white', boxShadow: '0px 0px 4px 0px rgba(170, 172, 167, 0.40), 0px 3px 8px 0px rgba(170, 172, 167, 0.50)' }}>
                        <div className="flex justify-between">
                            <Typography variant="body1" fontWeight={600} title={docData?.name}>{truncateString(docData?.name || '', 20)}</Typography>
                            <div><StatusTypography status={auditData?.auditStatus} width="100%" /></div>
                        </div>
                        <Typography variant="subtitle2" mb={1}>{docData?.docSize}KB</Typography>
                        <hr />
                        <Typography variant="subtitle2" mt={1}>Audit Scope:</Typography>
                        <Typography variant="subtitle2" mb={1}><span className={`text-[${Colors.tertiary}]`}>{docData?.scopes[0]?.name}</span></Typography>
                        <Typography variant="subtitle2">Uploaded On:</Typography>
                        <Typography variant="subtitle2" mb={1}>{moment(docData?.createdAt).format('ll')}</Typography>
                        <Typography variant="subtitle2">Uploaded By:</Typography>
                        <Typography variant="subtitle2" mb={1}>{docData?.uploadedBy}</Typography>
                    </Box>
                </TabPanel>
                <TabPanel value="2">
                    {(docData?.auditStatus === AuditStatus.QUEUED || docData?.auditStatus === AuditStatus.PROCESSING) ?
                        <div className="mt-5 ">
                            <div className="">

                                <ProcessingIcon />
                            </div>
                            <div className="mt-3 font-semibold mb-3">
                                Audit Results Loading...
                            </div>
                            <Typography variant="body2">

                            Generating your results may take some time. Once they’re ready, the project owner will receive an email notification. In the meantime, feel free to navigate away from this page.
                            </Typography>
                        </div>
                        :
                        <div>
                            <CustomButtonTabs tabs={tabData} selectedTab={selectedTab} onTabChange={handleTabChange} auditData={auditData} />

                        </div>
                    }

                </TabPanel>
            </TabContext>
        </Box>

    )
}