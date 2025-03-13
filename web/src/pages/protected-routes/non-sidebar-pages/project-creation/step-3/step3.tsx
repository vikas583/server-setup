import { useState, useEffect } from "react";
import { TextField, Box, Typography, Button, TableContainer, Checkbox, IconButton,  Paper, Table, TableBody, TableCell, TableHead, TablePagination, TableRow } from "@mui/material";
import { UploadIcon } from "../../../../../assets/icons/uploadIcon";
import { Colors } from "../../../../../common/colors";
import { VisuallyHiddenInput } from "../../../all-files/allFiles.style";
import {GreaterThenIcon} from "../../../../../assets/icons/greaterThenIcon";
import PaginationComponent from "../../../../../common/pagination";
import { Link as RouterLink } from 'react-router-dom';

const StepThree = ({ data, onDataChange }: any) => {
    // const [apiData, setApiData] = useState([]);
    // const [totalItems, setTotalItems] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [localData, setLocalData] = useState(data);
    const listData: any = []
    useEffect(() => {
        onDataChange(localData);
    }, [localData]);

    // const handleInputChange = (e: any) => {
    //     const { name, value } = e.target;
    //     setLocalData({ ...localData, [name]: value });
    // };
    useEffect(() => {
        onDataChange(localData);
    }, [localData]);
    const handlePageChange = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
        console.log(event)
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);  // Reset to first page on page size change
    };


    return (
        <Box sx={{ background: 'white', borderRadius: '24px', boxShadow: '0px 0px 4px 0px rgba(170, 172, 167, 0.50)', }} p={3}>

            <Typography variant="h5" sx={{ fontWeight: 700 }} mb={4}>Step 3: Audit History (Optional)</Typography>
            <Typography variant="body1" mb={3}>If available, provide audit history that may be relevant to this project. (E.g. Audit Reports, CAPA Results) </Typography>

            <Typography variant="h6" sx={{ fontWeight: 600 }}>Upload Documents</Typography>
            <Typography variant="subtitle2" mb={2}><span className="text-[#757874]">Please upload documents from previous audits that may be relevant to this case. </span></Typography>
            <Button
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                startIcon={<UploadIcon fill="black" />}
                sx={{
                    background: Colors.grey, fontWeight: 600, fontSize: '14px', color: 'black',
                    marginBottom: '24px'
                }}

            >
                Upload files
                <VisuallyHiddenInput
                    type="file"
                    onChange={(event) => console.log(event.target.files)}
                    multiple
                />
            </Button>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table" size="small">
                    <TableHead className='bg-[#f0f1ec]'>
                        <TableRow

                        >
                            <TableCell padding="checkbox">
                                <Checkbox
                                    color="primary"
                                    // indeterminate={numSelected > 0 && numSelected < rowCount}
                                    // checked={rowCount > 0 && numSelected === rowCount}
                                    // onChange={onSelectAllClick}
                                    inputProps={{
                                        'aria-label': 'select all desserts',
                                    }}
                                />
                            </TableCell>
                            <TableCell><span className="font-semibold">File Name</span></TableCell>
                            <TableCell><span className="font-semibold">File Size</span></TableCell>
                        </TableRow>
                    </TableHead>
                    {listData.length > 0 ?
                        <TableBody>

                            {listData.map((row: any, index: number) => (
                                <TableRow
                                    key={index + 1}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    hover
                                    // onClick={(event) => handleClick(event, row.id)}
                                    role="checkbox"
                                    tabIndex={-1}
                                >

                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            color="primary"
                                            // checked={isItemSelected}
                                            inputProps={{
                                                // 'aria-labelledby': labelId,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell component="th" scope="row" >{row.version}</TableCell>
                                    <TableCell>{row.standard}</TableCell>
                                    <TableCell>{row.category}</TableCell>
                                    <TableCell>abcd</TableCell>
                                    <TableCell> <IconButton component={RouterLink} to="/project/details"><IconButton><GreaterThenIcon /></IconButton></IconButton></TableCell>

                                </TableRow>
                            ))}

                        </TableBody>
                        :

                        <TableBody>
                            <TableRow>
                                <TableCell></TableCell>
                                <TableCell sx={{ textAlign: 'center', paddingLeft: '40px' }} >No Files Uploaded</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableBody>
                    }

                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                count={listData.length}
                page={page}
                onPageChange={handlePageChange}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleRowsPerPageChange}
                rowsPerPageOptions={[5, 10, 25, 50]}
                ActionsComponent={PaginationComponent}  // Custom pagination actions
                labelRowsPerPage="Items per page:"
            />

        </Box>
    );
};

export default StepThree;
