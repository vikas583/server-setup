import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Avatar, IconButton, TablePagination, Tooltip, Breadcrumbs, Button, Typography, ThemeProvider } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { GreaterThenIcon } from "../../../assets/icons/greaterThenIcon";
import { Colors } from "../../../common/colors";
import { useEffect, useState } from "react";
import projectService from "../../../services/projectService";
import { useLoading } from "../../../common/loader/loader-context";
import PaginationComponent from "../../../common/pagination";
import moment from "moment";
import { AddIcon } from "../../../assets/icons/addIcon";
import { SettingIcon } from "../../../assets/icons/settingIcon";
import { truncateString } from "../../../utils/stringAvatar";
import { CustomAvatar, MuiTableRow, useRowSelection } from "../../../common/common.style";

export default function ArchiveProjectList() {
    const [page, setPage] = useState(0);
    const [skip, setSkip] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [projectListArray, setProjectListArray] = useState<any[]>([])
    const [totalProjectData, setTotalProjectData] = useState<number>(0)
    const { setLoading } = useLoading();
    const navigate = useNavigate();
    const { selectedRow, handleRowClick } = useRowSelection();
    useEffect(() => {
        projectList()
    }, [page, rowsPerPage])
    const projectList = async () => {
        setLoading(true)
        const response = await projectService.projectArchiveListing(skip, rowsPerPage)
        if (response?.status) {
            setProjectListArray(response.data.projects)
            setTotalProjectData(response.data.total)
        }
        setLoading(false)
    }
    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        setPage(newPage);
        setSkip(newPage * rowsPerPage)

    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {

        setRowsPerPage(parseInt(event.target.value));
        setPage(0);
        setSkip(0)
    };
    
    return (
        <>
            
            <div className="flex justify-between" >
                <Typography sx={{ fontSize: '26px', fontWeight: 700 }} mb={4}>Archive</Typography>
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
                                onClick={() => { navigate(`/project/details/${row.id}`); handleRowClick(index) }}
                            >
                                <TableCell component="th" scope="row" >
                                    <Tooltip title={row.projectName}><span>{truncateString(row.projectName)}</span></Tooltip>
                                </TableCell>
                                <TableCell>
                                    <Tooltip title={row.clientName}><span>{truncateString(row.clientName)}</span></Tooltip>
                                </TableCell>
                                <TableCell>{(row?.regulations)?.join(',')}</TableCell>
                                <TableCell>-</TableCell>
                                <TableCell>{moment(row.createdAt).format('ll')}</TableCell>
                                <TableCell><Tooltip title={row.createdby}><CustomAvatar style={{ height: '30px', width: '30px' }} alt={(row.createdby)?.toUpperCase()} src="/static/images/avatar/2.jpg" /></Tooltip></TableCell>
                                <TableCell><IconButton component={Link} to={`/project/details/${row.id}`}><GreaterThenIcon /></IconButton></TableCell>

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
        </>
    )
}