// components/SuccessModal.js
import { useRouter } from 'next/router';

const SuccessModal = ({ isOpen, onClose }) => {
  const router = useRouter();

  const handleClose = () => {
    // Your additional logic, if any, before redirecting
    // ...

    // Redirect to the index page
    router.push('/');
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-40">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black opacity-50"
          ></div>

          {/* Modal */}
          <div className="bg-white p-12 rounded-xl shadow-md text-center relative z-10 w-[400px]">
            <h2 className="text-black text-2xl font-bold mb-4">
              Thank you for registering your interest!
            </h2>
            <p className="text-gray-500">
              We appreciate your interest in our app. Your registration has been
              received, and we're excited to have you on board. We will keep you
              updated and notify you when the app becomes available.
            </p>
            <button
              className="px-3 py-4 mt-8 w-full flex justify-center hover:cursor-pointer hover:bg-indigo-600 bg-indigo-900 rounded-xl"
              onClick={handleClose}
            >
              DONE
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SuccessModal;
