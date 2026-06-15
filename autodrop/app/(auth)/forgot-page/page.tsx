const ForgotPasswordPage = () => {
    return (
        <section className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
                    Forgot Password
                </h1>
                <p className="text-center text-gray-600 mb-6">
                    Enter your email address and we’ll send you a link to reset your password.
                </p>
                <form className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700"> Email Address </label>
                        <input type="email" id="email" name="email" placeholder="Enter your email" className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300 cursor-pointer">
                        Send Reset Link
                    </button>
                </form>
                <p className="text-center text-sm text-gray-600 mt-4">
                    <a href="/login" className="text-blue-600 hover:underline">
                        Back to Login
                    </a>
                </p>
            </div>
        </section>
    );
};

export default ForgotPasswordPage;