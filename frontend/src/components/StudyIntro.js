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
        <p className="text-gray-700 mb-4">
          This study is designed to be completed in one sitting and will take about <strong>30 minutes</strong> of your time.
          Please note that <strong>there is no way to pause or save progress</strong>.
        </p>

        <div className="text-left text-gray-700 mb-6">
          <p className="font-semibold mb-2">The study includes three stages:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>
              <strong>Personality Test</strong> — A short questionnaire to assess your personality traits.
            </li>
            <li>
              <strong>Task Completion</strong> — You will be given several tasks to complete by interacting with ChatGPT.
              - Click <em>"Show Description"</em> to view detailed instructions for each task.
              - After submitting a task, proceed directly to the next one.
              - For image generation tasks, allow a short waiting period for results to appear before moving on.
            </li>
            <li>
              <strong>Post-Study Questionnaire</strong> — A brief survey to share your experience and feedback.
            </li>
          </ol>
        </div>

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
