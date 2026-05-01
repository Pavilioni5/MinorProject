import { signIn, auth, signOut } from "@/auth"
import CloudRecommender from "@/components/CloudRecommender"

export default async function Home() {
  const session = await auth()

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h1 className="text-3xl font-bold mb-4">Welcome to CloudRec</h1>
        <p className="mb-8 text-gray-600">Please sign in to access the Cloud Recommender</p>
        <form
          action={async () => {
            "use server"
            await signIn("google")
          }}
        >
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 transition-colors text-white font-medium rounded-lg shadow-md">
            Login with Google
          </button>
        </form>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-end p-4 bg-[#1a1a2e] text-white border-b border-gray-800">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-300">Signed in as {session.user?.name}</span>
          <form
            action={async () => {
              "use server"
              await signOut()
            }}
          >
            <button className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 transition-colors text-white text-sm rounded">
              Sign Out
            </button>
          </form>
        </div>
      </div>
      <CloudRecommender />
    </div>
  )
}