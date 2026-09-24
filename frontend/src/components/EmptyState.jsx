import { Link } from 'react-router-dom';

const EmptyState = ({ message, actionText, actionLink, className = '' }) => {
  return (
    <div className={`card text-center text-muted p-6 ${className}`}>
      <p className={actionText ? "mb-4" : "mb-0"}>{message}</p>
      {actionText && actionLink && (
        <Link to={actionLink} className="btn btn-primary">{actionText}</Link>
      )}
    </div>
  );
};

export default EmptyState;
