import { styled } from "@mui/material";

export const BoxDiv = styled('div')(() => ({
    borderRadius: '4px',
    padding: '20px 24px 20px 24px',
    boxShadow: '0px 0px 4px 0px rgba(170, 172, 167, 0.50)',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    background:'white',
    width:'230px'
}))
export const Grid2 = styled('div')(() => ({
    borderRadius: '4px',
    // padding: '20px 24px 20px 24px',
    boxShadow: '0px 0px 4px 0px rgba(170, 172, 167, 0.50)',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    background:'white'
}))
export const Grid2Inside1 = styled('div')(() => ({
    display: 'flex',
    padding: '12px 10px 8px 16px',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    alignSelf: 'stretch',
    width: '100%',
    flexWrap: 'wrap'
,
background:'white'
}))
export const Grid2Inside2 = styled('div')(() => ({
    padding: '0px 16px 16px 16px',
    fontSize: '36px',
    fontStyle: 'normal',
    fontWeight: 700,
    lineHeight: '46px', /* 127.778% */
    letterSpacing: '-0.4px',
    background:'white'
}))
export const CustomProject = styled('div')(() => ({
    padding: '16px 16px 20px 16px',
    alignSelf: 'stretch',
    background:'white'
}))

