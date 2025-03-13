import { Autocomplete, Avatar, Button, colors, ListItemText, OutlinedInput, Select } from '@mui/material';
import { createTheme, styled } from '@mui/material/styles';
import { Colors } from "./colors";
import { TextareaAutosize as BaseTextareaAutosize } from '@mui/base/TextareaAutosize';
import { grey, blue, pink } from "@mui/material/colors";

export const CustomSubmitButton = styled(Button)(() => ({
    background: Colors.tertiary,
    color: 'white',
    textTransform: 'none'
}));
export const CustomOutlinedInput = styled(OutlinedInput)(({ error }) => ({    
    '& .MuiOutlinedInput-input': {
        backgroundColor: error ? '#FFDAD6' : '#F0F1EC',
        borderRadius: '4px',
        color: '#2E312E',
    },
    
    '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#C5C7C2',
        boxShadow: '0px 0px 4px 0px rgba(21, 130, 119, 0.50)'
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#18988B',
        boxShadow: '0 4px 4px rgba(21, 130, 119, 0.5)',
    },
    '&.Mui-focused .MuiOutlinedInput-input': {
        backgroundColor: '#FFFFFF',
    },
    '&.MuiFilled .MuiOutlinedInput-notchedOutline': {
        borderColor: '#F0F1EC',
    },
    
    '&.Mui-error .MuiOutlinedInput-root': {
        backgroundColor: '#FFECEC!important',
    },
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#F0F1EC',
    },
}))
export const CustomAutocomplete = styled(Autocomplete)(() => ({
    '& .MuiAutocomplete-inputRoot': {
        backgroundColor: '#F0F1EC',
        borderRadius: '4px',
        color: '#2E312E',
    },
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#F0F1EC',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#C5C7C2',
        boxShadow: '0px 0px 4px 0px rgba(21, 130, 119, 0.50)'
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#18988B',
        boxShadow: '0 4px 4px rgba(21, 130, 119, 0.5)',
    },
    '&.Mui-focused .MuiAutocomplete-inputRoot': {
        backgroundColor: '#FFFFFF',
        outline: 'none'
    },
    '&.MuiFilled .MuiOutlinedInput-notchedOutline': {
        borderColor: '#F0F1EC',
    },
    
}))


export const CustomStyledSelect = styled(Select)(({ theme }) => ({
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#F0F1EC',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#C5C7C2',
        boxShadow: '0 4px 4px rgba(170, 172, 167, 0.5)',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#18988B',
       
        boxShadow: '0 4px 4px rgba(21, 130, 119, 0.5)',
    },
    '&.Mui-focused .MuiOutlinedInput-input': {
        backgroundColor: '#FFFFFF',
    },
    '& .MuiSelect-select': {
        backgroundColor: '#F0F1EC',
        color: '#2E312E',
    },
    
}));
export const Textarea = styled(BaseTextareaAutosize)(
    ({ theme }: any) => `
    box-sizing: border-box;
    width: 100%;
    font-weight: 400;
    line-height: 1;
    padding: 12px;
    border-radius: 4px;
    color: #2E312E;
    background: #F0F1EC;
    border: 1.1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[400]};

    &:hover {
      border-color: #C5C7C2;
        box-shadow: 0px 0px 4px 0px rgba(21, 130, 119, 0.50);
    }

    &:focus {
    outline: none;
      background:#FFFFFF;
       border-color: #18988B;
        box-shadow: 0 4px 4px rgba(21, 130, 119, 0.5);
    }
   
    &:focus-visible {
    outline: none;
       background:#FFFFFF;
       border-color: #18988B;
        box-shadow: 0 4px 4px rgba(21, 130, 119, 0.5);
    }
  `,

);

export const MuiTableRow = createTheme({
    components: {
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&:hover': {
                        backgroundColor: '#F2F3F5',
                    },
                    '&.Mui-selected': {
                        backgroundColor: '#DDE0E5',
                        '&:hover': {
                            backgroundColor: '#DDE0E5',
                        },
                    },
                },
                
            },
        },
    },
});

import { useState } from 'react';
import { Opacity } from '@mui/icons-material';

// Hook return type definition
interface UseRowSelection {
    selectedRow: number | null;
    handleRowClick: (index: number) => void;
}

export const useRowSelection = (): UseRowSelection => {
    const [selectedRow, setSelectedRow] = useState<number | null>(null);

    const handleRowClick = (index: number) => {
        setSelectedRow(index === selectedRow ? null : index);
    };

    return { selectedRow, handleRowClick };
};
export const CustomPrimaryButton = styled(Button)(({ theme }) => ({
    backgroundColor: '#18988B',
    fontWeight: 600,
    fontSize: '14px',
    color:'#FFF',
    '&:hover': {
        backgroundColor: '#158277',
        boxShadow: '0px 0px 4px 0px rgba(21, 130, 119, 0.50)'
    },
    '&:active': {
        backgroundColor: '#116D63',
        boxShadow: '0px 0px 4px 0px rgba(21, 130, 119, 0.50)'
    },
    '&:disabled': {
        backgroundColor: '#18988B',
        opacity: 0.4,
        color:'white'
    },
}));
export const CustomSecondaryButton = styled(Button)(({ theme }) => ({
    backgroundColor: '#E1E3DE',
    color:'#191C1A',
    fontWeight: 600,
    fontSize: '14px',
    '&:hover': {
        backgroundColor: '#C5C7C2',
        boxShadow: '0px 0px 4px 0px rgba(170, 172, 167, 0.50)'
    },
    '&:active': {
        backgroundColor: '#AAACA7',
        boxShadow: '0px 0px 4px 0px rgba(170, 172, 167, 0.50)'
    },
    '&:disabled': {
        backgroundColor: '#E1E3DE',
        opacity: 0.4,
    },
}));
export const CustomNegativeButton = styled(Button)(({ theme }) => ({
    backgroundColor: '#FF897D',
    fontWeight: 600,
    fontSize: '14px',
    color:'#410002',
    '&:hover': {
        backgroundColor: '#FF5449',
        boxShadow: '0px 0px 4px 0px rgba(241, 8, 13, 0.40)'
    },
    '&:active': {
        backgroundColor: '#DE3730',
        boxShadow: '0px 0px 4px 0px rgba(241, 8, 13, 0.40)'
    },
    '&:disabled': {
        backgroundColor: '#FF897D',
        opacity: 0.4,
        color:'black'
    },
}));
export const CustomPositiveButton = styled(Button)(({ theme }) => ({
    backgroundColor: '#A7F3C0',
    color:'#053920',
    '&:hover': {
        backgroundColor: '#48E090',
        boxShadow: '0px 0px 4px 0px rgba(0, 188, 112, 0.50)'
    },
    '&:active': {
        backgroundColor: '#1BC376',
        boxShadow: '0px 0px 4px 0px rgba(0, 188, 112, 0.50)'
    },
    '&:disabled': {
        backgroundColor: '#A7F3C0',
        opacity: 0.4,
    },
}));
export const CustomNoticeButton = styled(Button)(({ theme }) => ({
    backgroundColor: '#FFB689',
    color:'#33190A',
    '&:hover': {
        backgroundColor: '#FFA46B',
        boxShadow: '0px 0px 4px 0px rgba(255, 127, 48, 0.50)'
    },
    '&:active': {
        backgroundColor: '#FF914E',
        boxShadow: '0px 0px 4px 0px rgba(255, 127, 48, 0.50)'
    },
    '&:disabled': {
        backgroundColor: '#FFB689',
        opacity: 0.4,
    },
}));
export const CustomTertiaryButton = styled(Button)(({ theme }) => ({
    color: '#158277',
    fontWeight:600,
    background:'transparent',
    fontSize:'14px',
    letterSpacing: '0.126px',
    cursor:'pointer',
    '&:hover': {
        color: '#116D63',
    },
    '&:active': {
        color: '#0E574F',
    },
    '&:disabled': {
        color: '#158277',
        opacity: 0.4,
    },
}));
export const CustomAvatar = styled(Avatar)(({ theme }) => ({
    width: '36px',
    height: '36px',
    backgroundColor: 'rgb(225, 227, 222)', // Circle background color
    fontFamily: 'Titillium Web, sans-serif', // Font family
    fontSize: '1rem', // Font size
    color: 'rgb(0, 0, 0)', // Text color
}));