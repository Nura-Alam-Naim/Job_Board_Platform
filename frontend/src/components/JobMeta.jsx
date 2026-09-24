import { MapPin, Briefcase, Clock, Building, Calendar, AlertCircle } from 'lucide-react';

const JobMeta = ({ location, salaryMin, salaryMax, jobType, companyName, createdAt, deadline, useCalendar = false, iconSize = 16, className = '' }) => {
  return (
    <div className={`flex flex-wrap gap-4 text-muted ${className}`}>
      {companyName && (
        <span className="flex items-center gap-2">
          <Building size={iconSize} /> {companyName}
        </span>
      )}
      {location !== undefined && (
        <span className="flex items-center gap-2">
          <MapPin size={iconSize} /> {location || 'Remote'}
        </span>
      )}
      {jobType && (
        <span className="flex items-center gap-2">
          <Briefcase size={iconSize} /> {jobType}
        </span>
      )}
      {salaryMin !== undefined && salaryMax !== undefined && (
        <span className="flex items-center gap-2">
          <Briefcase size={iconSize} /> Tk {salaryMin} - Tk {salaryMax}
        </span>
      )}
      {createdAt && (
        <span className="flex items-center gap-2">
          {useCalendar ? <Calendar size={iconSize} /> : <Clock size={iconSize} />} 
          {useCalendar ? 'Posted ' : ''}{new Date(createdAt).toLocaleDateString()}
        </span>
      )}
      {deadline && (
        <span className="flex items-center gap-2 text-warning font-medium">
          <AlertCircle size={iconSize} /> Deadline: {new Date(deadline).toLocaleDateString()}
        </span>
      )}
    </div>
  );
};

export default JobMeta;
