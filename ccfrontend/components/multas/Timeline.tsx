export const Timeline = ({ activities }) => {
  return (
    <div className='timeline'>
      {activities.map(activity => (
        <div key={activity.id} className={`timeline-item ${activity.type}`}>
          <div className='timeline-content'>{/* Contenido del mockup */}</div>
        </div>
      ))}
    </div>
  );
};
