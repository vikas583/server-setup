import { Breadcrumbs, Typography, Button, Box, TableContainer, Avatar, IconButton, Paper, Table, TableBody, TableCell, TableHead, TableRow, Grid2, TablePagination, Tooltip, Checkbox, Alert, AlertTitle, ThemeProvider } from "@mui/material";
import { Link, useNavigate, useParams } from "react-router-dom";
import { GreaterThenIcon } from "../../../../assets/icons/greaterThenIcon";
import { Colors } from "../../../../common/colors";
import { CircleRightIcon } from "../../../../assets/icons/circleRightIcon";

import { useEffect, useState } from "react";
import PaginationComponent from "../../../../common/pagination";
import { Settings } from "../../../../assets/icons/dashboardIcons";

import { SearchIcon } from "../../../../assets/icons/searchIocn";
import { AddIcon } from "../../../../assets/icons/addIcon";
import { DeleteIcon } from "../../../../assets/icons/deleteIcon";

import { FileIcon } from "../../../../assets/icons/fileIcon";
import DeletePopup from "../../../../common/delete-popup/delete-popup";
import CustomizeScope from "../../dialogs/scope/customize-scope";
import ProjectDetailsSettings from './detail-settings';
import Header from "../../../../common/header";
import { useLoading } from "../../../../common/loader/loader-context";
import projectService from "../../../../services/projectService";
import { AuditStatus, DocumentListingResponse, DocumentStatus, ProjectDetailsResponse, projectScopeBodyData } from "../../../../types";
import { VisuallyHiddenInput } from "../../all-files/allFiles.style";
import { showGlobalSnackbar } from "../../../../common/snackbarProvider";
import moment from "moment";
import { PencilIcon } from "../../../../assets/icons/pencilIcon";
import { Settings2Icons } from "../../../../assets/icons/2SettingsIcon";
import documentService from "../../../../services/documentService";
import { ArchiveIcon } from "../../../../assets/icons/archiveIcon";
import { stringAvatar, truncateString } from "../../../../utils/stringAvatar";
import StatusTypography from "../../../../common/status-message/status-message";
import CloseIcon from '@mui/icons-material/Close';
import auditService from "../../../../services/auditService";
import { CustomAvatar, CustomPrimaryButton, CustomSecondaryButton, CustomTertiaryButton, MuiTableRow, useRowSelection } from "../../../../common/common.style";
import { ThreeStarIcon } from "../../../../assets/icons/threestartsIcon";
import { CircleInfoIcon, CircleInfoIconBG } from "../../../../assets/icons/circleInfoIcon";
interface AuditSelection {
    auditId: number;
    documentId: number;
    status: string
}

export default function ProjectDetails() {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteDialogData, setDeleteDialogData] = useState<any>(); // State to pass data to the dialog
    const [deleteReceivedData, setDeleteReceivedData] = useState<string>('');

    const [isScopeDialogOpen, setScopeDialogOpen] = useState(false);
    const [scopeDialogData, setScopeDialogData] = useState<any>(); // State to pass data to the dialog
    const [scopeReceivedData, setScopeReceivedData] = useState<string>('');

    const [isSettingsDialogOpen, setSettingsDialogOpen] = useState(false);
    const [settingsDialogData, setSettingsDialogData] = useState<Number | undefined>(); // State to pass data to the dialog
    const [settingsReceivedData, setSettingsReceivedData] = useState<string>('');
    const [projectDetails, setProjectDetails] = useState<ProjectDetailsResponse>();
    const [documentListing, setDocumentListing] = useState<DocumentListingResponse[]>([]);
    const [uploadDocList, setUploadDocList] = useState<any>([]);
    const [documentArray, setDocumentArray] = useState<AuditSelection[]>([]);
    const [uploadCount, setUploadCount] = useState<number>(0);
    const [uploadError, setUploadError] = useState<string>('');
    const [uploadWarning, setUploadWarning] = useState<boolean>(true);
    const [allowMultiple, setAllowMultiple] = useState<boolean>(false);
    const { setLoading } = useLoading();
    const navigate = useNavigate();
    const { selectedRow, handleRowClick } = useRowSelection(); // Use the hook

    let { id } = useParams();
    id = atob(id || '')

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {

        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    const openDialogBox = () => {
        // return <DeletePopup open={true}/>
    }
    const handleDeleteCloseDialog = () => {
        setDeleteDialogOpen(false);
    };
    const handleDeleteDialogData = (data: any) => {
        if (data) {
            setDocumentArray([])
            setScopeDialogOpen(false);
            getProjectDetails()
        }
    }
    const handleScopeCloseDialog = () => {
        setScopeDialogOpen(false);
    };
    const handleScopeDialogData = async (data: any) => {
        const obj: projectScopeBodyData = {
            projectRegulationId: projectDetails?.data.projectRegulationId,
            projectId: projectDetails?.data.id,
            regulationDetailsAdded: data.regulationDetailsAdded,
            regulationDetailsDeleted: data.regulationDetailsDeleted
        }
        try {
            setLoading(true)
            const resp = await projectService.projectScopeUpdate(obj)
            if (resp?.status) {
                showGlobalSnackbar(resp.msg, 'success')
                await getProjectDetails()
                handleScopeCloseDialog()
            }
            setLoading(false)
        } catch (error) {
            showGlobalSnackbar('Something went wrong', 'error')
            setLoading(false)
        }



    }
    const handleSettingsCloseDialog = () => {
        setSettingsDialogOpen(false);
    };

    const handleSettingsDialogData = (data: boolean) => {
        if (data === true) {
            getProjectDetails()
        }
    }
    useEffect(() => {
        localStorage.removeItem('projDetId')
        getProjectDetails()
    }, [])
    const getProjectDetails = async () => {
        try {
            setLoading(true)
            const response = await projectService.projectDetails(Number(id))

            if (response?.status) {
                response.data.records = []

                setProjectDetails(response)
                getDocumentListing();
            } else {
                showGlobalSnackbar('Something went wrong', 'error')
            }
            setLoading(false)

        } catch (error) {
            setLoading(false)
            showGlobalSnackbar('Something went wrong', 'error')
        }
    }
    const getDocumentListing = async () => {
        try {
            setLoading(true)

            const response = await documentService.documentListing(Number(id))
            if (response?.status) {
                setUploadCount(response.data?.length)
                response.data.records = []

                setDocumentListing(response.data)



            }
            setLoading(false)

        } catch (error) {
            setLoading(false)
            showGlobalSnackbar('Something went wrong', 'error')
        }
    }
    useEffect(() => {
        let interval: number | null = null
        const hasProcessingStatus = documentListing?.some((obj: any) => obj?.documentStatus === DocumentStatus.PROCESSING);
        if (hasProcessingStatus) {
            interval = setInterval(async () => {
                try {
                    const resp = await documentService.documentListing(Number(id))
                    if (documentListing?.some((obj: any) => obj?.status === DocumentStatus.PROCESSING)) {
                        if (interval) {
                            clearInterval(interval)
                        }
                    }

                    setDocumentListing(resp?.data)
                } catch (error) {
                    console.log(error)
                }
            }, 10 * 1000)
            return () => {
                if (interval) {
                    clearInterval(interval)
                }
            }
        }
    }, [documentListing])
    const submitUpload = async (data: any) => {
        if (uploadCount + data.length > 5) {
            setUploadError('Document upload capacity has been reached, please upgrade your subscription for higher capacity')
            return
        }
        setLoading(true)

        const formData: any = new FormData();

        for (let i = 0; i < data.length; i++) {

            formData.append('files', data[i]);

        }
        formData.append('projectId', id);
        try {

            const response = await documentService.uploadDocuments(formData)
            if (response?.status) {
                if (projectDetails?.data?.documentsCount && Number(projectDetails?.data?.documentsCount) <= 0) {
                    await getProjectDetails()
                } else {
                    await getDocumentListing()
                }
            }
            setLoading(false)
        } catch (error) {
            setLoading(false)
            showGlobalSnackbar('Something went wrong', 'error')
        }
    }

    const UploadFileSharp = async (evt: any) => {

        if (evt?.target.files.length > 10) {
            showGlobalSnackbar('You can upload a maximum of 10 files.', 'warning')
            return;
        }

        for (let file of evt?.target.files) {
            if (file.size > 20000000) {
                showGlobalSnackbar('Each file must be less than 20 MB.', 'warning')
                return;
            }
        }
        setUploadDocList(evt?.target.files)
        setTimeout(() => {
            submitUpload(evt?.target.files)

        }, 1000);
    }
    const openSettingPopup = () => {
        setSettingsDialogOpen(true);
        setSettingsDialogData(projectDetails?.data.id || undefined)
    }
    const openScopeDialogBox = async () => {
        setScopeDialogOpen(true);
        try {
            const data = await projectService.listRegulationDetails(Number(projectDetails?.data?.regulationId));
            if (data.status) {
                setScopeDialogData(data.data.regulationDetails);
            }
        }
        catch (err) {
            console.error("Error fetching regulation details:", err);
        }
        // setScopeDialogData()
    }
    const handleToggle = (event: React.ChangeEvent<HTMLInputElement>, documentId: number, auditId: number, status: string) => {

        // Single selection logic
        if (event.target.checked) {
            if (documentArray.length === 1) {
                // If already selected, show error
                showGlobalSnackbar('You can select only one document at a time.', 'error');
                return
            }
            // Selecting a new checkbox
            setDocumentArray([{ documentId: documentId, auditId: auditId, status: status }]);
            setDeleteDialogData([{ documentId: documentId, projectId: id, status: status }]);

        } else {
            setDocumentArray([])
        }


        // else {
        //     // Multiple selection logic
        //     const isSelected = documentArray.some(sel => sel.documentId === documentId);
        //     if (isSelected) {
        //         // Unselecting the checkbox
        //         setDocumentArray(documentArray.filter(sel => sel.documentId !== documentId));
        //     } else {
        //         // Selecting the checkbox
        //         setDocumentArray([...documentArray, { documentId: documentId, auditId: auditId }]);
        //     }
        //     // setError(null); // Clear error for multiple selection
        // }


    }
    const startAudit = async () => {
        if (documentArray[0]?.status !== DocumentStatus.FINISHED) {
            showGlobalSnackbar('Document not ready for audit', 'error');
            return
        }
        const obj = {
            documentId: documentArray[0]?.documentId,
            auditId: documentArray[0]?.auditId,
        }
        try {
            setLoading(true)
            const resp = await auditService.auditStart(obj)
            if (resp?.status) {
                showGlobalSnackbar(resp?.msg, 'success');   
                localStorage.setItem('projDetId', btoa(id))
                             
                navigate('/audit-details/' + btoa(documentArray[0]?.documentId.toString()))
                ///audit-details/

            }
            setLoading(false)
        } catch (error) {
            setLoading(false)
        }

    }
    const gotoAuditDetails = (auditStatus: string, docId: string) => {
        if (auditStatus === AuditStatus.AUDIT_GENERATED || auditStatus === AuditStatus.ERROR || auditStatus === AuditStatus.QUEUED || auditStatus === AuditStatus.PROCESSING) {
            localStorage.setItem('projDetId', btoa(id))
            navigate('/audit-details/' + btoa(docId))
        } else {
            showGlobalSnackbar('Audit not started', 'warning');
        }
    }
    return (
        <>
            <Header title={projectDetails?.data?.projectName} breadCrumb1={projectDetails?.data?.isArchive ? 'Archive' : 'All Projects'} breadCrumb2={{ name: 'Project Details', link: `/project/details/${id}` }} />
            <Box ml={3} mx={6}>

                <Grid2 container spacing={3}>
                    <Grid2 size={12}>
                        {uploadError &&
                            <div className="my-4">
                                <Alert
                                    severity="error"
                                    icon={<CircleInfoIconBG />}
                                    sx={{
                                        backgroundColor: `${Colors.redLightest}!important`,
                                        borderRadius: "4px",
                                        display: "flex",
                                        alignItems: "center",
                                        py: 0,
                                        px: '12px'
                                    }}
                                    action={
                                        <IconButton
                                            size="small"
                                            aria-label="close"
                                            color="inherit"
                                            onClick={() => setUploadError('')}
                                        >
                                            <CloseIcon fontSize="small" />

                                        </IconButton>
                                    }
                                >
                                    <Typography sx={{ fontWeight: 600 }}>Document upload capacity</Typography>
                                    {uploadError}
                                </Alert>
                            </div>
                        }
                        {uploadWarning &&
                            <div className="my-4">
                                <Alert
                                    severity="error"
                                    icon={<CircleInfoIcon fill={Colors.NightBlue600} />}
                                    sx={{
                                        backgroundColor: `${Colors.NightBlue200}!important`,
                                        color: Colors.NightBlue950,
                                        borderRadius: "4px",
                                        display: "flex",
                                        alignItems: "center",
                                        py: 0,
                                        px: '12px'
                                    }}
                                    action={
                                        <IconButton
                                            size="small"
                                            aria-label="close"
                                            color="inherit"
                                            onClick={() => setUploadWarning(false)}
                                        >
                                            <CloseIcon fontSize="small" />

                                        </IconButton>
                                    }
                                >
                                    <Typography sx={{ fontWeight: 600 }}>Document upload capacity</Typography>
                                    To optimize result accuracy, only 5 files can be uploaded and only the first 30 pages will be processed.
                                </Alert>
                            </div>
                        }
                        <div className="flex justify-between items-center my-5">
                            <div className="">
                                <div className="flex items-center">

                                    <Typography sx={{ fontSize: '26px', fontWeight: 700 }} >ISO27001</Typography>
                                    {projectDetails?.data?.isArchive &&
                                        <div className="ms-2"><Typography sx={{ background: Colors.redLightest, color: Colors.cosmicRed700, borderColor: Colors.redBorder, fontWeight: 600 }} className='px-2 rounded-xl border justify-center flex items-center'><div><ArchiveIcon fill={Colors.cosmicRed700} /> </div><div className="ms-2">
                                            Archived</div></Typography></div>
                                    }

                                </div>
                                <Typography >Information Security Management System </Typography>

                            </div>
                            {!projectDetails?.data?.isArchive &&
                                <div className="">
                                    <CustomTertiaryButton ><Settings /> <span className="ms-2" onClick={() => openSettingPopup()}>Settings</span></CustomTertiaryButton>
                                    <CustomSecondaryButton

                                        sx={{ marginLeft: '16px' }}
                                        size="small"
                                        disableRipple
                                        className='flex m-2 p-2 rounded'
                                        onClick={() => openScopeDialogBox()}
                                    >

                                        Edit Scope
                                    </CustomSecondaryButton>
                                    <CustomPrimaryButton

                                        sx={{ marginLeft: '16px' }}
                                        size="small"
                                        disableRipple
                                        className='flex m-2 p-2'
                                        disabled={documentArray.length !== 1}
                                        onClick={() => startAudit()}
                                    >
                                        <ThreeStarIcon fill="white" />

                                        <span className="ms-2">Start Audit</span>
                                    </CustomPrimaryButton>

                                </div>
                            }

                        </div>
                        {/* feature use */}
                        {/* <Box sx={{ flexGrow: 1 }}>
                        <Grid container spacing={3} my={5}>
                            <Grid size={4}> 
                                <Box className="rounded-md shadow shadow-[#7d848f] p-4" sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <Box sx={{ flex: '1 1 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="h6" fontWeight={600}>Identified Issues</Typography>
                                        <Button
                                            sx={{ color: 'black', background: '#f0f0f0', fontWeight: 600, fontSize: '14px', marginLeft: '16px' }}
                                            size="small"
                                            disableRipple
                                            className='flex m-2 p-2 rounded'>
                                            View Results
                                        </Button>
                                    </Box>
                                    <Box sx={{ flex: '1 1 auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <svg width="420" height="203" viewBox="0 0 420 203" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M131.5 99.5002L169.408 173.899C155.091 181.194 138.974 184.203 122.989 182.565C107.005 180.927 91.8323 174.713 79.2922 164.666C66.7521 154.62 57.3771 141.168 52.2919 125.926C47.2067 110.684 46.6273 94.2979 50.6233 78.7346L131.5 99.5002Z" fill="#DDC576" />
                                            <path d="M131.501 99.5002L50.624 78.7346C53.5707 67.2579 58.9263 56.5398 66.3348 47.2925C73.7432 38.0452 83.035 30.4805 93.5925 25.1012L131.501 99.5002Z" fill="#507D8E" />
                                            <path d="M131.499 99.4999L93.5911 25.101C106.321 18.6149 120.502 15.5035 134.777 16.0644C149.053 16.6253 162.946 20.8397 175.128 28.3045C187.309 35.7694 197.372 46.2349 204.353 58.7001C211.333 71.1653 214.999 85.2131 214.999 99.4999H131.499Z" fill="#65BAB2" />
                                            <path d="M131.5 99.5H215C215 114.899 210.742 129.999 202.695 143.129C194.649 156.259 183.129 166.908 169.408 173.899L131.5 99.5Z" fill="#DDC576" />
                                            <path d="M131.5 140.607C154.558 140.607 173.25 121.915 173.25 98.8574C173.25 75.7995 154.558 57.1074 131.5 57.1074C108.442 57.1074 89.75 75.7995 89.75 98.8574C89.75 121.915 108.442 140.607 131.5 140.607Z" fill="white" />
                                            <g filter="url(#filter0_d_4568_11303)">
                                                <path d="M260 61.5H246C244.343 61.5 243 62.8431 243 64.5V78.5C243 80.1569 244.343 81.5 246 81.5H260C261.657 81.5 263 80.1569 263 78.5V64.5C263 62.8431 261.657 61.5 260 61.5Z" fill="#DDC576" />
                                            </g>
                                            <path d="M269.19 76.5V66.812H271.136L273.88 75.002L276.624 66.812H278.57V76.5H277.492V67.96H277.296L274.482 76.15H273.278L270.464 67.96H270.268V76.5H269.19ZM280.766 76.5V69.5H281.816V76.5H280.766ZM280.766 67.918V66.7H281.816V67.918H280.766ZM284.878 76.5H283.828V69.5H284.864V69.99C285.62 69.57 286.344 69.36 287.034 69.36C287.968 69.36 288.593 69.612 288.91 70.116C289.237 70.62 289.4 71.516 289.4 72.804V76.5H288.364V72.832C288.364 71.8613 288.266 71.1987 288.07 70.844C287.884 70.48 287.478 70.298 286.852 70.298C286.554 70.298 286.236 70.3447 285.9 70.438C285.574 70.522 285.322 70.606 285.144 70.69L284.878 70.816V76.5ZM291.04 72.986C291.04 71.7073 291.269 70.7833 291.726 70.214C292.183 69.6447 292.953 69.36 294.036 69.36C295.128 69.36 295.898 69.6447 296.346 70.214C296.803 70.7833 297.032 71.7073 297.032 72.986C297.032 74.2647 296.817 75.1933 296.388 75.772C295.959 76.3507 295.175 76.64 294.036 76.64C292.897 76.64 292.113 76.3507 291.684 75.772C291.255 75.1933 291.04 74.2647 291.04 72.986ZM292.118 72.972C292.118 73.9893 292.239 74.7033 292.482 75.114C292.734 75.5247 293.252 75.73 294.036 75.73C294.829 75.73 295.347 75.5293 295.59 75.128C295.833 74.7173 295.954 73.9987 295.954 72.972C295.954 71.9453 295.819 71.2407 295.548 70.858C295.277 70.466 294.773 70.27 294.036 70.27C293.308 70.27 292.804 70.466 292.524 70.858C292.253 71.2407 292.118 71.9453 292.118 72.972ZM298.744 76.5V69.5H299.78V70.452C300.592 69.892 301.446 69.5233 302.342 69.346V70.41C301.95 70.4847 301.54 70.6013 301.11 70.76C300.69 70.9187 300.368 71.0587 300.144 71.18L299.794 71.362V76.5H298.744ZM305.782 70.298C304.765 70.298 304.256 70.6527 304.256 71.362C304.256 71.6887 304.373 71.922 304.606 72.062C304.84 72.1927 305.372 72.3327 306.202 72.482C307.033 72.622 307.621 72.8227 307.966 73.084C308.312 73.3453 308.484 73.8353 308.484 74.554C308.484 75.2727 308.251 75.8 307.784 76.136C307.327 76.472 306.655 76.64 305.768 76.64C305.19 76.64 304.508 76.5747 303.724 76.444L303.304 76.374L303.36 75.464C304.424 75.6227 305.227 75.702 305.768 75.702C306.31 75.702 306.72 75.618 307 75.45C307.29 75.2727 307.434 74.9833 307.434 74.582C307.434 74.1713 307.313 73.896 307.07 73.756C306.828 73.6067 306.296 73.4667 305.474 73.336C304.653 73.2053 304.07 73.014 303.724 72.762C303.379 72.51 303.206 72.0433 303.206 71.362C303.206 70.6807 303.444 70.1767 303.92 69.85C304.406 69.5233 305.008 69.36 305.726 69.36C306.296 69.36 307.01 69.4253 307.868 69.556L308.26 69.626L308.232 70.522C307.196 70.3727 306.38 70.298 305.782 70.298ZM314.33 78.25C313.359 76.066 312.874 74.078 312.874 72.286C312.874 71.39 312.995 70.4193 313.238 69.374C313.481 68.3193 313.723 67.4933 313.966 66.896L314.33 66H315.338C315.011 66.8587 314.708 67.9227 314.428 69.192C314.148 70.452 314.008 71.4833 314.008 72.286C314.008 73.0793 314.12 73.9753 314.344 74.974C314.568 75.9633 314.792 76.7567 315.016 77.354L315.338 78.25H314.33ZM320.892 76.5V74.694H316.412V73.854L319.044 67.26H320.22L317.546 73.742H320.892V70.858H321.97V73.742H323.146V74.694H321.97V76.5H320.892ZM326.514 70.466C326.616 71.1193 326.668 71.81 326.668 72.538C326.668 73.266 326.546 74.1293 326.304 75.128C326.061 76.1173 325.818 76.8827 325.576 77.424L325.212 78.25H324.204C324.521 77.5033 324.82 76.5233 325.1 75.31C325.389 74.0873 325.534 73.0793 325.534 72.286C325.534 71.4833 325.422 70.5593 325.198 69.514C324.983 68.4687 324.764 67.624 324.54 66.98L324.204 66H325.212C325.828 67.3907 326.262 68.8793 326.514 70.466Z" fill="#2E312E" />
                                            <g filter="url(#filter1_d_4568_11303)">
                                                <path d="M260 89.5H246C244.343 89.5 243 90.8431 243 92.5V106.5C243 108.157 244.343 109.5 246 109.5H260C261.657 109.5 263 108.157 263 106.5V92.5C263 90.8431 261.657 89.5 260 89.5Z" fill="#507D8E" />
                                            </g>
                                            <path d="M269.19 104.5V94.812H271.136L273.88 103.002L276.624 94.812H278.57V104.5H277.492V95.96H277.296L274.482 104.15H273.278L270.464 95.96H270.268V104.5H269.19ZM285.708 99.614V103.198C285.736 103.543 286.006 103.749 286.52 103.814L286.478 104.64C285.74 104.64 285.185 104.453 284.812 104.08C283.972 104.453 283.132 104.64 282.292 104.64C281.648 104.64 281.158 104.458 280.822 104.094C280.486 103.73 280.318 103.207 280.318 102.526C280.318 101.845 280.49 101.345 280.836 101.028C281.181 100.701 281.722 100.501 282.46 100.426L284.658 100.216V99.614C284.658 99.138 284.555 98.7973 284.35 98.592C284.144 98.3867 283.864 98.284 283.51 98.284C282.763 98.284 281.988 98.3307 281.186 98.424L280.752 98.466L280.71 97.668C281.736 97.4627 282.646 97.36 283.44 97.36C284.233 97.36 284.807 97.542 285.162 97.906C285.526 98.27 285.708 98.8393 285.708 99.614ZM281.396 102.47C281.396 103.329 281.75 103.758 282.46 103.758C283.094 103.758 283.72 103.651 284.336 103.436L284.658 103.324V101.014L282.586 101.21C282.166 101.247 281.862 101.369 281.676 101.574C281.489 101.779 281.396 102.078 281.396 102.47ZM287.793 104.318V97.5H288.829V104.332C288.829 105.191 288.675 105.835 288.367 106.264C288.059 106.693 287.439 107.146 286.505 107.622L286.085 106.81C286.813 106.39 287.28 106.031 287.485 105.732C287.691 105.443 287.793 104.971 287.793 104.318ZM287.793 95.918V94.7H288.829V95.918H287.793ZM290.534 100.986C290.534 99.7073 290.763 98.7833 291.22 98.214C291.677 97.6447 292.447 97.36 293.53 97.36C294.622 97.36 295.392 97.6447 295.84 98.214C296.297 98.7833 296.526 99.7073 296.526 100.986C296.526 102.265 296.311 103.193 295.882 103.772C295.453 104.351 294.669 104.64 293.53 104.64C292.391 104.64 291.607 104.351 291.178 103.772C290.749 103.193 290.534 102.265 290.534 100.986ZM291.612 100.972C291.612 101.989 291.733 102.703 291.976 103.114C292.228 103.525 292.746 103.73 293.53 103.73C294.323 103.73 294.841 103.529 295.084 103.128C295.327 102.717 295.448 101.999 295.448 100.972C295.448 99.9453 295.313 99.2407 295.042 98.858C294.771 98.466 294.267 98.27 293.53 98.27C292.802 98.27 292.298 98.466 292.018 98.858C291.747 99.2407 291.612 99.9453 291.612 100.972ZM298.238 104.5V97.5H299.274V98.452C300.086 97.892 300.94 97.5233 301.836 97.346V98.41C301.444 98.4847 301.034 98.6013 300.604 98.76C300.184 98.9187 299.862 99.0587 299.638 99.18L299.288 99.362V104.5H298.238ZM305.276 98.298C304.259 98.298 303.75 98.6527 303.75 99.362C303.75 99.6887 303.867 99.922 304.1 100.062C304.334 100.193 304.866 100.333 305.696 100.482C306.527 100.622 307.115 100.823 307.46 101.084C307.806 101.345 307.978 101.835 307.978 102.554C307.978 103.273 307.745 103.8 307.278 104.136C306.821 104.472 306.149 104.64 305.262 104.64C304.684 104.64 304.002 104.575 303.218 104.444L302.798 104.374L302.854 103.464C303.918 103.623 304.721 103.702 305.262 103.702C305.804 103.702 306.214 103.618 306.494 103.45C306.784 103.273 306.928 102.983 306.928 102.582C306.928 102.171 306.807 101.896 306.564 101.756C306.322 101.607 305.79 101.467 304.968 101.336C304.147 101.205 303.564 101.014 303.218 100.762C302.873 100.51 302.7 100.043 302.7 99.362C302.7 98.6807 302.938 98.1767 303.414 97.85C303.9 97.5233 304.502 97.36 305.22 97.36C305.79 97.36 306.504 97.4253 307.362 97.556L307.754 97.626L307.726 98.522C306.69 98.3727 305.874 98.298 305.276 98.298ZM313.824 106.25C312.854 104.066 312.368 102.078 312.368 100.286C312.368 99.39 312.49 98.4193 312.732 97.374C312.975 96.3193 313.218 95.4933 313.46 94.896L313.824 94H314.832C314.506 94.8587 314.202 95.9227 313.922 97.192C313.642 98.452 313.502 99.4833 313.502 100.286C313.502 101.079 313.614 101.975 313.838 102.974C314.062 103.963 314.286 104.757 314.51 105.354L314.832 106.25H313.824ZM320.792 95.26V104.5H319.714V96.464L317.334 98.032L316.844 97.22L319.784 95.26H320.792ZM326.008 98.466C326.11 99.1193 326.162 99.81 326.162 100.538C326.162 101.266 326.04 102.129 325.798 103.128C325.555 104.117 325.312 104.883 325.07 105.424L324.706 106.25H323.698C324.015 105.503 324.314 104.523 324.594 103.31C324.883 102.087 325.028 101.079 325.028 100.286C325.028 99.4833 324.916 98.5593 324.692 97.514C324.477 96.4687 324.258 95.624 324.034 94.98L323.698 94H324.706C325.322 95.3907 325.756 96.8793 326.008 98.466Z" fill="#2E312E" />
                                            <g filter="url(#filter2_d_4568_11303)">
                                                <path d="M260 117.5H246C244.343 117.5 243 118.843 243 120.5V134.5C243 136.157 244.343 137.5 246 137.5H260C261.657 137.5 263 136.157 263 134.5V120.5C263 118.843 261.657 117.5 260 117.5Z" fill="#65BAB2" />
                                            </g>
                                            <path d="M275.042 132.346C274.081 132.542 273.217 132.64 272.452 132.64C271.687 132.64 271.066 132.537 270.59 132.332C270.123 132.117 269.759 131.791 269.498 131.352C269.246 130.904 269.069 130.395 268.966 129.826C268.873 129.247 268.826 128.529 268.826 127.67C268.826 126.811 268.873 126.093 268.966 125.514C269.069 124.926 269.246 124.408 269.498 123.96C269.759 123.512 270.123 123.185 270.59 122.98C271.057 122.775 271.663 122.672 272.41 122.672C273.157 122.672 274.034 122.775 275.042 122.98L275 123.89C274.057 123.722 273.217 123.638 272.48 123.638C271.453 123.638 270.772 123.946 270.436 124.562C270.109 125.169 269.946 126.209 269.946 127.684C269.946 128.421 269.974 129.014 270.03 129.462C270.095 129.91 270.217 130.316 270.394 130.68C270.571 131.035 270.828 131.291 271.164 131.45C271.509 131.599 272.009 131.674 272.662 131.674C273.325 131.674 274.104 131.59 275 131.422L275.042 132.346ZM275.951 132.5L278.611 122.812H280.963L283.623 132.5H282.559L281.859 130.008H277.715L277.015 132.5H275.951ZM279.423 123.736L277.953 129.042H281.621L280.151 123.736H279.423ZM288.687 129.238H286.223V132.5H285.145V122.812H288.687C289.742 122.812 290.521 123.069 291.025 123.582C291.529 124.095 291.781 124.879 291.781 125.934C291.781 128.137 290.75 129.238 288.687 129.238ZM286.223 128.286H288.673C290.008 128.286 290.675 127.502 290.675 125.934C290.675 125.187 290.516 124.641 290.199 124.296C289.882 123.941 289.373 123.764 288.673 123.764H286.223V128.286ZM292.152 132.5L294.812 122.812H297.164L299.824 132.5H298.76L298.06 130.008H293.916L293.216 132.5H292.152ZM295.624 123.736L294.154 129.042H297.822L296.352 123.736H295.624ZM305.402 134.25C304.432 132.066 303.946 130.078 303.946 128.286C303.946 127.39 304.068 126.419 304.31 125.374C304.553 124.319 304.796 123.493 305.038 122.896L305.402 122H306.41C306.084 122.859 305.78 123.923 305.5 125.192C305.22 126.452 305.08 127.483 305.08 128.286C305.08 129.079 305.192 129.975 305.416 130.974C305.64 131.963 305.864 132.757 306.088 133.354L306.41 134.25H305.402ZM313.798 132.5H307.89V131.59L310.592 128.748C311.058 128.263 311.399 127.894 311.614 127.642C311.828 127.39 312.02 127.091 312.188 126.746C312.365 126.401 312.454 126.055 312.454 125.71C312.454 125.113 312.29 124.693 311.964 124.45C311.637 124.207 311.128 124.086 310.438 124.086C309.831 124.086 309.154 124.165 308.408 124.324L308.044 124.394L307.96 123.498C308.846 123.246 309.761 123.12 310.704 123.12C311.646 123.12 312.356 123.321 312.832 123.722C313.317 124.114 313.56 124.739 313.56 125.598C313.56 126.251 313.415 126.821 313.126 127.306C312.836 127.791 312.337 128.375 311.628 129.056L309.164 131.562H313.798V132.5ZM317.586 126.466C317.688 127.119 317.74 127.81 317.74 128.538C317.74 129.266 317.618 130.129 317.376 131.128C317.133 132.117 316.89 132.883 316.648 133.424L316.284 134.25H315.276C315.593 133.503 315.892 132.523 316.172 131.31C316.461 130.087 316.606 129.079 316.606 128.286C316.606 127.483 316.494 126.559 316.27 125.514C316.055 124.469 315.836 123.624 315.612 122.98L315.276 122H316.284C316.9 123.391 317.334 124.879 317.586 126.466Z" fill="#2E312E" />
                                            <defs>
                                                <filter id="filter0_d_4568_11303" x="239" y="57.5" width="28" height="28" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                                    <feOffset />
                                                    <feGaussianBlur stdDeviation="2" />
                                                    <feComposite in2="hardAlpha" operator="out" />
                                                    <feColorMatrix type="matrix" values="0 0 0 0 0.666667 0 0 0 0 0.67451 0 0 0 0 0.654902 0 0 0 0.5 0" />
                                                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_4568_11303" />
                                                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_4568_11303" result="shape" />
                                                </filter>
                                                <filter id="filter1_d_4568_11303" x="239" y="85.5" width="28" height="28" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                                    <feOffset />
                                                    <feGaussianBlur stdDeviation="2" />
                                                    <feComposite in2="hardAlpha" operator="out" />
                                                    <feColorMatrix type="matrix" values="0 0 0 0 0.666667 0 0 0 0 0.67451 0 0 0 0 0.654902 0 0 0 0.5 0" />
                                                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_4568_11303" />
                                                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_4568_11303" result="shape" />
                                                </filter>
                                                <filter id="filter2_d_4568_11303" x="239" y="113.5" width="28" height="28" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                                    <feOffset />
                                                    <feGaussianBlur stdDeviation="2" />
                                                    <feComposite in2="hardAlpha" operator="out" />
                                                    <feColorMatrix type="matrix" values="0 0 0 0 0.666667 0 0 0 0 0.67451 0 0 0 0 0.654902 0 0 0 0.5 0" />
                                                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_4568_11303" />
                                                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_4568_11303" result="shape" />
                                                </filter>
                                            </defs>
                                        </svg>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid size={8}> 
                                <Box className="rounded-md shadow shadow-[#7d848f] p-4" sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <Box sx={{ flex: '1 1 auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <div>MORE CONTENT TO BE ADDED POST MVP</div>
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box> */}
                        <div className='rounded-md shadow shadow-[#7d848f]'>
                            <div className="flex justify-between p-1">
                                <p className='p-2 text-md ps-4 font-semibold'>Files</p>
                                <div className='flex items-center'>
                                    {/* <SearchIcon /> */}
                                    {/* <div className='ms-2'>
                                        <select className='bg-[#f0f1ec] rounded-md p-1'>
                                            <option>QuickFilter</option>
                                            <option>2024 Q2</option>
                                            <option>2024 Q3</option>
                                        </select>
                                    </div> */}
                                    {!projectDetails?.data?.isArchive &&

                                        <>
                                            <div className="ms-2">
                                                <Button
                                                    component="label"
                                                    role={undefined}
                                                    disableRipple
                                                    tabIndex={-1}
                                                    startIcon={<AddIcon fill="black" />}
                                                    sx={{ fontWeight: 600, fontSize: '14px', color: 'black', background: Colors.grey, }}
                                                >
                                                    Upload
                                                    <VisuallyHiddenInput
                                                        type="file"
                                                        onChange={(event) => UploadFileSharp(event)}
                                                        multiple
                                                        accept=".pdf"
                                                    />
                                                </Button>

                                            </div>
                                            <div className="mx-2">
                                                <IconButton onClick={() => setDeleteDialogOpen(true)}>
                                                    <DeleteIcon />

                                                </IconButton>
                                            </div>

                                        </>
                                    }
                                </div>

                            </div>


                            <ThemeProvider theme={MuiTableRow}>
                                <TableContainer component={Paper}>
                                    {(projectDetails?.data?.documentsCount && Number(projectDetails?.data?.documentsCount) > 0) ?
                                        <Table sx={{ minWidth: 650 }} aria-label="simple table" size="small">
                                            <TableHead className='bg-[#f0f1ec]'>

                                                <TableRow>
                                                    {!projectDetails?.data?.isArchive &&
                                                        <TableCell padding="checkbox">
                                                            <Checkbox
                                                                color="primary"
                                                            // checked={isItemSelected}

                                                            />
                                                        </TableCell>
                                                    }
                                                    <TableCell><span className="font-semibold">Document Name</span></TableCell>
                                                    <TableCell><span className="font-semibold">File Size</span></TableCell>
                                                    <TableCell><span className="font-semibold">Uploaded On</span></TableCell>
                                                    <TableCell><span className="font-semibold">Uploaded By</span></TableCell>
                                                    <TableCell><span className="font-semibold">Status</span></TableCell>
                                                </TableRow>
                                            </TableHead>

                                            <TableBody>
                                                {documentListing.length > 0 &&
                                                    <>

                                                        {documentListing?.map((row: any, index: number) => (
                                                            <TableRow
                                                                key={row.id}
                                                                selected={index === selectedRow}
                                                                sx={{ cursor: 'pointer' }}
                                                            >
                                                                {!projectDetails?.data?.isArchive &&
                                                                    <TableCell padding="checkbox">
                                                                        <Checkbox
                                                                            color="primary"
                                                                            inputProps={{
                                                                                'aria-labelledby': row.fat,
                                                                            }}
                                                                            onChange={(event) => handleToggle(event, row?.id, row?.auditId, row?.documentStatus)}
                                                                            checked={documentArray.some(sel => sel.documentId === row.id)}
                                                                        />
                                                                    </TableCell>
                                                                }
                                                                <TableCell onClick={() => { handleRowClick(index); gotoAuditDetails(row?.status, row.id) }} ><Tooltip title={row.name}><span>{row.name}</span></Tooltip></TableCell>
                                                                <TableCell onClick={() => { handleRowClick(index); gotoAuditDetails(row?.status, row.id) }} >{(Number(row.docSize) / 1000).toFixed(2)} MB</TableCell>
                                                                <TableCell onClick={() => { handleRowClick(index); gotoAuditDetails(row?.status, row.id) }} >{moment(row.createdAt).format('ll')}</TableCell>
                                                                <TableCell onClick={() => { handleRowClick(index); gotoAuditDetails(row?.status, row.id) }} ><Tooltip title={row.uploadedBy}>
                                                                    <CustomAvatar {...stringAvatar(row?.uploadedBy)} />
                                                                </Tooltip></TableCell>
                                                                <TableCell onClick={() => { handleRowClick(index); gotoAuditDetails(row?.status, row.id) }} >
                                                                    {row.documentStatus === DocumentStatus.PROCESSING ?
                                                                        <StatusTypography status='Preparing for Audit' /> :
                                                                        (row.documentStatus === DocumentStatus.FINISHED && row.status === AuditStatus.NOT_STARTED) ?
                                                                            <StatusTypography status='Ready for Audit' /> :
                                                                            <StatusTypography status={row.status} />
                                                                    }

                                                                </TableCell>

                                                            </TableRow>
                                                        ))}
                                                    </>
                                                }
                                            </TableBody>
                                        </Table>

                                        :
                                        <Box sx={{
                                            // width: '100%',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            height: '300px'


                                        }}>
                                            <div className="text-center">
                                                {!projectDetails?.data?.isArchive ?
                                                    <>
                                                        <div className="flex justify-center mb-3">

                                                            <Typography><FileIcon /></Typography>
                                                        </div>
                                                        <Typography variant="h6" mb={2} fontWeight={700}>Upload files you would like to include in this audit.</Typography>
                                                        <Button
                                                            component="label"
                                                            role={undefined}
                                                            disableRipple
                                                            tabIndex={-1}
                                                            startIcon={<AddIcon fill="white" />}
                                                            sx={{ background: Colors.tertiary, fontWeight: 600, fontSize: '14px', color: 'white' }}
                                                        >
                                                            Upload
                                                            <VisuallyHiddenInput
                                                                type="file"
                                                                onChange={(event) => UploadFileSharp(event)}
                                                                multiple
                                                                accept=".pdf"
                                                            />
                                                        </Button>
                                                    </>
                                                    :
                                                    <div>
                                                        No file uploaded
                                                    </div>
                                                }
                                            </div>

                                        </Box>
                                    }



                                    <div className="flex items-center justify-between border">
                                        <p className='p-2 text-xs py-3 ps-4 text-[#757874] italic text-left'>Last updated: just now</p>
                                        <TablePagination
                                            component="div"
                                            count={0}
                                            page={page}
                                            onPageChange={handleChangePage}
                                            rowsPerPage={rowsPerPage}
                                            onRowsPerPageChange={handleChangeRowsPerPage}
                                            rowsPerPageOptions={[5, 10, 25, 50]}
                                            ActionsComponent={(props) => <PaginationComponent {...props} />}
                                            labelRowsPerPage="Items per page:"
                                            slotProps={{
                                                select: {
                                                    inputProps: {
                                                        'aria-label': 'rows per page',
                                                    },
                                                    native: true,
                                                },
                                            }}
                                        />

                                    </div>

                                </TableContainer>
                            </ThemeProvider>
                            {/* <p className='p-2 text-xs py-3 ps-4 text-[#757874] italic'>Last updated: just now</p> */}

                        </div >
                    </Grid2>

                </Grid2>
                {/* <DetailsRatingComponent /> */}
                <DeletePopup open={isDeleteDialogOpen}
                    onClose={handleDeleteCloseDialog}
                    onReceiveData={handleDeleteDialogData}
                    dialogData={deleteDialogData}
                />
                <CustomizeScope open={isScopeDialogOpen}
                    onClose={handleScopeCloseDialog}
                    onReceiveData={handleScopeDialogData}
                    dialogData={scopeDialogData}
                    optionalArgs={projectDetails?.data.projectRegulationDetails}
                    isAddOrEdit={'edit'}
                    scopeName={projectDetails?.data?.regulationName}
                />
                <ProjectDetailsSettings open={isSettingsDialogOpen}
                    onClose={handleSettingsCloseDialog}
                    onReceiveData={handleSettingsDialogData}
                    dialogData={settingsDialogData}
                />

            </Box>
        </>
    )
}
