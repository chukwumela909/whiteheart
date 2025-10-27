import Link from 'next/link'

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="font-dancing text-5xl text-black mb-8">whiteheart</h1>
        <h2 className="text-2xl font-simon font-extrabold mb-4">
          Authentication Error
        </h2>
        <p className="text-gray-600 mb-6 font-simon">
          Sorry, we couldn't verify your authentication code. Please try signing in again.
        </p>
        <Link
          href="/auth/signin"
          className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-simon font-semibold"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  )
}
