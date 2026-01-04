import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="p-4 text-center">
        <h1 className="text-3xl font-bold underline text-orange-500">
          Mini Roulette
        </h1>
        <div className="card mt-4">
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => setCount((count) => count + 1)}
          >
            count is {count}
          </button>
        </div>
      </div>
    </>
  )
}

export default App
