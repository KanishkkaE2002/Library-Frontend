import {Link} from 'react-router-dom';
import style from './../style/navbar.module.css';
export default function NavBar()
{
    return (
        <div className={style["nav-container"]}>
        
        <ul>
                <li><Link to='/home'>Home</Link></li>
                <li><Link to='/services'>Services</Link></li>
                <li><Link to='/Rules'>Rules</Link></li>
                <li><Link to='/Timings'>Timings</Link></li>
                <li><Link to='/contact'>Contact</Link></li>
                <li><Link to='/signIn'>Login</Link></li>

        </ul>
        </div>
    );
}