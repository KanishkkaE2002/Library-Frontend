import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faClock, faClipboardCheck } from '@fortawesome/free-solid-svg-icons';
import style from "./../style/reserve.module.css";
import {jwtDecode} from 'jwt-decode';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Pagination } from '@mui/material';

const Reservations = () => {
    const [reservations, setReservations] = useState([]);
    const [status, setStatus] = useState('All');
    const [errorMessage, setErrorMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bookID, setBookID] = useState('');
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelBookName, setCancelBookName] = useState('');
    const token = localStorage.getItem('token');
    const userID = localStorage.getItem('userId');
    const [isAdmin, setIsAdmin] = useState(false);
    const [unavailableBooks, setUnavailableBooks] = useState([]);
    const [activeReservations, setActiveReservations] = useState([]);

    let role = '';
    if (token) {
        const decodedToken = jwtDecode(token);
        role = decodedToken.role;
    }

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [totalReservations, setTotalReservations] = useState(0);

    useEffect(() => {
        if (role === 'Admin') setIsAdmin(true);
        fetchReservations();
        fetchUnavailableBooks();
        fetchActiveReservations();
    }, [status]);

    const fetchReservations = async () => {
        try {
            const config = { headers: { 'Authorization': `Bearer ${token}` }};
            let response;
            if (status === 'All') {
                response = await axios.get(role === 'Admin' ? 
                    'https://localhost:7023/api/Reservation' :
                    `https://localhost:7023/api/Reservation/user/${userID}`, config);
            } else {
                response = await axios.get(role === 'Admin' ? 
                    `https://localhost:7023/api/Reservation/status/${status}` : 
                    `https://localhost:7023/api/Reservation/status/${status}/user/${userID}`, config);
            }
            setErrorMessage('');
            setReservations(response.data);
            setTotalReservations(response.data.length);
        } catch (error) {
            setErrorMessage(error.response && error.response.status === 404 ? 
                'No reservations found' : 'An error occurred while fetching reservations');
            setReservations([]);
        }
    };

    const fetchUnavailableBooks = async () => {
        try {
            const config = { headers: { 'Authorization': `Bearer ${token}` }};
            const response = await axios.get('https://localhost:7023/api/Book/notavailable', config);
            setUnavailableBooks(response.data);
        } catch (error) {
            console.error('Error fetching unavailable books:', error);
        }
    };

    const fetchActiveReservations = async () => {
        try {
            const config = { headers: { 'Authorization': `Bearer ${token}` }};
            const response = await axios.get(`https://localhost:7023/api/Reservation/active/${userID}`, config);
            setActiveReservations(response.data);
        } catch (error) {
            console.error('Error fetching active reservations:', error);
        }
    };

    const handleStatusChange = (event) => {
        setStatus(event.target.value);
        setCurrentPage(1);
    };

    const handleAddReservation = async (event) => {
        event.preventDefault();
        try {
            const config = { headers: { 'Authorization': `Bearer ${token}` }};
            await axios.post('https://localhost:7023/api/Reservation', { UserID: userID, BookName: bookID }, config);
            toast.success('Reservation created successfully!');
            setIsModalOpen(false);
            setBookID('');
            fetchReservations();
        } catch (error) {
            toast.error('Failed to add reservation');
        }
    };

    const handleCancelReservation = async (event) => {
        event.preventDefault();
        try {
            const config = { headers: { 'Authorization': `Bearer ${token}` }};
            await axios.post(`https://localhost:7023/api/Reservation/cancel?BookName=${cancelBookName}&UserID=${userID}`, null, config);
            toast.success('Reservation cancelled successfully!');
            setIsCancelModalOpen(false);
            fetchReservations();
        } catch (error) {
            toast.error('An error occurred while cancelling the reservation');
        }
    };

    const renderStatusIcon = (reservationStatus) => {
        const icons = {
            'Completed': { icon: faCheckCircle, color: 'green' },
            'Approved': { icon: faClipboardCheck, color: 'blue' },
            'Cancelled': { icon: faTimesCircle, color: 'red' },
            'Active': { icon: faClock, color: 'orange' },
        };
        return icons[reservationStatus] ? (
            <FontAwesomeIcon icon={icons[reservationStatus].icon} style={{ color: icons[reservationStatus].color }} />
        ) : null;
    };

    const indexOfLastReservation = currentPage * itemsPerPage;
    const indexOfFirstReservation = indexOfLastReservation - itemsPerPage;
    const currentReservations = reservations.slice(indexOfFirstReservation, indexOfLastReservation);
    const totalPages = Math.ceil(totalReservations / itemsPerPage);

    const handlePageChange = (event, value) => setCurrentPage(value);

    return (
        <div className="container">
            <ToastContainer position="top-right" autoClose={3000} />

            <h2>Reservations</h2>
            {role !== 'Admin' && (
                <div>
                    <button className={style["add-button"]} onClick={() => setIsModalOpen(true)}>Add Reservation</button>
                    <button className={style["cancel-button"]} onClick={() => setIsCancelModalOpen(true)}>Cancel Reservation</button>
                </div>
            )}
            
            {isModalOpen && (
                <div className={style["modal"]}>
                    <div className={style["modal-content"]}>
                        <span className={style["close"]} onClick={() => setIsModalOpen(false)}>&times;</span>
                        <h2>Add Reservation</h2>
                        <form onSubmit={handleAddReservation}>
                            <label htmlFor="bookID">Book Name:</label>
                            <select name="bookID" value={bookID} onChange={(e) => setBookID(e.target.value)} required>
                                <option value="">Select a Book</option>
                                {unavailableBooks.map(book => (
                                    <option key={book.id} value={book.title}>{book.title}</option>
                                ))}
                            </select>
                            <button type="submit">Create Reservation</button>
                        </form>
                    </div>
                </div>
            )}

            {isCancelModalOpen && (
                <div className={style["modal"]}>
                    <div className={style["modal-content"]}>
                        <span className={style["close"]} onClick={() => setIsCancelModalOpen(false)}>&times;</span>
                        <h2>Cancel Reservation</h2>
                        <form onSubmit={handleCancelReservation}>
                            <label htmlFor="cancelBookName">Book Name:</label>
                            <select name="cancelBookName" value={cancelBookName} onChange={(e) => setCancelBookName(e.target.value)} required>
                                <option value="">Select a Book</option>
                                {activeReservations.map(reservation => (
                                    <option key={reservation.reservationID} value={reservation.bookTitle}>{reservation.bookTitle}</option>
                                ))}
                            </select>
                            <button type="submit">Cancel Reservation</button>
                        </form>
                    </div>
                </div>
            )}

            <div style={{ textAlign: "center", marginTop: "40px" }}>
                <label htmlFor="status">Filter by Status: </label>
                <select id="status" value={status} onChange={handleStatusChange}>
                    <option value="All">All</option>
                    <option value="Active">Active</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Approved">Approved</option>
                    <option value="Completed">Completed</option>
                </select>
            </div>

            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

            <table border="1" cellPadding="10" cellSpacing="0" className={style.table}>
                <thead>
                    <tr>
                        <th>User Name</th>
                        <th>Book Title</th>
                        <th>Reservation Date</th>
                        <th>Status</th>
                        <th>Queue Position</th>
                    </tr>
                </thead>
                <tbody>
                    {currentReservations.length > 0 ? (
                        currentReservations.map((reservation) => (
                            <tr key={reservation.reservationID}>
                                <td>{reservation.userName}</td>
                                <td>{reservation.bookTitle}</td>
                                <td>{new Date(reservation.reservationDate).toLocaleDateString()}</td>
                                <td>{renderStatusIcon(reservation.reservationStatus)} {reservation.reservationStatus}</td>
                                <td>{reservation.queuePosition}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5">No reservations found</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className={style["pagination-container"]}>
                <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    variant="outlined"
                    shape="rounded"
                    color="primary"
                    className={style["pagination"]}
                />
            </div>
        </div>
    );
};

export default Reservations;
