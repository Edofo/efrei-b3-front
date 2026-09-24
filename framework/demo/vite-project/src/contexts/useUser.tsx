import { createContext, useContext, useState } from "react"

type UserContextType = {
    user: string | null
    setUser: (user: string | null) => void
}

const UserContext = createContext<UserContextType>({
    user: null,
    setUser: () => {}
})

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<string | null>(null)

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => {
    const context = useContext(UserContext)
    if (!context) {
        throw new Error('useUser must be used within a UserProvider')
    }
    return context
}

// export const getPosts = async () => {
//     const response = await fetch("https://jsonplaceholder.typicode.com/posts");
//     return response.json();
//   };
  

