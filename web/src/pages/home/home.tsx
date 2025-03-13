import { Link } from "react-router-dom";

export default function Home() {
return (
    <div>
        <p>Hii home</p>
        <Link to="/login">Login</Link>
    </div>
);
}