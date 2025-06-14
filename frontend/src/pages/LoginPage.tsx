import { Link, useNavigate } from "react-router-dom";
import { Bounce, toast } from "react-toastify";
import UserApi from "../api/UserApi";
import { User } from "../types/UserTypes";
import { useAuth } from "../hooks/useAuth";
import { useChildrenList } from "../hooks/useChildrenList";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { getChildrenList } = useChildrenList();

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    console.log(email, password);
    try {
      const response = await UserApi.login(email, password);
      console.log(response);
      
      const user : User = {
        userId: response.userId,
        username: response.username,
        email: response.email,
        role_id: response.role_id,
      }
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', response.token);
      
      login(user);
      getChildrenList();
      navigate("/");
    } catch (error) {
      toast.error('Login Failed!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      console.error(error);
    }
  };

  return (
    <div className="flex flex-grow items-center py-16">
      <div className="w-full max-w-md mx-auto p-6">
        <div className="mt-7 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="p-4 sm:p-7">
            <div className="text-center">
              <h1 className="block text-2xl font-bold text-gray-800">Sign in</h1>

            </div>
            <div className="mt-5">
              <form onSubmit={handleSignIn}>
                <div className="grid gap-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm mb-2">
                      Email address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        autoComplete="email"
                        className="py-3 px-4 block w-full rounded-md bg-white text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
                      />
                    </div>

                  </div>
                  <div>
                    <div className="flex justify-between items-center">
                      <label htmlFor="password" className="block text-sm mb-2">
                        Password
                      </label>
                      <Link
                        className=" text-sm text-blue-600 decoration-2 hover:underline focus:outline-none focus:underline font-medium mb-2"
                        to="/forgot-password"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        type="password"
                        id="password"
                        name="password"
                        required
                        className="py-3 px-4 block w-full rounded-md bg-white text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"

                      />
                      <div className="hidden absolute inset-y-0 end-0 pointer-events-none pe-3">
                        <svg
                          className="size-5 text-red-500"
                          width="16"
                          height="16"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                          aria-hidden="true"
                        >
                          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
                        </svg>
                      </div>
                    </div>
                    <p
                      className="hidden text-xs text-red-600 mt-2"
                      id="password-error"
                    >
                      8+ characters required
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    Sign in
                  </button>
                  <div className="flex flex-col items-center">
                    <p className="mt-2 text-sm text-gray-600">
                      Don't have an account yet?{" "}
                      <Link
                        className="text-blue-600 decoration-2 hover:underline focus:outline-none focus:underline font-medium"
                        to="/signup"
                      >
                        Sign up
                      </Link>
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
