import { signIn, auth, signOut } from "@/auth"
import CloudRecommender from "@/components/CloudRecommender"
import LandingPage from "@/components/LandingPage"

export default async function Home() {
  let session = null
  try {
    session = await auth()
  } catch (e) {
    // DB may be unreachable — show landing page
    console.error("Auth error:", e.message)
  }

  if (!session) {
    return (
      <LandingPage
        signInAction={async () => {
          "use server"
          await signIn("google")
        }}
        signUpAction={async () => {
          "use server"
          await signIn("google")
        }}
      />
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