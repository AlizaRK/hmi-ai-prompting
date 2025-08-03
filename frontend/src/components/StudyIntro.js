import { useNavigate } from "react-router-dom";

export default function StudyIntro() {
  const navigate = useNavigate();

  const handleProceed = () => {
    navigate("/personality-test"); // Or whatever your actual task route is
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-lg text-center">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Welcome to the Study</h2>
        <p className="text-gray-700 mb-6">
          This study is designed to be completed in one sitting and will take about <strong>30 minutes</strong> of your time.
          Please note that <strong>there is no way to pause or save progress</strong>.
        </p>
        <button
          onClick={handleProceed}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Proceed
        </button>
      </div>
    </div>
  );
}
