import React, { useEffect, useState } from "react";
import style from "./../style/dashboard.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt,
  faBook,
  faUser,
  faSignOutAlt,
  faList,
  faDollarSign,
  faTags,
  faUsers, faStar, faCalendarAlt, faClipboardList
} from "@fortawesome/free-solid-svg-icons";
import BookManagement from "./BookManagement";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Profile from "./profile";
import BorrowedBooks from "./BorrowedBooks";
import HomeContent from "./homeContent";
import Event from "./event";
import Genre from "./Genre";
import Review from "./review";
import Fine from "./Fine";
import { useNavigate } from "react-router-dom";
import Reservations from "./Reservations";
import Members from "./Members";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const Dashboard = () => {
  const [activeComponent, setActiveComponent] = useState("DashBoard");
  const [error, setError] = useState("");
  const [bookcount, setBookcount] = useState();
  const [genreCount, setGenreCount] = useState();
  const [borrowedCount, setBorrowedCount] = useState();
  const [reservation, setReservation] = useState();
  const [userCount, setUsercount] = useState();
  const [totalUser, setTotalUser] = useState([]);
  const [searchinput,setSearchInput] = useState('');
  const [selectedRole, setSelectedRole] = useState("All");
  const [borrowedBooksData, setBorrowedBooksData] = useState([]);
  const[allBorrowedBooksData,setAllBorrowedBooksData]=useState([])

  const navigate = useNavigate();

  const handleNavClick = (component) => {
    setActiveComponent(component);
  };
  const token = localStorage.getItem("token");
  let currUser=localStorage.getItem('userId');
  let role = "";
  if (token) {
    const decodedToken = jwtDecode(token);
    role = decodedToken.role;
  }
  const getMonthName = (monthNumber) => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];
    return monthNames[monthNumber - 1];
  };
  
  const bookCount = async () => {
    try {
      const response = await axios.get(
        "https://localhost:7023/api/Book/total",
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const borrowedCount = await axios.get(
        "https://localhost:7023/api/BorrowedBook/active/count",
        {
          headers: { 'Authorization': `Bearer ${token}` }}
        );
      const genreResponse = await axios.get(
        "https://localhost:7023/api/Genre/count",
        {
          headers: { 'Authorization': `Bearer ${token}` }}
        );
      const reservationCount = await axios.get(
        "https://localhost:7023/api/Reservation/active/count",
        {
          headers: { 'Authorization': `Bearer ${token}` }}
        );
      const usercount = await axios.get(
        "https://localhost:7023/api/User/count",
        {
          headers: { 'Authorization': `Bearer ${token}` }}
      );
      const users = await axios.get(
        "https://localhost:7023/api/User",
        {
          headers: { 'Authorization': `Bearer ${token}` }}
      );
      setGenreCount(genreResponse.data);
      setBookcount(response.data.totalBooks);
      setBorrowedCount(borrowedCount.data);
      setReservation(reservationCount.data.activeReservationsCount);
      setUsercount(usercount.data);
      setTotalUser(users.data);
    } catch (err) {
      setError("Error fetching genres.");
      console.error(err);
    }
  };
  useEffect(() => {
    bookCount();
  }, []);
    const searchField = (searchinput, role) => {
    const filteredUsers = totalUser.filter((user) => {
      const matchesEmail = user.email.includes(searchinput);
      const matchesRole = role === "All" || user.role === role;
      return matchesEmail && matchesRole;
    });
    setTotalUser(filteredUsers);
  };

  useEffect(() => {
    searchField(searchinput, selectedRole);
    fetchBorrowedBooksData();
    fetchAllBorrowedBooksData();
  }, [searchinput, selectedRole]);

  const handleSearch = (e) => {
    setSearchInput(e.target.value);
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/");
    window.history.replaceState(null, null, window.location.href);
  };
  const fetchBorrowedBooksData = async () => {
    try {
        const response = await axios.get(`https://localhost:7023/api/BorrowedBook/borrowed-count?userId=${currUser}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const dataWithMonthNames = response.data.map(item => ({
            ...item,
            monthName: getMonthName(item.month)
        }));

        setBorrowedBooksData(dataWithMonthNames);
    } catch (err) {
        console.error("Error fetching borrowed books data:", err);
    }
};
const fetchAllBorrowedBooksData = async () => {
  try {
    const response = await axios.get('https://localhost:7023/api/BorrowedBook/borrowed-books/monthly-count/all-years', {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    const dataWithMonthNames = response.data.map((item) => ({
      ...item,
      monthName: getMonthName(item.month),
    }));

    setAllBorrowedBooksData(dataWithMonthNames);
  } catch (err) {
    console.error('Error fetching borrowed books data:', err);
  }
};

const dashboard = () => {
    return(
      <>
      <div className={style["count-container"]}>
       
      <div className={style["count-box"]}>
        <div className={style["image-content"]}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/3429/3429149.png"
            alt="book"
          />
        </div>
        <div className={style.count}>{bookcount}</div>
        <div className={style.count}>Book count</div>
      </div>
      {role === 'Admin' && (
          <div className={style["count-box"]}>
          <div className={style["image-content"]}>
            <img
              src="https://cdn-icons-png.flaticon.com/512/2417/2417791.png"
              alt="Borrowedbook"
            />
          </div>
          <div className={style.count}>{borrowedCount}</div>
          <div className={style.count}>Active Borrowed Book count</div>
        </div>
        )}
          {role === 'Admin' && (

      <div className={style["count-box"]}>
        <div className={style["image-content"]}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/b/b8/P_culture_violet.png"
            alt="Genre"
          />
        </div>
        <div className={style.count}>{genreCount}</div>
        <div className={style.count}>Genre count</div>
      </div>
          )}
      {role === 'Admin' && (

      <div className={style["count-box"]}>
        <div className={style["image-content"]}>
          <img
            src="https://static.thenounproject.com/png/10-200.png"
            alt="Reservation"
          />
        </div>
        <div className={style.count}>{reservation}</div>
        <div className={style.count}>Active Reservation count</div>
      </div>
      )} 

      <div className={style["count-box"]}>
        <div className={style["image-content"]}>
          <img
            src="https://icon-library.com/images/user-icon-image/user-icon-image-16.jpg"
            alt="User"
          />
        </div>
        <div className={style.count}>{userCount}</div>
        <div className={style.count}>Total Users</div>
      </div>
    </div>
    {role === 'User' && (
    <div className={style["chart-container"]}>
      <h3>Borrowed Books by Month</h3>
      <ResponsiveContainer width="100%" height={300}>
  <BarChart data={borrowedBooksData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="monthName" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="count" fill="#4de6cf" />
          {/* <Bar dataKey="userCount" fill="#82ca9d" /> */}
         </BarChart>
</ResponsiveContainer>

    </div>
  )}
        {/* {role === 'User' && (
    <div className={style["chart-container"]}>
      <h3>Borrowed Books by Month</h3>
      <ResponsiveContainer width="100%" height={300}>
  <LineChart data={borrowedBooksData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="monthName" />
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey="count" stroke="#8884d8" />
  </LineChart>
</ResponsiveContainer>

    </div>
  )} */}
  {role === 'Admin' && (
    <div className={style["chart-container"]}>
<h3 style={{ textAlign: 'center', marginBottom:'20px' }}>Total Borrowed Books by Month</h3>
<ResponsiveContainer width="100%" height={300}>
        <BarChart data={allBorrowedBooksData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="monthName" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" />
          {/* <Bar dataKey="userCount" fill="#82ca9d" /> */}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )}
</>
  )}

  const renderContent = () => {
    switch (activeComponent) {
      case "DashBoard":
        return dashboard();
      case "BookManagement":
        return <BookManagement />;
      case "Profile":
        return <Profile />;
      case "Event":
        return <Event />;
      case "Genre":
        return <Genre />;
      case "Review":
        return <Review />;
      case "Fine":
        return <Fine />;
      case "BorrowedBooks":
        return <BorrowedBooks />;
      case "Reservations":
        return <Reservations />;
      case "Members":
        return <Members />;
      default:
        return <HomeContent />;
    }
  };

  return (
    <div className={style["dashboard-container"]}>
      <nav className={style["vertical-navbar"]}>
        <ul>
          <li onClick={() => handleNavClick("DashBoard")}>
            <FontAwesomeIcon icon={faTachometerAlt} /> Dashboard
          </li>
          <li onClick={() => handleNavClick("BookManagement")}>
            <FontAwesomeIcon icon={faBook} /> Book Management
          </li>
          <li onClick={() => handleNavClick("BorrowedBooks")}>
            <FontAwesomeIcon icon={faClipboardList} /> Borrowed Books
          </li>
          <li onClick={() => handleNavClick("Reservations")}>
            <FontAwesomeIcon icon={faList} /> Reservations
          </li>
          <li onClick={() => handleNavClick("Fine")}>
            <FontAwesomeIcon icon={faDollarSign} /> Fine
          </li>
          <li onClick={() => handleNavClick("Genre")}>
            <FontAwesomeIcon icon={faTags} /> Genre
          </li>
          <li onClick={() => handleNavClick("Review")}>
            <FontAwesomeIcon icon={faStar} /> Review
          </li>
          <li onClick={() => handleNavClick("Event")}>
            <FontAwesomeIcon icon={faCalendarAlt} /> Event
          </li>
          <li onClick={() => handleNavClick("Members")}>
            <FontAwesomeIcon icon={faUsers} /> Members
          </li>         
          <li onClick={() => handleNavClick("Profile")}>
            <FontAwesomeIcon icon={faUser} /> Profile
          </li>
          <li onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} /> Logout
          </li>
        </ul>
      </nav>
      <div className={style["content-area"]}>
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;
