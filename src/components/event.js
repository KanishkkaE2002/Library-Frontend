import React, { useEffect, useState } from "react";
import axios from "axios";
import {jwtDecode} from "jwt-decode";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  styled
} from "@mui/material";
import style from "./../style/event.module.css";

// Customized Delete and Edit Buttons
const DeleteButton = styled(Button)({
  backgroundColor: "#d53232", // Customize your delete button color here
  color: "#fff",
  "&:hover": {
    backgroundColor: "#d32f2f" // Hover color for delete button
  },
  marginRight: "8px", // Adds spacing between buttons
  textTransform: "none"
});

const EditButton = styled(Button)({
  backgroundColor: "#29b129", // Customize your edit button color here
  color: "#fff",
  "&:hover": {
    backgroundColor: "#105410" // Hover color for edit button
  },
  marginRight: "8px", // Adds spacing between buttons
  textTransform: "none"
});

const Event = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState();
  const [editIndex, setEditIndex] = useState(null);
  const [editableEvent, setEditableEvent] = useState({});
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    eventName: "",
    eventDate: "",
    description: "",
    timing: "",
  });
  const token = localStorage.getItem("token");
  let role = "";

  if (token) {
    const decodedToken = jwtDecode(token);
    role = decodedToken.role;
  }

  useEffect(() => {
    handleEvents();
  }, []);

  const handleEvents = async () => {
    try {
      const response = await axios.get(
        "https://localhost:7023/api/Event/upcoming",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvents(response.data);
    } catch (err) {
      setError("Error fetching events.");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://localhost:7023/api/Event/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      handleEvents();
    } catch (err) {
      setError("Error deleting event.");
      console.error(err);
    }
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setEditableEvent(events[index]);
  };

  const handleSave = async (id) => {
    try {
      await axios.put(`https://localhost:7023/api/Event/${id}`, editableEvent, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditIndex(null);
      handleEvents();
    } catch (err) {
      setError("Error saving event.");
      console.error(err);
    }
  };

  const handleCancel = () => {
    setEditIndex(null);
    setEditableEvent({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditableEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewEventChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddEvent = async () => {
    try {
      await axios.post("https://localhost:7023/api/Event", newEvent, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsPopupOpen(false);
      setNewEvent({
        eventName: "",
        eventDate: "",
        description: "",
        timing: "",
      });
      handleEvents();
    } catch (err) {
      setError("Error adding event.");
      console.error(err);
    }
  };

  return (
    <div className={style["event-container"]}>
      <h1 className="event-heading">Upcoming Events</h1>
      {role === "Admin" && (
        <div className={style["add-container"]}>
          <Button
  variant="contained"
  color="primary"
  onClick={() => setIsPopupOpen(true)}
  style={{ marginRight: '30px' }} // Add marginLeft here
>
  Add event
</Button>

        </div>
      )}
      <div className={style["event-content"]}>
        {events?.map((data, index) => (
          <div key={index} className={style["event-detail"]}>
            {editIndex === index ? (
              <>
                <div>
                  <TextField
                    placeholder="Event name"
                    type="text"
                    name="eventName"
                    value={editableEvent.eventName}
                    onChange={handleChange}
                    fullWidth
                  />
                </div>
                <div>
                  <TextField
                    type="date"
                    placeholder="Event date"
                    name="eventDate"
                    value={editableEvent.eventDate.split("T")[0]}
                    onChange={handleChange}
                    fullWidth
                  />
                </div>
                <div>
                  <TextField
                    placeholder="Event description"
                    name="description"
                    value={editableEvent.description}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={3}
                  />
                </div>
                <div>
                  <TextField
                    placeholder="Event timing"
                    type="text"
                    name="timing"
                    value={editableEvent.timing}
                    onChange={handleChange}
                    fullWidth
                  />
                </div>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleSave(editableEvent.eventID)}
                  style={{ marginTop: "8px" }}
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  style={{ marginTop: "8px", marginLeft: "8px" }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <div>
                  Event name: <span>{data.eventName}</span>
                </div>
                <div>
                  Date: <span>{data.eventDate}</span>
                </div>
                <div>
                  Description: <span>{data.description}</span>
                </div>
                <div>
                  Timing: <span>{data.timing}</span>
                </div>
                {role === "Admin" && (
                  <>
                    <DeleteButton
                      startIcon={<FontAwesomeIcon icon={faTrash} />}
                      onClick={() => handleDelete(data.eventID)}
                    >
                      Delete
                    </DeleteButton>
                    <EditButton
                      startIcon={<FontAwesomeIcon icon={faEdit} />}
                      onClick={() => handleEdit(index)}
                    >
                      Edit
                    </EditButton>
                  </>
                )}
              </>
            )}
          </div>
        ))}
      </div>
      {isPopupOpen && (
        <Dialog open={isPopupOpen} onClose={() => setIsPopupOpen(false)}>
          <DialogTitle>Add New Event</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              margin="normal"
              placeholder="Event Name"
              type="text"
              name="eventName"
              value={newEvent.eventName}
              onChange={handleNewEventChange}
            />
            <TextField
              fullWidth
              margin="normal"
              type="date"
              placeholder="Event Date"
              name="eventDate"
              value={newEvent.eventDate}
              onChange={handleNewEventChange}
            />
            <TextField
              fullWidth
              margin="normal"
              placeholder="Description"
              name="description"
              value={newEvent.description}
              onChange={handleNewEventChange}
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              margin="normal"
              placeholder="Timing"
              type="text"
              name="timing"
              value={newEvent.timing}
              onChange={handleNewEventChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsPopupOpen(false)}>Cancel</Button>
            <Button onClick={handleAddEvent} variant="contained" color="primary">
              Add Event
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default Event;
