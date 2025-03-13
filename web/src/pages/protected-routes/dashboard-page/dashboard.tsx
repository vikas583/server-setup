import { Box, Button, Grid2, IconButton, Toolbar, Tooltip, Typography } from '@mui/material';
import { BoxDiv, } from "./dashboard.style";
import { AddIcon } from "../../../assets/icons/addIcon";
import { UploadIcon } from "../../../assets/icons/uploadIcon";
import { ScopeIcon } from "../../../assets/icons/scopeIcon";
import { Link, useNavigate } from 'react-router-dom';
import { Colors } from "../../../common/colors";
import DashboardFeedbackButton from '../feedbacks/dashboard-feedback/dashboard-feedback';
import { BookIcon } from '../../../assets/icons/bookIcon';
import { PrivacyIcon } from '../../../assets/icons/privacyIcon';
import { GreaterThenIcon } from '../../../assets/icons/greaterThenIcon';
import { ShareFromSquare } from '../../../assets/icons/shareFromSquare';
import auditService from '../../../services/auditService';
import { useLoading } from '../../../common/loader/loader-context';
import { useEffect, useState } from 'react';
import StatusTypography from '../../../common/status-message/status-message';
import { truncateString } from '../../../utils/stringAvatar';
import { RecentAuditInterface, RecentAuditResponse } from '../../../types';
import { CustomPrimaryButton, CustomTertiaryButton } from '../../../common/common.style';


export default function Dashboard() {
    const { setLoading } = useLoading();
    const navigate = useNavigate();
    const [auditListingArray, setAuditListingArray] = useState<RecentAuditInterface[]>([]);

    const handleFeedbackSubmit = (feedback: { rating: number | null; text: string }) => {
    };
    const auditListing = async () => {
        setLoading(true)
        try {
            const resp: RecentAuditResponse | undefined = await auditService.recentAudits()
            setAuditListingArray(resp?.data || [])
            setLoading(false)

        } catch (error) {
            setLoading(false)

        }
    }
    useEffect(() => {
        auditListing()
    }, [])


    return (
        <>
            <Typography sx={{ fontSize: '26px', fontWeight: 700 }} color={Colors.spaceGrey800} mb={4}>Welcome back!</Typography>
            <Typography variant='h6' mb={3} color={Colors.spaceGrey800} fontWeight={600}>Get Started</Typography>
            <div className="flex items-center">
                <BoxDiv className="box-shadow-dashboard">
                    <AddIcon />
                    <Box marginLeft={1}>
                        <CustomTertiaryButton sx={{padding:0}} disableRipple onClick={() => navigate('/project/create')} >New Project</CustomTertiaryButton>
                    </Box>
                </BoxDiv>
                <BoxDiv className='mx-5 box-shadow-dashboard'>
                    <UploadIcon />
                    <Box marginLeft={1} >
                        <CustomTertiaryButton sx={{ padding: 0 }} disableRipple onClick={() => navigate('/project/create')}>Upload Files</CustomTertiaryButton>
                    </Box>
                </BoxDiv>
                <BoxDiv className="box-shadow-dashboard">
                    <ScopeIcon />
                    <Box marginLeft={1} >
                        <CustomTertiaryButton sx={{ padding: 0 }} disableRipple onClick={() => navigate("/settings", { state: { tab: '2' } })}>Scope Settings</CustomTertiaryButton>
                    </Box>
                </BoxDiv>
            </div>
            <div>
                {auditListingArray?.length > 0 &&
                    <div className="flex items-center justify-between">
                        <Typography variant='h6' mt={4} mb={3} color={Colors.spaceGrey800} fontWeight={600}>Recent Audits</Typography>
                        <CustomTertiaryButton disableRipple onClick={() => navigate('/projects')}>View All Projects</CustomTertiaryButton>
                    </div>
                }
                <Grid2 container spacing={2} >
                    {auditListingArray?.map((row: any, index: number) => (
                        <Grid2 size={4} key={row.projectName + index} className="box-shadow-dashboard">
                            <Link to={`/project/details/${btoa(row.projectId.toString())}`} style={{ textDecoration: 'none' }}>

                                <Box sx={{ boxShadow: '0px 0px 4px 0px rgba(170, 172, 167, 0.50)', borderRadius: '6px', padding: '12px 10px 12px 16px', background: 'white' }}>
                                    <StatusTypography status={row.status} />
                                    <Typography variant='h6' fontWeight={600} mt={1}><Tooltip title={row.projectName}><span>{truncateString(row.projectName)}</span></Tooltip></Typography>
                                    <Typography variant='body2' sx={{ color: Colors.garkGrey, fontSize: '12px' }}>{row.regulationName}</Typography>

                                </Box>
                            </Link>

                        </Grid2>
                    ))}

                </Grid2>
            </div>
            <div>
                <Typography variant='h6' mt={4} mb={3} color={Colors.spaceGrey800} fontWeight={600}>Explore</Typography>
                <Grid2 container spacing={4} >
                    <Grid2 size={6}>
                        <Box minHeight={214} sx={{ boxShadow: '0px 0px 4px 0px rgba(170, 172, 167, 0.50)', borderRadius: '6px', padding: '12px 16px 12px 16px', background: 'white' }}>
                            <Typography> <BookIcon /></Typography>
                            <Typography variant='h6' fontWeight={600} mt={3}>Audit Scope</Typography>
                            <Typography variant='body2'>Use audit standards in your projects to generate audit reports based on uploaded content. To use standards offered by Tiebreaker AI, you must first verify your ownership of the standard in the settings panel.</Typography>
                            <CustomTertiaryButton disableRipple sx={{ color: Colors.tertiary }}>Scope Settings <span className='ms-2'><GreaterThenIcon fill={Colors.tertiary} /></span></CustomTertiaryButton>
                        </Box>
                    </Grid2>
                    <Grid2 size={6}>
                        <Box minHeight={214} sx={{ boxShadow: '0px 0px 4px 0px rgba(170, 172, 167, 0.50)', borderRadius: '6px', padding: '12px 16px 12px 16px', background: 'white' }}>
                            <Typography> <PrivacyIcon /></Typography>
                            <Typography variant='h6' fontWeight={600} mt={3}>Compliance as an Asset</Typography>
                            <Typography variant='body2'>Tiebreaker Al commitment to security, compliance automation, and reducing cost makes their solution critical for any CISO, auditor, and compliance team.</Typography>
                            <CustomTertiaryButton
                                formTarget="_blank"
                                disableRipple
                                sx={{ color: Colors.tertiary }}
                                href='https://www.tiebreaker-ai.com/resources/compliance-as-an-asset-absolutely'
                            >
                                Learn more
                                <span className='ms-2'><ShareFromSquare fill={Colors.tertiary} /></span>
                            </CustomTertiaryButton>
                            &nbsp;
                        </Box>
                    </Grid2>
                </Grid2>
            </div>

            {/* <DashboardFeedbackButton onSubmitFeedback={handleFeedbackSubmit} /> */}
        </>

    )
}