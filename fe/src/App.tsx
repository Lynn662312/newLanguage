import { BrowserRouter, Routes, Route } from "react-router-dom"
import Landing from "./pages/Landing"
import Practice from "./pages/Practice"
import Feedback from "./pages/Feedback"
import Header from "./components/Header"
import Footer from "./components/Footer"

const App = () => (
  <BrowserRouter>
    <div className="flex flex-col min-h-screen pt-16 bg-transparent">
      <Header />
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/feedback" element={<Feedback />} />
        </Routes>
      </main>
      <Footer />
    </div>
  </BrowserRouter>
)

export default App
