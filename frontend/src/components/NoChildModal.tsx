import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useNavigate } from "react-router-dom";

interface NoChildModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NoChildModal = ({ isOpen, onClose }: NoChildModalProps) => {
  const navigate = useNavigate();

  const handleRedirect = () => {
    onClose(); // Close the modal
    navigate("/manage-children"); // Redirect to the manage-children page
  };

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      as="div"
      className="relative z-200 focus:outline-none"
      onClose={() => {}}
    >
      <DialogBackdrop className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="w-full max-w-md rounded-xl bg-white p-6 backdrop-blur-2xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
          >
            {/* Modal Title */}
            <DialogTitle as="h3" className="text-base/7 font-medium text-black">
              No Child Details Found
            </DialogTitle>
            <hr className="border-gray-300 mb-4" />

            {/* Message */}
            <p className="text-sm text-gray-700 mb-4">
              To access the features of this platform, you need to add at least one child to your account. Please go to the Manage Children page to add a child.
            </p>

            {/* Buttons */}
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={handleRedirect}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Proceed
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default NoChildModal;