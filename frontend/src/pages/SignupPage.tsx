import { FormEvent, useState } from "react";
import AddChildModal from "../components/AddChildModal";
import { Link } from "react-router-dom";

interface Child {
  name: string;
  age: number;
}

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [children, setChildren] = useState<Child[]>([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddChild = (child: Child) => {
    setChildren([...children, child]);
  };

  const handleRemoveChild = (index: number) => {
    const newChildren = children.filter((_, i) => i !== index);
    setChildren(newChildren);
  };

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(name, email, children, password, confirmPassword);
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    console.log(JSON.stringify({ name, email, children, password }));

    try {
      const response = await fetch("http://localhost:8000/api/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, children, password }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data);
      } else {
        console.error("Sign up failed");
      }
    } catch (error) {
      console.error("Sign up failed", error);
    }
  };

  return (
    <div className="flex h-full items-center py-16">
      <div className="w-full max-w-md mx-auto p-6">
        <div className="mt-7 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="p-4 sm:p-7">
            <div className="text-center">
              <h1 className="block text-2xl font-bold text-gray-800">Create Account</h1>

            </div>
            <div className="mt-5">
              <form onSubmit={handleSignUp}>
                <div className="grid gap-y-4">
                  <div>
                    <label className="block text-sm mb-2">
                      Name
                    </label>
                    <div className="relative">
                      <input
                        type="name"
                        name="name"
                        required
                        autoComplete="name"
                        value={name}
                        autoFocus
                        onChange={(e) => setName(e.target.value)}
                        className="py-3 px-4 block w-full rounded-md bg-white text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-2">
                      Email address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="py-3 px-4 block w-full rounded-md bg-white text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center">
                      <label className="block text-sm mb-2">
                        Child Details
                      </label>
                      <button
                        type="button"
                        className={`text-sm text-blue-600 decoration-2 ${children.length < 3 ? 'hover:underline' : 'disabled:text-gray-400'} focus:outline-none focus:underline font-medium mb-2`}
                        onClick={() => setIsModalOpen(true)}
                        disabled={children.length >= 3}
                      >
                        Add Child
                      </button>
                    </div>
                    <hr className="border-gray-300" />
                    <div className="p-4">
                      {children.length === 0 && (
                        <p className="text-sm text-gray-400">No children added yet</p>
                      )}
                      {
                        children.map((child, index) => (
                          <div key={index}>
                            <div className="flex gap-x-4 justify-between">
                              <div className="flex flex-col">
                                <p className="text-sm">{child.name}</p>
                                <p className="text-xs">Age: {child.age}</p>
                              </div>
                              <button onClick={() => handleRemoveChild(index)} type="button" className="p-2 h-min items-center gap-x-2 text-xs rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none">
                                Remove
                              </button>
                            </div>
                            {index != children.length - 1 && <hr className="border-gray-300 my-2" />}
                          </div>
                        ))
                      }
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        name="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="py-3 px-4 block w-full rounded-md bg-white text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"

                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        name="confirm-password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="py-3 px-4 block w-full rounded-md bg-white text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"

                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    Sign Up
                  </button>
                  <div className="flex flex-col items-center">
                    <p className="mt-2 text-sm text-gray-600">
                      Already have an account?{" "}
                      <Link
                        className="text-blue-600 decoration-2 hover:underline focus:outline-none focus:underline font-medium"
                        to="/login"
                      >
                        Sign In
                      </Link>
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <AddChildModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddChild={handleAddChild} />
    </div>
  );
};

export default SignupPage;
