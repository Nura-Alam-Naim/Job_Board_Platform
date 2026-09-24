const StatusBadge = ({ status, className = '', isUppercase = false }) => {
  if (!status) return null;
  
  return (
    <span className={`badge-status status-${status.toLowerCase()} ${isUppercase ? 'uppercase' : ''} ${className}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
