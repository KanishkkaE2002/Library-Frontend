import React, { useEffect, useState } from "react";
import style from './../style/review.module.css';
import axios from "axios";
import { jwtDecode } from 'jwt-decode';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPen } from "@fortawesome/free-solid-svg-icons";
import Rating from "react-rating-stars-component";
import { Dialog, DialogTitle, DialogContent, IconButton, Button, TextField, Select, MenuItem } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const Review = () => {
  const token = localStorage.getItem("token");
  let role = "";
  const currUserId = localStorage.getItem('userId');

  if (token) {
    const decodedToken = jwtDecode(token);
    role = decodedToken.role;
  }

  const [error, setError] = useState();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    BookID: "",
    UserID: currUserId || "",
    description: "",
    rating: "",
  });
  const [reviews, setReviews] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchReview();
    fetchAllBooks();
  }, []);

  const fetchReview = async () => {
    try {
      const response = await axios.get("https://localhost:7023/api/Review", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(response.data);
    } catch (err) {
      setError("Error fetching reviews.");
      console.error(err);
    }
  };

  const fetchAllBooks = async () => {
    try {
      const response = await axios.get('https://localhost:7023/api/Book', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setAllBooks(response.data);
    } catch (error) {
      console.error("Error fetching all books: ", error);
      setError("Error fetching books.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://localhost:7023/api/Review/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchReview();
    } catch (err) {
      setError("Error deleting review.");
      console.error(err);
    }
  };

  const handleNewReview = (e) => {
    const { name, value } = e.target;
    setNewReview((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddReview = async () => {
    try {
      await axios.post("https://localhost:7023/api/Review", newReview, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsPopupOpen(false);
      setNewReview({
        BookID: "",
        UserID: currUserId || "",
        description: "",
        rating: "",
      });
      fetchReview();
    } catch (err) {
      setError("Error adding review.");
      console.error(err);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredReviews = reviews.filter((review) =>
    review.bookTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={style['review-container']}>
  <TextField
    placeholder="Search by Book Name"
    value={searchTerm}
    onChange={handleSearchChange}
    size="small"
    className={style['search-input']}
    sx={{ marginBottom: '20px' }} // Add margin bottom here
  />

  {role === "User" && (
    <div className={style["add-container"]}>
      <div className={style.add} onClick={() => setIsPopupOpen(true)} style={{ marginRight: "30px" }}>
        <FontAwesomeIcon icon={faPen} /> &nbsp; Write your review
      </div>
    </div>
  )}

  <div className={style['review-content']}>
    {filteredReviews.map((data, index) => (
      <div
        key={index}
        className={`${style['review-box']} ${style[`rating-${data.rating}`]}`}
        style={{ marginRight: '2px',  marginLeft: '7px' }}
      >
        <div>Book : {data.bookTitle}</div>
        <div>Description : {data.description}</div>
        <div>
          Ratings :
          <Rating
            count={5}
            value={data.rating}
            edit={false}
            size={24}
            activeColor="#ffd700"
          />
        </div>
        <div>Date : {data.reviewDate}</div>
        {role === "Admin" && (
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => handleDelete(data.reviewID)}
            startIcon={<FontAwesomeIcon icon={faTrash} />}
            sx={{ minWidth: '0', padding: '4px 8px' }}
          >
            Delete
          </Button>
        )}
      </div>
    ))}
  </div>

  <Dialog open={isPopupOpen} onClose={() => setIsPopupOpen(false)} maxWidth="sm" fullWidth>
    <DialogTitle>
      Add New Review
      <IconButton
        aria-label="close"
        onClick={() => setIsPopupOpen(false)}
        style={{ position: 'absolute', right: 8, top: 8 }}
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent dividers>
      <Select
        fullWidth
        name="BookID"
        value={newReview.BookID}
        onChange={handleNewReview}
        displayEmpty
      >
        <MenuItem value=""><em>Select a Book</em></MenuItem>
        {allBooks.map((book) => (
          <MenuItem key={book.bookID} value={book.bookID}>
            {book.title}
          </MenuItem>
        ))}
      </Select>

      <TextField
        multiline
        rows={4}
        fullWidth
        variant="outlined"
        placeholder="Write your review here..."
        name="description"
        value={newReview.description}
        onChange={handleNewReview}
        margin="normal"
      />

      <Rating
        count={5}
        size={24}
        activeColor="#ffd700"
        value={newReview.rating}
        onChange={(newRating) => setNewReview({ ...newReview, rating: newRating })}
      />

      <Button
        variant="contained"
        color="primary"
        fullWidth
        style={{ marginTop: "15px" }}
        onClick={handleAddReview}
      >
        Add Review
      </Button>
    </DialogContent>
  </Dialog>
</div>

  );
};

export default Review;
