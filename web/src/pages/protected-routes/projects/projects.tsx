import { Breadcrumbs, Button, IconButton, TablePagination, ThemeProvider, Tooltip, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { BoxDiv } from "./project.style";
import { AddIcon } from "../../../assets/icons/addIcon";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { GreaterThenIcon } from "../../../assets/icons/greaterThenIcon";
import { Link, useNavigate } from 'react-router-dom';
import { Colors } from "../../../common/colors";
import { Avatar } from '@mui/material';
import { TooltipIcon } from '../../../assets/icons/tooltipIcon';
import { SearchIcon } from '../../../assets/icons/searchIocn';
import { FilterIcon } from '../../../assets/icons/filterIcon';
import { DotsIcon } from '../../../assets/icons/dotsIcon';

import { useEffect, useState } from 'react';
import { SettingIcon } from '../../../assets/icons/settingIcon';
import PaginationComponent from '../../../common/pagination';
import projectService from "../../../services/projectService";
import  moment from 'moment';
import { useLoading } from '../../../common/loader/loader-context';
import { stringAvatar, truncateString } from '../../../utils/stringAvatar';
import { CustomAvatar, CustomPrimaryButton, CustomSecondaryButton, MuiTableRow, useRowSelection } from '../../../common/common.style';




export default function Projects() {
    const [page, setPage] = useState(0);
    const [skip, setSkip] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [projectListArray, setProjectListArray] = useState<any[]>([])
    const [totalProjectData, setTotalProjectData] = useState<number>(0)
    const { setLoading } = useLoading();
    const navigate = useNavigate();
    const { selectedRow, handleRowClick } = useRowSelection(); // Use the hook

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - totalProjectData) : 0;

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {        
        setPage(newPage);
        setSkip( newPage  * rowsPerPage )
        
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        
        setRowsPerPage(parseInt(event.target.value));
        setPage(0);
        setSkip(0)        
    };
    useEffect(() => {
        projectList()
    }, [page, rowsPerPage])
    const projectList = async () => {
        setLoading(true)
        const response = await projectService.projectListing(skip, rowsPerPage)
        if (response?.status) {
            setProjectListArray(response.data.projects)
            setTotalProjectData(response.data.total)
        }
        setLoading(false)
    }
    return (
        <>
            <div className="flex justify-between" >
                <Typography sx={{ fontSize: '26px', fontWeight: 700 }} mb={4}>All Projects</Typography>
                <div>
                    <CustomSecondaryButton disableRipple sx={{ marginRight: '8px' }} className='flex m-2 p-2 rounded items-center ' onClick={() => navigate("/settings", { state: { tab: '2' } })} >
                        <span className='me-2'> <SettingIcon fill='black' /></span>Scope Settings</CustomSecondaryButton>
                        <CustomPrimaryButton disableRipple onClick={() => navigate('/project/create')} sx={{ background: Colors.tertiary, fontWeight: 600, fontSize: '14px', color: 'white' }}> 
                        <span className="me-2"><AddIcon fill='white' />
                         </span>Create a New Project</CustomPrimaryButton>
                </div>
            </div>
            {/* <Grid container spacing={4} size="grow" >

                <Grid size={3}>
                    <BoxDiv>
                        <div className='flex justify-between w-full items-center'>
                            <Typography sx={{ fontWeight: 600 }}>Audits Completed</Typography>
                            <span><TooltipIcon /></span>
                        </div>
                        <Typography variant='h4' sx={{ fontWeight: 700 }}>10</Typography>
                    </BoxDiv>
                </Grid>
                <Grid size={3}>
                    <BoxDiv >
                        <div className='flex justify-between w-full items-center'>
                            <Typography sx={{ fontWeight: 600 }}>New Projects</Typography>
                            <span><TooltipIcon /></span>
                        </div>
                        <Typography variant='h4' sx={{ fontWeight: 700 }}>10</Typography>
                    </BoxDiv>
                </Grid>
                <Grid size={3}>
                    <BoxDiv>
                        <div className='flex justify-between w-full items-center'>
                            <Typography sx={{ fontWeight: 600 }}>New Clients</Typography>
                            <span><TooltipIcon /></span>
                        </div>
                        <Typography variant='h4' sx={{ fontWeight: 700 }}>4</Typography>
                    </BoxDiv>
                </Grid>
                <Grid size={3}>
                    <BoxDiv>
                        <div className='flex justify-between w-full items-center'>
                            <Typography sx={{ fontWeight: 600 }}>Document Processed</Typography>
                            <span><TooltipIcon /></span>
                        </div>
                        <Typography variant='h4' sx={{ fontWeight: 700 }}>120</Typography>
                    </BoxDiv>
                </Grid>
            </Grid> */}

            <div className='rounded-md shadow shadow-[#7d848f] bg-white mt-8'>
                <div className="flex justify-between">
                    <p className='p-2 text-md ps-4 font-semibold'>Projects</p>
                    {/* <div className='flex items-center'><SearchIcon />
                        <div className='ms-2'>
                            <select className='bg-[#f0f1ec] rounded-md p-1'>
                                <option>QuickFilter</option>
                                <option>2024 Q2</option>
                                <option>2024 Q3</option>
                            </select>
                        </div>
                        <div className="ms-2">
                            <FilterIcon />
                        </div>
                        <div className="ms-2">
                            <DotsIcon />
                        </div>
                    </div> */}

                </div>

                <ThemeProvider theme={MuiTableRow}>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table" size="small">
                        <TableHead className='bg-[#f0f1ec]'>
                            <TableRow>
                                <TableCell><span className="font-semibold">Project Name</span></TableCell>
                                <TableCell><span className="font-semibold">Client</span></TableCell>
                                <TableCell><span className="font-semibold">Scope</span></TableCell>
                                <TableCell><span className="font-semibold">Category</span></TableCell>
                                <TableCell><span className="font-semibold">Date Created</span></TableCell>
                                <TableCell><span className="font-semibold">Admin</span></TableCell>
                                <TableCell><span className="font-semibold"></span></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {projectListArray?.map((row, index) => (
                                <TableRow
                                    key={index + 1}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
                                    selected={index === selectedRow} // Apply global styles
                                    onClick={() => {navigate(`/project/details/${btoa(row.id)}`);  handleRowClick(index)}}
                                >
                                    <TableCell component="th" scope="row" className='break-all'>
                                        <Tooltip title={row.projectName}><span>{truncateString(row.projectName)}</span></Tooltip>
                                    </TableCell>
                                    <TableCell className='break-all'><Tooltip title={row.clientName}><span>{truncateString(row.clientName)}</span></Tooltip></TableCell>
                                    <TableCell>{(row?.regulations)?.join( ',' )}</TableCell>
                                    <TableCell>-</TableCell>
                                    <TableCell>{moment(row.createdAt).format('ll')}</TableCell>
                                    <TableCell><Tooltip title={row.createdby}>
                                        <CustomAvatar {...stringAvatar(row?.createdby)} />
                                        </Tooltip></TableCell>
                                    <TableCell><IconButton><GreaterThenIcon /></IconButton></TableCell>

                                </TableRow>
                            ))}
                        </TableBody>

                    </Table>
                    <div className="flex items-center justify-between border">
                        <p className='p-2 text-xs py-3 ps-4 text-[#757874] italic text-left'>Last updated: just now</p>
                        <TablePagination
                            component="div"
                            count={totalProjectData}
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

            </div >


           
        </>

    )
}
