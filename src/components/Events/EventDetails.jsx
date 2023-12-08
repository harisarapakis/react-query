import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import LoadingIndicator from '../UI/LoadingIndicator';
import ErrorBlock from '../UI/ErrorBlock';
import Header from '../Header.jsx';
import { useMutation, useQuery } from '@tanstack/react-query'
import { deleteEvent, fetchEvent, queryClient } from '../../util/http.js'
import { useState } from 'react';
import  Modal  from '../UI/Modal.jsx'
export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState();
  const params = useParams();
  const navigate = useNavigate();
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id })
  });

  const { mutate, isPending: isPendingDeletion, isError: isErrorDeleting, error: isErrori } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['events'],
        refetchType: 'none'
      })
      navigate('/events');
    }
  })

  function handleDelete() {
    mutate({ id: params.id })
  }

  function handleStartDelete() {
    setIsDeleting(true);
  }

  function handleStopDelete() {
    setIsDeleting(false);
  }

  let content;

  if (isPending) {
    content = <LoadingIndicator />
  }

  if (isError) {
    content = <ErrorBlock title="An error occurred"
      message={error.info?.message || 'Failed to fetch events'} ></ErrorBlock>
  }

  if (data) {
    const formattedDate = new Date(data.date).toLocaleDateString('en-Us', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
    content =
      <>
        <header>
          <h1>{data.titile}</h1>
          <nav>
            <button onClick={handleStartDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>

        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>{formattedDate} @ {data.time}</time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </>

  }

  return (
    <>
      {isDeleting && (
        <Modal onClose={handleStopDelete}>
          <h2>Are you sure?</h2>
          <p>Do you realy want to delete the event ?</p>
          <div className='form-actions'>
            {isPendingDeletion && <p>Deleting... Please wait...</p>}
            {!isPendingDeletion && (
              <>
              <button onClick={handleStopDelete} className='button-text'>Cancel</button>
              <button onClick={handleDelete} className='button'>Delete</button>
              </>
            )}
            
          </div>
          {isErrorDeleting && <ErrorBlock title='failed to delete event' message='failed re'></ErrorBlock>}
        </Modal>
      )}
      
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details"></article>
      {content}
    </>
  );
}
