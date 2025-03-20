import { MoonLoader } from "react-spinners";

interface LoaderProps {
  loading: boolean;
}

const Loader = ({ loading }: LoaderProps) => {
  if (!loading) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-20">
      <MoonLoader
        size={50}
        color="#b8860b"
        loading={loading}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </div>
  );
}

export default Loader;