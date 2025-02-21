import { useNavigate } from "react-router-dom"

const LandingPage = () => {
  const navigate = useNavigate();

  const handleStartNewPractice = () => {
    navigate("/practice")
  }
  return (
    <div className="flex h-full items-center py-16">
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-4 md:gap-8 xl:gap-2 md:items-center">
          <div>
            <h1 className="block text-3xl font-bold text-gray-800 sm:text-4xl lg:text-6xl lg:leading-tight">Welcome to Popup Verbal Reasoning Challenge</h1>
            <p className="mt-3 text-lg text-gray-800">Sharpen Your Skills. Master the 11+ Verbal Reasoning Exam with AI-Powered Practice!</p>
            <div className="mt-7 grid gap-3 w-full sm:inline-flex" onClick={handleStartNewPractice}>
              <a className="py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-[#f1c40e] text-white hover:bg-[#e7c53b] focus:outline-none focus:bg-[#e7c53b] disabled:opacity-50 disabled:pointer-events-none" href="#">
                Start New Practice
                <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              </a>
            </div>
          </div>
          <div className="relative ms-4">
            <img className="w-full rounded-md" src="landing_image.png" alt="Hero Image" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage