import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
// import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Checkbox, Divider, IconButton, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Colors } from '../../../../common/colors';

import { useEffect, useMemo, useState } from 'react';

import { showGlobalSnackbar } from '../../../../common/snackbarProvider';
import { RegulationDetailCustomizeScope, RegulationDetails } from '../../../../types';
import { CustomPrimaryButton, CustomSecondaryButton } from '../../../../common/common.style';

const CustomizeScope = ({ open, onClose, onReceiveData, dialogData, optionalArgs, isAddOrEdit, scopeName }: RegulationDetailCustomizeScope) => {

    const [listingData, setListingData] = useState<RegulationDetails[]>([])
    const [checkedItems, setCheckedItems] = React.useState<number[]>([]);
    const allChecked = checkedItems?.length === listingData?.length; // All items selected
    const isIndeterminate = checkedItems?.length > 0 && checkedItems?.length < listingData?.length; // Some items selected    
    const [regulationDetailsAdded, setRegulationDetailsAdded] = useState<Number[]>([]);
    const [regulationDetailsDeleted, setRegulationDetailsDeleted] = useState<Number[]>([]);
    useEffect(() => {
        setListingData([])
        setCheckedItems([])
        setRegulationDetailsAdded([])
        setRegulationDetailsDeleted([])
        setListingData(dialogData)
        if (optionalArgs && optionalArgs.length > 0) {
            setCheckedItems(optionalArgs)
        } else {
            // setCheckedItems(dialogData?.map((data: any) => { return data?.id }))

        }
    }, [dialogData])
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('lg'));

    const onCloseDialog = () => {
        setCheckedItems(checkedItems);
        onClose()
    }




    // Toggle a single item
    const handleToggle = (event: React.ChangeEvent<HTMLInputElement>, value: number) => {
        const { checked } = event.target;
        const id = value
        
        if (checked) {
            if (checkedItems.length >= 5) {
                showGlobalSnackbar('You can not select more then 5 scope', 'warning')
                return
            }
            setCheckedItems((prevSelected) =>
                prevSelected.includes(id)
                    ? prevSelected.filter((regId) => regId !== id)
                    : [...prevSelected, id]
            );
            const isInMainData = optionalArgs?.some((user: number) => user === id);

            if (!isInMainData) {
                setRegulationDetailsAdded((prev) =>
                    prev.some((user) => user === id) ? prev : [...prev, id]
                );
            }
            setRegulationDetailsDeleted((prev) => prev.filter((user) => user !== id));
        } else {
            setCheckedItems((prev) => prev.filter(item => item !== id));
            const isAdded = regulationDetailsAdded.some((user) => user === id);
           

            if (isAdded) {
                setRegulationDetailsAdded((prev) => prev.filter((user) => user !== id));
            } else {
                const itemToDelete = optionalArgs?.find((user: number) => user === id);
                if (itemToDelete) {
                    setRegulationDetailsDeleted((prev) =>
                        prev.some((user) => user === id) ? prev : [...prev, itemToDelete]
                    );
                }
            }
        }
        
    };

    const handleSelectAll = () => {
        if (allChecked) {            
            const previouslyChecked = checkedItems.filter((value) => optionalArgs?.includes(value));
            setRegulationDetailsDeleted((prev) => [...prev, ...previouslyChecked]);
            setRegulationDetailsAdded([]);
            setCheckedItems([]);
            
        } else {
                showGlobalSnackbar('You can not select more then 5 scope', 'warning')
                return
            
            setRegulationDetailsAdded(listingData?.map((data: any) => { return data?.id }))
            setRegulationDetailsDeleted([]);
            setCheckedItems(listingData?.map((data: any) => { return data?.id }));
            
        }
    };

    const finalSubmit = () => {
        if (checkedItems.length! <= 0) {
            showGlobalSnackbar('Please Select atleast 1 scope', 'warning')
            return
        }
        
        if (isAddOrEdit === 'add') {
            onReceiveData([...new Set(checkedItems)])
        } else {
            onReceiveData({ regulationDetailsAdded: regulationDetailsAdded, regulationDetailsDeleted: regulationDetailsDeleted })
        }

    }
    return (
        <React.Fragment>
            <Dialog
                fullScreen={fullScreen}
                open={open}
                onClose={onCloseDialog}
                aria-labelledby="responsive-dialog-title"
            >
                <DialogTitle id="responsive-dialog-title">
                    <div className="flex items-center mb-3">
                        <svg width="21" height="22" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.5 0.625C16.2832 0.625 21 5.3418 21 11.125C21 16.9492 16.2832 21.625 10.5 21.625C4.67578 21.625 0 16.9492 0 11.125C0 5.3418 4.67578 0.625 10.5 0.625ZM10.5 19.6562C15.1758 19.6562 19.0312 15.8418 19.0312 11.125C19.0312 6.44922 15.1758 2.59375 10.5 2.59375C5.7832 2.59375 1.96875 6.44922 1.96875 11.125C1.96875 15.8418 5.7832 19.6562 10.5 19.6562ZM12.1406 14.4062C12.6738 14.4062 13.125 14.8574 13.125 15.3906C13.125 15.9648 12.6738 16.375 12.1406 16.375H8.85938C8.28516 16.375 7.875 15.9648 7.875 15.3906C7.875 14.8574 8.28516 14.4062 8.85938 14.4062H9.51562V11.7812H9.1875C8.61328 11.7812 8.20312 11.3711 8.20312 10.7969C8.20312 10.2637 8.61328 9.8125 9.1875 9.8125H10.5C11.0332 9.8125 11.4844 10.2637 11.4844 10.7969V14.4062H12.1406ZM10.5 8.5C9.76172 8.5 9.1875 7.92578 9.1875 7.1875C9.1875 6.49023 9.76172 5.875 10.5 5.875C11.1973 5.875 11.8125 6.49023 11.8125 7.1875C11.8125 7.92578 11.1973 8.5 10.5 8.5Z" fill="#366475" />
                        </svg>
                        <Typography variant='body1' > <span className="ms-3 font-semibold">{"Customize Scope"}</span></Typography>

                    </div>
                    <div>
                        <Typography variant='body2'>
                            Select sections of <span className='font-semibold'>{scopeName}</span> to include in this case.
                            To review the contents of this regulation/ standard/ guideline in full,
                            review your audit parameters settings here.
                        </Typography>
                    </div>
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={onCloseDialog}
                    sx={(theme) => ({
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme.palette.grey[500],
                    })}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent sx={{ px: 0 }}>
                    {/* <DialogContentText> */}

                    <List sx={{ padding: 0 }}>
                        {/* Select All Checkbox */}
                        <ListItem sx={{ padding: '2px 0', margin: 0, background: Colors.grey, mx: '8px', px: '8px', height: '45px' }}
                        >
                            <ListItemIcon >
                                <Checkbox
                                    edge="start"
                                    checked={allChecked}
                                    indeterminate={isIndeterminate} // Indicates partial selection
                                    onChange={handleSelectAll}
                                    sx={{
                                        color: Colors.tertiary, '&.Mui-checked': {
                                            color: Colors.tertiary,
                                        },
                                    }}
                                />
                            </ListItemIcon>
                            <ListItemText primary="Section Number and Title" />
                        </ListItem>

                        <Divider />

                        {/* Individual Items with Checkboxes */}
                        {listingData?.map((item: any, index: number) => (
                            <ListItem key={item.id} sx={{ padding: '2px 0', margin: 0, mx: '8px', px: '8px', alignItems: 'flex-start!important' }}>
                                <ListItemIcon sx={{ minWidth: '30px', }}>
                                    <Checkbox
                                        edge="start"
                                        // checked={checkedItems}
                                        checked={checkedItems?.includes(item?.id)}
                                        // onChange={() => handleToggle(index)}
                                        onChange={(event) => handleToggle(event, item.id)}
                                        sx={{
                                            color: Colors.tertiary, '&.Mui-checked': {
                                                color: Colors.tertiary,
                                            },
                                        }}
                                    />
                                </ListItemIcon>
                                <ListItemText
                                    sx={{ fontSize: '14px' }}
                                    primary={`${item.step}: ${item.subChapterName}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                    {/* </DialogContentText> */}
                </DialogContent>
                <DialogActions>
                    <div className='flex justify-end mt-4'>
                        <CustomSecondaryButton
                            sx={{ marginRight: '16px'}}
                            size="small"
                            disableRipple
                            className='flex m-2 p-2 rounded'
                            onClick={onCloseDialog}
                        >
                            Cancel
                        </CustomSecondaryButton>
                        <CustomPrimaryButton
                            size="small"
                            disableRipple
                            className='flex m-2 p-2 rounded'
                            onClick={finalSubmit}
                        >
                            Save
                        </CustomPrimaryButton>
                    </div>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}

export default React.memo(CustomizeScope) 