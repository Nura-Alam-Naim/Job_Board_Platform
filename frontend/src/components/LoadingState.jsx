const LoadingState = ({ message = "Loading..." }) => (
  <div className="text-center mt-8 text-muted">
    <p>{message}</p>
  </div>
);

export default LoadingState;
