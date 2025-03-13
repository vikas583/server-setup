// import { useTheme } from "@emotion/react";
import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Avatar, IconButton, TablePagination, Box, Typography, Breadcrumbs, Button, Grid2, Checkbox, } from "@mui/material";
// import Grid from '@mui/material/Grid2';

// import { TablePaginationActionsProps } from "@mui/material/TablePagination/TablePaginationActions";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { GreaterThenIcon } from "../../../../assets/icons/greaterThenIcon";
import { Colors } from "../../../../common/colors";
// import FirstPageIcon from '@mui/icons-material/FirstPage';
// import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
// import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
// import LastPageIcon from '@mui/icons-material/LastPage';
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
import PaginationComponent from "../../../../common/pagination";
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
    createData('ABD_RiskAccessment_superlongnameeee..', 'ABC Medical Devices Ltd', 'ABC Pacemaker Compliance Audit', 'ISO27001, ISO27002, SW-96, TIR-57... ', 'ISO27001, TIR-57, SW-96...', '200KB', 'Jan 1, 2024'),
];
export default function ExtraProjectDetails() {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [totalItems, setTotalItems] = useState<number>(10);



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
                                // component="label"
                                role={undefined}
                                variant="contained"
                                tabIndex={-1}
                                sx={{ marginRight: '12px' }}
                                onClick={handleOpenDialog}>
                                Edit Scope
                            </CustomSecondaryButton>
                            <Link to={'/pdf'}>
                                <CustomPrimaryButton
                                    // component="label"
                                    role={undefined}
                                    variant="contained"
                                    tabIndex={-1}
                                    startIcon={<ThreeStarIcon fill={'white'} />}

                                >
                                    Start Audit
                                    <VisuallyHiddenInput
                                        type="button"

                                    />
                                </CustomPrimaryButton>
                            </Link>
                        </div>

                    </div>
                    <Typography variant="body2">Information Security Management System </Typography>
                    <div>
                    </div>

                    <div className='rounded-md shadow shadow-[#7d848f] bg-white mt-8'>
                        <div className="flex justify-between">
                            <p className='p-2 text-md ps-4 font-semibold'>Files</p>
                            <div className='flex items-center'><SearchIcon />
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
                            </div>

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
                                    {(rowsPerPage > 0
                                        ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        : rows
                                    ).map((row, index) => (
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
                                            <TableCell><CustomAvatar  alt="Travis Howard" src="/static/images/avatar/2.jpg" /></TableCell>
                                            <TableCell><IconButton component={Link} to="/project-details"><GreaterThenIcon /></IconButton></TableCell>

                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="flex items-center justify-between border">
                                <p className='p-2 text-xs py-3 ps-4 text-[#757874] italic text-left'>Last updated: just now</p>
                                <TablePagination
                                    component="div"
                                    count={rows.length}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    rowsPerPage={rowsPerPage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                    rowsPerPageOptions={[5, 10, 25, 50]}
                                    ActionsComponent={(props) => <PaginationComponent {...props} pageName='audit' />}
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

                    </div >
                </Grid2>
                <Grid2 size={2.9}>
                    <DatilsSidebar />

                </Grid2>
            </Grid2>
            <CustomizeScope open={isDialogOpen}
            onClose={handleCloseDialog}
            onReceiveData={handleDialogData} // Callback to get data from the dialog
            dialogData={dialogData} isAddOrEdit={''}            />
        </Box>
    )
}
