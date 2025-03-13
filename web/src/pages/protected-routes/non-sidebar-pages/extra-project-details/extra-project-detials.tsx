import { useTheme, Theme } from "@emotion/react";
import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Avatar, IconButton, TableFooter, TablePagination, Box, Typography, Breadcrumbs, Button, Grid2, Checkbox, } from "@mui/material";
// import Grid from '@mui/material/Grid2';

import { TablePaginationActionsProps } from "@mui/material/TablePagination/TablePaginationActions";
import { useState } from "react";
import { Link } from "react-router-dom";
import { GreaterThenIcon } from "../../../../assets/icons/greaterThenIcon";
import { Colors } from "../../../../common/colors";
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import { VisuallyHiddenInput } from "../../all-files/allFiles.style";
// import { UploadIcon } from "../../../../assets/icons/uploadIcon";
// import { TooltipIcon } from "../../../../assets/icons/tooltipIcon";
import { DotsIcon } from "../../../../assets/icons/dotsIcon";
import { FilterIcon } from "../../../../assets/icons/filterIcon";
import { SearchIcon } from "../../../../assets/icons/searchIocn";
// import { BoxDiv } from "../../projects/project.style";
import DatilsSidebar from "../details-sidebar/details-sidebar";
import { DeleteIcon } from "../../../../assets/icons/deleteIcon";
import { ThreeStarIcon } from "../../../../assets/icons/threestartsIcon";
import CustomizeScope from "../../dialogs/scope/customize-scope";
import { RegulationDetails } from "../../../../types";
import { CustomAvatar, CustomPrimaryButton, CustomSecondaryButton } from "../../../../common/common.style";
function createData(
    name: string,
    calories: string,
    fat: string,
    carbs: string,
    scope: string,
    fileSize: string,
    date: string
) {
    return { name, calories, fat, carbs, scope, fileSize, date };
}

const rows = [
    createData('ABC_RiskAccessment_superlongnameeee..', 'ABC Medical Devices Ltd', 'ABC Pacemaker Compliance Audit', 'ISO27001, ISO27002, SW-96, TIR-57... ', 'ISO27001, TIR-57, SW-96...', '200KB', 'Jan 1, 2024'),
    createData('ABC_RiskAccessment_superlongnameeee..', 'ABC Medical Devices Ltd', 'ABC Pacemaker Compliance Audit', 'ISO27001, ISO27002, SW-96, TIR-57... ', 'ISO27001, TIR-57, SW-96...', '200KB', 'Jan 1, 2024'),
    createData('ABC_RiskAccessment_superlongnameeee..', 'ABC Medical Devices Ltd', 'ABC Pacemaker Compliance Audit', 'ISO27001, ISO27002, SW-96, TIR-57... ', 'ISO27001, TIR-57, SW-96...', '200KB', 'Jan 1, 2024'),
    createData('ABC_RiskAccessment_superlongnameeee..', 'ABC Medical Devices Ltd', 'ABC Pacemaker Compliance Audit', 'ISO27001, ISO27002, SW-96, TIR-57... ', 'ISO27001, TIR-57, SW-96...', '200KB', 'Jan 1, 2024'),
    createData('ABC_RiskAccessment_superlongnameeee..', 'ABC Medical Devices Ltd', 'ABC Pacemaker Compliance Audit', 'ISO27001, ISO27002, SW-96, TIR-57... ', 'ISO27001, TIR-57, SW-96...', '200KB', 'Jan 1, 2024'),
    createData('ABC_RiskAccessment_superlongnameeee..', 'ABC Medical Devices Ltd', 'ABC Pacemaker Compliance Audit', 'ISO27001, ISO27002, SW-96, TIR-57... ', 'ISO27001, TIR-57, SW-96...', '200KB', 'Jan 1, 2024'),
    createData('ABC_RiskAccessment_superlongnameeee..', 'ABC Medical Devices Ltd', 'ABC Pacemaker Compliance Audit', 'ISO27001, ISO27002, SW-96, TIR-57... ', 'ISO27001, TIR-57, SW-96...', '200KB', 'Jan 1, 2024'),
    createData('ABC_RiskAccessment_superlongnameeee..', 'ABC Medical Devices Ltd', 'ABC Pacemaker Compliance Audit', 'ISO27001, ISO27002, SW-96, TIR-57... ', 'ISO27001, TIR-57, SW-96...', '200KB', 'Jan 1, 2024'),
    createData('ABC_RiskAccessment_superlongnameeee..', 'ABC Medical Devices Ltd', 'ABC Pacemaker Compliance Audit', 'ISO27001, ISO27002, SW-96, TIR-57... ', 'ISO27001, TIR-57, SW-96...', '200KB', 'Jan 1, 2024'),
    createData('ABC_RiskAccessment_superlongnameeee..', 'ABC Medical Devices Ltd', 'ABC Pacemaker Compliance Audit', 'ISO27001, ISO27002, SW-96, TIR-57... ', 'ISO27001, TIR-57, SW-96...', '200KB', 'Jan 1, 2024'),
];
export default function ExtraProjectDetails() {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [isDialogOpen, setDialogOpen] = useState(false);
    const [dialogData, setDialogData] = useState<RegulationDetails[]>([]); // State to pass data to the dialog
    const [receivedData, setReceivedData] = useState<string>(''); // State to store data received from dialog

    // Function to open the dialog
    const handleOpenDialog = () => {
        setDialogOpen(true);
    };

    // Function to close the dialog
    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    // Function to handle data coming from the dialog
    const handleDialogData = (data: string) => {

        setReceivedData(data);
        setDialogOpen(false);
    }


    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

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
    return (
        <Box ml={3} mt={3}>
            <Grid2 container spacing={4}>
                <Grid2 size={9.1}>
                    <div role="presentation" className='mb-1'>
                        <Breadcrumbs aria-label="breadcrumb">
                            <Link color="inherit" to={'/projects'}>
                                All Projects
                            </Link>
                            <Link color="inherit" to={'/project/details'}>
                                ABC Securities Audit
                            </Link>
                            <Typography sx={{ color: 'text.primary' }}> ISO27001</Typography>
                        </Breadcrumbs>
                    </div>
                    <div className="flex justify-between">
                        <div className="flex items-center">
                            <Typography sx={{ fontSize: '26px', fontWeight: 700, marginBottom: 'unset' }} mb={4}>ISO27001</Typography>
                            <div className={`ms-3 p-2 font-semibold rounded-3xl border text-[#cc6626] bg-[#cc66301a] border-[#cc6630]`} >Reduced Scope</div>
                        </div>
                        <div>
                            <CustomSecondaryButton
                                disableRipple
                                tabIndex={-1}
                                sx={{ background: Colors.grey, fontWeight: 600, fontSize: '14px', color: 'black', marginRight: '12px' }}
                                onClick={handleOpenDialog}>
                                Edit Scope
                            </CustomSecondaryButton>
                            <CustomPrimaryButton>
                                <span className="me-2"><ThreeStarIcon fill={'white'} /></span> 
                                Start Audit
                            </CustomPrimaryButton>
                            
                        </div>

                    </div>
                    <Typography variant="body2">Information Security Management System </Typography>
                    <div>
                    </div>

                    <div className='rounded-md shadow shadow-[#7d848f] bg-white mt-8'>
                        <div className="flex justify-between">
                            <p className='p-2 text-md ps-4 font-semibold'>Files</p>
                            {/* <div className='flex items-center'><SearchIcon />
                                <div className='ms-2'>
                                    <select className='bg-[#f0f1ec] rounded-md p-1'>
                                        <option>QuickFilter</option>
                                        <option>2024 Q2</option>
                                        <option>2024 Q3</option>
                                    </select>
                                </div>
                                <div className="ms-4">
                                    <DeleteIcon />
                                </div>
                                <div className="ms-4">
                                    <FilterIcon />
                                </div>
                                <div className="ms-4">
                                    <DotsIcon />
                                </div>
                            </div> */}

                        </div>


                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} aria-label="simple table" size="small">
                                <TableHead className='bg-[#f0f1ec]'>
                                    <TableRow>
                                        <TableCell>  <Checkbox /></TableCell>
                                        <TableCell><span className="font-semibold">Document Name</span></TableCell>
                                        <TableCell><span className="font-semibold">Client</span></TableCell>
                                        <TableCell><span className="font-semibold">Project Name</span></TableCell>
                                        <TableCell><span className="font-semibold">Scope</span></TableCell>
                                        <TableCell><span className="font-semibold">File Size</span></TableCell>
                                        <TableCell><span className="font-semibold">Uploaded On</span></TableCell>
                                        <TableCell><span className="font-semibold">Uploaded By</span></TableCell>
                                        <TableCell><span className="font-semibold"></span></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rows.map((row, index) => (
                                        <TableRow
                                            key={index + 1}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell>  <Checkbox /></TableCell>
                                            <TableCell component="th" scope="row" >{row.name}</TableCell>
                                            <TableCell>{row.calories}</TableCell>
                                            <TableCell><span className={`text-[${Colors.tertiary}]`}>{row.fat}</span></TableCell>
                                            <TableCell><span className={`text-[${Colors.tertiary}]`}>{row.scope}</span></TableCell>
                                            <TableCell>{row.fileSize}</TableCell>
                                            <TableCell>{row.date}</TableCell>
                                            <TableCell><CustomAvatar alt="Travis Howard" src="/static/images/avatar/2.jpg" /></TableCell>
                                            <TableCell><IconButton component={Link} to="/project-details"><GreaterThenIcon /></IconButton></TableCell>

                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter className='text-end'>

                                    <TableRow>
                                        <p className='p-2 text-xs py-3 ps-4 text-[#757874] italic text-left'>Last updated: just now</p>
                                        <TablePagination
                                            rowsPerPageOptions={[5, 10, 25, { label: 'All', value: 2 }]}
                                            colSpan={12}
                                            count={rows.length}
                                            rowsPerPage={rowsPerPage}
                                            page={page}
                                            slotProps={{
                                                select: {
                                                    inputProps: {
                                                        'aria-label': 'rows per page',
                                                    },
                                                    native: true,
                                                },
                                            }}
                                            onPageChange={handleChangePage}
                                            onRowsPerPageChange={handleChangeRowsPerPage}
                                            // ActionsComponent={TablePaginationActions}
                                            sx={{
                                                // Targeting the select element inside TablePagination
                                                '.MuiTablePagination-select': {
                                                    color: Colors.tertiary,
                                                    fontWeight: 600
                                                },
                                            }}
                                        />
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </TableContainer>

                    </div >
                </Grid2>
                <Grid2 size={2.9}>
                    <DatilsSidebar />

                </Grid2>
            </Grid2>
            <CustomizeScope
                open={isDialogOpen}
                onClose={handleCloseDialog}
                onReceiveData={handleDialogData} // Callback to get data from the dialog
                dialogData={dialogData}
                isAddOrEdit=""
            />

        </Box>
    )
}
// function TablePaginationActions(props: TablePaginationActionsProps) {
//     const theme = useTheme<Theme>();
//     const { count, page, rowsPerPage, onPageChange } = props;

//     const handleFirstPageButtonClick = (
//         event: React.MouseEvent<HTMLButtonElement>,
//     ) => {
//         onPageChange(event, 0);
//     };

//     const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
//         onPageChange(event, page - 1);
//     };

//     const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
//         onPageChange(event, page + 1);
//     };

//     const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
//         onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
//     };

//     return (
//         <Box sx={{ flexShrink: 0, ml: 2.5 }}>
//             <IconButton
//                 onClick={handleFirstPageButtonClick}
//                 disabled={page === 0}
//                 aria-label="first page"
//             >
//                 {theme.direction === 'rtl' ? <LastPageIcon sx={{ fill: Colors.tertiary }} /> : <FirstPageIcon sx={{ fill: Colors.tertiary }} />}
//             </IconButton>
//             <IconButton
//                 onClick={handleBackButtonClick}
//                 disabled={page === 0}
//                 aria-label="previous page"
//             >
//                 {theme.direction === 'rtl' ? <KeyboardArrowRight sx={{ fill: Colors.tertiary }} /> : <KeyboardArrowLeft sx={{ fill: Colors.tertiary }} />}
//             </IconButton>
//             <IconButton
//                 onClick={handleNextButtonClick}
//                 disabled={page >= Math.ceil(count / rowsPerPage) - 1}
//                 aria-label="next page"
//             >
//                 {theme.direction === 'rtl' ? <KeyboardArrowLeft sx={{ fill: Colors.tertiary }} /> : <KeyboardArrowRight sx={{ fill: Colors.tertiary }} />}
//             </IconButton>
//             <IconButton
//                 onClick={handleLastPageButtonClick}
//                 disabled={page >= Math.ceil(count / rowsPerPage) - 1}
//                 aria-label="last page"
//             >
//                 {theme.direction === 'rtl' ? <FirstPageIcon sx={{ fill: Colors.tertiary }} /> : <LastPageIcon sx={{ fill: Colors.tertiary }} />}
//             </IconButton>
//         </Box>
//     );
// }