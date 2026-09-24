import { useEffect, useState } from 'react'
import './App.css'
import { CountButton } from './components/CountButton'
import { getPosts } from './api/getPosts'
import { useUser } from './contexts/useUser'

function App() {
  const [count, setCount] = useState(0)
  const [toggle, setToggle] = useState(false)

  const { user, setUser } = useUser()

  useEffect(() => {
    console.log('user', user)
  }, [user])

  useEffect(() => {
    getPosts().then((data) => {
      console.log('data', data)
    })
  }, [toggle, count])

  return (
    <>
      <section id="center">
        <CountButton 
          count={count} 
          onCount={() => setCount(count + 1)} 
        />
        <button onClick={() => setToggle(!toggle)}>Toggle</button>
        <button onClick={() => setUser('John Doe')}>Set User</button>
      </section>
    </>
  )
}

export default App
