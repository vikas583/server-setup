import styled from "@emotion/styled";
import backgroundImg from "../../../assets/imgs/loginBackground.png";

export const BackgroundContainer = styled('div')(() => ({
    backgroundImage: `url(${backgroundImg})`,
    minHeight: '100vh',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    paddingTop: '80px',
    paddingBottom: '80px',

}))
