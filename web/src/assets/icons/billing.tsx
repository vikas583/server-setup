
interface Color {
    fill?: string;
}

export const BillingIcon: React.FC<Color> = ({ fill = 'black' }) => {
    return (
<svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 6C6 4.34375 7.3125 3 9 3C10.6562 3 12 4.34375 12 6C12 7.65625 10.6562 9 9 9C7.3125 9 6 7.65625 6 6ZM0 2C0 0.90625 0.875 0 2 0H16C17.0938 0 18 0.90625 18 2V10C18 11.125 17.0938 12 16 12H2C0.875 12 0 11.125 0 10V2ZM1.5 3.5V8.5C2.59375 8.5 3.5 9.40625 3.5 10.5H14.5C14.5 9.40625 15.375 8.5 16.5 8.5V3.5C15.375 3.5 14.5 2.625 14.5 1.5H3.5C3.5 2.625 2.59375 3.5 1.5 3.5Z" 
    fill={fill} />
</svg>
    );
};

